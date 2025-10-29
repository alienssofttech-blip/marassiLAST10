const { createClient } = require('@supabase/supabase-js');
const Busboy = require('busboy');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Helper to parse multipart/form-data using Busboy from Netlify event
function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType) return resolve({ fields: {}, files: [] });

    const bb = Busboy({ headers: { 'content-type': contentType } });
    const fields = {};
    const files = [];

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const chunks = [];
      file.on('data', data => chunks.push(data));
      file.on('end', () => {
        files.push({ fieldname, filename, content: Buffer.concat(chunks), mimetype });
      });
    });

    bb.on('error', err => reject(err));
    bb.on('finish', () => resolve({ fields, files }));

    // event.body may be base64 encoded
    const encoding = event.isBase64Encoded ? 'base64' : 'utf8';
    const body = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    bb.end(body);
  });
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Temporary debug logs: method and content-type to help diagnose 4xx/5xx
  try {
    const incomingCT = event.headers['content-type'] || event.headers['Content-Type'] || null;
    console.log('register-driver invoked', {
      method: event.httpMethod,
      contentType: incomingCT,
      isBase64Encoded: !!event.isBase64Encoded,
      path: event.path || null
    });
  } catch (e) {
    console.warn('Failed to log incoming request metadata', e && e.message);
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Setup Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    let fields = {};
    let files = [];

    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    if (contentType.includes('multipart/form-data')) {
      ({ fields, files } = await parseMultipart(event));
      console.log('Parsed multipart request', { fieldCount: Object.keys(fields).length, fileCount: files.length });
    } else {
      // Expect JSON body
      try {
        fields = JSON.parse(event.body || '{}');
        console.log('Parsed JSON body', { fieldCount: Object.keys(fields).length });
      } catch (err) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
      }
    }

    // Map fields to expected names for backward compatibility
    const name = (fields.full_name || fields.name || fields.fullName || '').trim();
    const rawPhoneField = (fields.phone_e164 || fields.phone || fields.phone_local || '').toString().trim();
  const email = (fields.email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const notes = (fields.notes || fields.message || '').toString().trim();
    const sponsorPhone = (fields.sponsor_phone || '').toString().trim();
    const city = (fields.city || '').toString().trim();
    const vehicleType = (fields.vehicle_type || fields.vehicle || '').toString().trim();
    const submittedAt = fields.submitted_at || null;
    const agreeRaw = (fields.agree_terms || fields.agree || '').toString().trim();
    const agreeTerms = (agreeRaw === 'on' || agreeRaw === 'true' || agreeRaw === '1');

    // Basic validation: require name, phone and email; agree_terms is required by the client form
    if (!name || !rawPhoneField) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: name, phone' }),
      };
    }

    if (!agreeTerms) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'You must agree to terms and privacy policy' }),
      };
    }

    if (!email || !emailRegex.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing or invalid email' }) };
    }

    // Normalize phone to local digits then validate
    const normalizedPhone = rawPhoneField.replace(/[\s\-\(\)\+]/g, '').replace(/^966|^0|^00966/, '');
    const saudiPhoneRegex = /^5\d{8}$/;
    if (!saudiPhoneRegex.test(normalizedPhone)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid Saudi phone number format' }) };
    }

    // prefer existing E.164 if provided, otherwise construct it
    let phoneE164 = (fields.phone_e164 || '').toString().trim();
    if (!phoneE164) phoneE164 = `+966${normalizedPhone}`;

    // Upload files (if any) to Supabase Storage
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'driver-uploads';
    const uploadedUrls = {};
    for (const f of files) {
      try {
        const safeName = `${Date.now()}_${f.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const path = `registrations/${safeName}`;
        const upload = await supabase.storage.from(bucket).upload(path, f.content, { contentType: f.mimetype });
        if (upload.error) {
          console.warn('Supabase storage upload error:', upload.error);
          continue;
        }
        const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
        uploadedUrls[f.fieldname] = publicUrl;
      } catch (err) {
        console.error('Upload error for file', f.filename, err);
      }
    }

    // Insert record into DB
    const ipAddress = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    const userAgent = event.headers['user-agent'] || 'unknown';

    const insertPayload = {
      name,
      phone: phoneE164,                // store canonical E.164
      phone_local: normalizedPhone,
      phone_e164: phoneE164,
      sponsor_phone: sponsorPhone || null,
      email: email || null,
      message: notes || null,
      notes: notes || null,
      city: city || null,
      vehicle_type: vehicleType || null,
      agree_terms: agreeTerms,
      submitted_at: submittedAt || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: 'new',
      id_document_url: uploadedUrls['id_document'] || null,
      license_document_url: uploadedUrls['license_document'] || null,
      vehicle_registration_url: uploadedUrls['vehicle_registration'] || null,
      profile_photo_url: uploadedUrls['profile_photo'] || null,
    };

    const { data, error } = await supabase
      .from('driver_registrationss')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to save registration. Please try again.' }) };
    }

  // Use defined variables: phoneE164 (canonical phone) and notes (message/notes from the form)
  await sendDriverEmailNotification(name, phoneE164, email, notes, data.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'تم إرسال طلب الانضمام بنجاح! سنتواصل معك قريباً لمناقشة الخطوات التالية.', id: data.id }),
    };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }) };
  }
};

async function sendDriverEmailNotification(name, phone, email, message, registrationId) {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.warn('⚠️ Resend API key not configured. Email notification skipped.');
      console.warn('To enable emails: Add RESEND_API_KEY to Netlify environment variables');
      console.warn('Get your key at: https://resend.com/api-keys');
      return false;
    }

    const ADMIN_EMAIL = 'alienssoft.tech@gmail.com';
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'MARASSI Logistics <onboarding@resend.dev>';

    const emailBody = {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Driver Registration: ${name}`,
      reply_to: email,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #13164f 0%, #1e3a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #13164f; margin-bottom: 5px; }
            .value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #e0e0e0; }
            .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #13164f; min-height: 100px; }
            .footer { background: #f0f0f0; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
            .button { display: inline-block; background: #13164f; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
            .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🚗 New Driver Registration</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">MARASSI Transport & Logistics</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Driver Name:</div>
                <div class="value"><strong>${name}</strong></div>
              </div>
              <div class="field">
                <div class="label">Phone Number:</div>
                <div class="value"><a href="tel:${phone}" style="color: #13164f;">${phone}</a></div>
              </div>
              <div class="field">
                <div class="label">Email Address:</div>
                <div class="value"><a href="mailto:${email}" style="color: #13164f;">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Introduction / Why Join:</div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Registration ID:</strong> <span class="highlight">${registrationId}</span></p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Submitted:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })} (Riyadh Time)</p>
                <div style="margin-top: 15px;">
                  <a href="mailto:${email}?subject=Re: Your driver application with MARASSI Logistics" style="color: #fffefeff; " class="button">Replay To ${name}</a>
                  <a href="tel:${phone}" class="button" style="background: #059669; margin-left: 10px; color: #fffefeff;">Call Driver</a>
                </div>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0;"><strong>Driver Registration System</strong></p>
              <p style="margin: 5px 0 0 0;">This driver wants to join the MARASSI team. Please review and contact them soon!</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Driver registration email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending driver registration email:', error);
    return false;
  }
}
