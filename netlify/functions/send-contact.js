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
      console.error('Missing Supabase credentials');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
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
        message: 'Message sent successfully! We will get back to you soon.',
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
    const RESEND_API_KEY = process.env.RESEND_API_KEY || 'lQbyJfvIWW8M3atM:57802454:7282847';
    const ADMIN_EMAIL = 'alienssoft.tech@gmail.com';
    const FROM_EMAIL = 'noreply@marassi.com';

    const emailBody = {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Contact Form Message from ${name}`,
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
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Contact Form Message</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">MARASSI Transport & Logistics</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}" style="color: #667eea;">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Message ID:</strong> ${messageId}</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Received:</strong> ${new Date().toLocaleString()}</p>
                <a href="mailto:${email}?subject=Re: Your inquiry to MARASSI Logistics" class="button">Reply to ${name}</a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0;">This is an automated notification from your website contact form.</p>
              <p style="margin: 5px 0 0 0;">To reply, click the button above or email directly to: ${email}</p>
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
