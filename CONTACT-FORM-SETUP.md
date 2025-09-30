# Contact Form Email Setup - Final Steps

## Current Status ✅

1. **Edge Function Deployed** - The `send-contact` function is live on Supabase
2. **Form Handler Configured** - JavaScript is set up to send data to the Edge Function
3. **Resend API Key Created** - `re_Db7GQtUr_6xfBeDmh1TP6skphGQ83ENPo`

## Final Step: Add Secret to Supabase

To make the contact form send emails, you need to add your Resend API key to Supabase:

### Step 1: Go to Supabase Dashboard

1. Visit https://supabase.com/dashboard
2. Select your project (the one connected to this site)

### Step 2: Add the Secret

1. In the left sidebar, click on **Edge Functions**
2. Look for the **Secrets** section or click **Manage secrets**
3. Click **Add new secret** or similar button
4. Enter the following:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_Db7GQtUr_6xfBeDmh1TP6skphGQ83ENPo`
5. Click **Save** or **Add**

### Alternative Path (if above doesn't work):

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **Edge Functions** in the settings menu
3. Look for **Function Secrets** or **Environment Variables**
4. Add:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_Db7GQtUr_6xfBeDmh1TP6skphGQ83ENPo`

## Testing the Contact Form

After adding the secret:

### Test on Your Live Site

1. Go to your Netlify site URL
2. Navigate to the Contact page
3. Fill out the form:
   - **Name**: Your Name
   - **Email**: your-email@example.com
   - **Message**: Test message from contact form
4. Click **Submit**
5. You should see: "Thank you! Your message has been sent successfully"
6. Check the email inbox: **alienssoft.tech@gmail.com**
7. You should receive an email with the form submission

### What Happens Behind the Scenes

1. User submits form on your website
2. JavaScript sends data to Supabase Edge Function
3. Edge Function receives the data
4. Edge Function calls Resend API with your API key
5. Resend sends the email to alienssoft.tech@gmail.com
6. User sees success message on the form

## Email Details

- **Recipient**: alienssoft.tech@gmail.com
- **Sender**: MARASSI Contact <onboarding@resend.dev>
- **Reply-To**: User's email (so you can reply directly)
- **Subject**: "Contact Form Submission from [User's Name]"

## Troubleshooting

### Form shows "Failed to send message"

**Check 1: Is the secret added correctly?**
- Make sure the secret name is exactly `RESEND_API_KEY` (case-sensitive)
- Make sure the value is exactly `re_Db7GQtUr_6xfBeDmh1TP6skphGQ83ENPo`

**Check 2: Is the Resend API key valid?**
- Log into resend.com
- Check that the API key "MarassiWeb" is still active
- If needed, regenerate the key and update the Supabase secret

**Check 3: Browser Console Errors**
- Open browser Developer Tools (F12)
- Go to Console tab
- Submit the form and look for error messages
- Share any errors you see for further help

### Email not arriving

**Check 1: Spam Folder**
- Check the spam/junk folder of alienssoft.tech@gmail.com

**Check 2: Resend Dashboard**
- Log into resend.com
- Go to **Logs** or **Activity**
- See if the email was sent and delivered

**Check 3: Edge Function Logs**
- In Supabase Dashboard, go to **Edge Functions**
- Click on **send-contact** function
- Look at the **Logs** tab for any errors

## Customization Options

### Change Recipient Email

Edit the Edge Function in Supabase Dashboard:
- Find line: `to: "alienssoft.tech@gmail.com"`
- Change to: `to: "your-new-email@example.com"`

### Change Sender Name

Edit the Edge Function in Supabase Dashboard:
- Find line: `from: "MARASSI Contact <onboarding@resend.dev>"`
- Change to: `from: "Your Name <onboarding@resend.dev>"`

**Note**: To use a custom domain email (like contact@marassi.com), you need to verify your domain in Resend.com first.

## Support

If you're still having issues:

1. Check Supabase Edge Function logs for errors
2. Check Resend.com logs for email delivery status
3. Check browser console for JavaScript errors
4. Make sure the secret is saved correctly in Supabase

The Edge Function is deployed and ready - you just need to add that one secret to Supabase, and emails will start working immediately!
