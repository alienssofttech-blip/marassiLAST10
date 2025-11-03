const { createClient } = require('@supabase/supabase-js');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: name, email, message' }),
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' }),
      };
    }

    if (name.length > 100 || email.length > 100 || message.length > 5000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Field length exceeded maximum allowed' }),
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials. Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Server configuration error. Please contact administrator.',
          details: 'Supabase credentials not configured in Netlify environment variables'
        }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const ipAddress = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    const userAgent = event.headers['user-agent'] || 'unknown';

    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          message: message.trim(),
          ip_address: ipAddress,
          user_agent: userAgent,
          status: 'new',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to save message. Please try again.' }),
      };
    }

    await sendEmailNotification(name, email, message, data.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'تم إرسال الرسالة بنجاح! سنعاود الاتصال بك قريباً.',
        id: data.id,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
    };
  }
};

async function sendEmailNotification(name, email, message, messageId) {
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
      subject: `New Contact Form Message from ${name}`,
      reply_to: email,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #e0e0e0; }
            .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea; min-height: 100px; }
            .footer { background: #f0f0f0; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
            .button { display: inline-block; background: #667eea; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">رسالة جديدة من موقع مراسي  واصل معنا</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">مؤسسة مراسي التوصيل للخدمات اللوجستية</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">الاسم:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">البريد الإلكتروني:</div>
                <div class="value"><a href="mailto:${email}" style="color: #667eea;">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">الرسالة:</div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0 0 10px 0; color: #666;"><strong>معرّف الرسالة:</strong> ${messageId}</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>تاريخ الاستلام:</strong> ${new Date().toLocaleString()}</p>
                <a href="mailto:${email}?subject=Re: Your inquiry to MARASSI Logistics" style="color: #fffefeff; " class="button">الرد على ${name}</a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0;">هذا إشعار تلقائي من تواصل معنا في موقع مراسي</p>
              <p style="margin: 5px 0 0 0;">للرد، انقر على الزر أعلاه أو راسل مباشرة إلى: ${email}</p>
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
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
