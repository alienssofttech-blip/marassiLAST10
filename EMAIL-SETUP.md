# EMAIL NOTIFICATION SETUP - RESEND API

## 🎉 Good News!
Your contact form is working and saving messages to the database! Now let's get email notifications working.

---

## ⚠️ The Problem
The Resend API key in the code is **invalid**. You need a real Resend API key.

---

## ✅ SOLUTION: Get a FREE Resend API Key (2 minutes)

### **Step 1: Sign Up for Resend (FREE)**

1. Go to: **https://resend.com**
2. Click **"Start Building"** or **"Sign Up"**
3. Sign up with your email or GitHub account
4. Verify your email address

### **Step 2: Get Your API Key**

1. After logging in, you'll be on the Dashboard
2. Click **"API Keys"** in the left sidebar
3. Click **"Create API Key"**
4. Give it a name: `MARASSI Contact Form`
5. Select permissions: **"Sending access"**
6. Click **"Create"**
7. **COPY THE API KEY** - it looks like: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **IMPORTANT**: Save it now! You can only see it once!

### **Step 3: Add API Key to Netlify**

1. Go to: **Netlify Dashboard** → **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add this variable:

```
Key: RESEND_API_KEY
Value: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
(paste your actual Resend API key)
```

4. Click **"Save"**
5. Go to **Deploys** tab → Click **"Trigger deploy"**

### **Step 4: Test the Form**

1. Wait for deployment to complete (2-3 minutes)
2. Go to your contact page
3. Fill out and submit the form
4. Check `alienssoft.tech@gmail.com` for the email notification!

## How It Works

1. User fills out the contact form on `contact.html`
2. JavaScript form handler (`form-handler.js`) validates the input
3. Form data is sent to Supabase Edge Function via POST request
4. Edge Function receives the data and validates it
5. Edge Function sends email via Resend API
6. Success/error response is returned to the form
7. User sees confirmation message

## Email Details

- **From**: MARASSI Contact <onboarding@resend.dev>
- **To**: alienssoft.tech@gmail.com
- **Reply-To**: User's email (from form)
- **Subject**: Contact Form Submission from [User Name]
- **Body**: Formatted message with name, email, and message content

## Troubleshooting

### Form shows "Failed to send message"
- Check that the Edge Function is deployed
- Verify the `RESEND_API_KEY` is set correctly in Supabase
- Check browser console for error messages
- Verify Resend API key is active and not expired

### Emails not arriving
- Check spam/junk folder
- Verify Resend account is active
- Check Resend dashboard for email logs
- Verify recipient email (alienssoft.tech@gmail.com) is correct

### CORS errors in browser console
- The Edge Function includes proper CORS headers
- Make sure you're accessing the site via proper domain (not file://)
- Check that the Supabase URL is correct in form-handler.js

## Customization

### Change recipient email
Edit line 57 in `supabase/functions/send-contact/index.ts`:
```typescript
to: "your-new-email@example.com",
```

### Change from email (after verifying domain with Resend)
Edit line 56 in `supabase/functions/send-contact/index.ts`:
```typescript
from: "Contact <contact@yourdomain.com>",
```

### Modify email template
Edit lines 39-47 in `supabase/functions/send-contact/index.ts`

## Production Readiness Checklist

- [x] Edge Function created
- [x] Form handler configured
- [ ] Edge Function deployed to Supabase
- [ ] RESEND_API_KEY environment variable set
- [ ] Form tested and working
- [ ] Email delivery verified
- [ ] Error handling tested
- [ ] Spam folder checked

## Support

For issues with:
- **Supabase**: [Supabase Support](https://supabase.com/support)
- **Resend**: [Resend Support](https://resend.com/support)
- **Form functionality**: Check browser console and network tab
