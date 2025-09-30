# Email Form Setup Guide

## Overview
The contact form on your MARASSI Logistics website uses a Supabase Edge Function to send emails via Resend.com email service.

## Current Setup

### 1. Edge Function
- **Location**: `supabase/functions/send-contact/index.ts`
- **Endpoint**: `https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/send-contact`
- **Method**: POST
- **Authentication**: Public (no JWT verification required)

### 2. Form Handler
- **Location**: `assets/js/form-handler.js`
- **Configured to**: Send form data to Supabase Edge Function
- **Features**:
  - Real-time validation
  - Loading states
  - Success/error messages
  - Email validation

## Deployment Steps

### Step 1: Get a Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the API key (starts with `re_`)

### Step 2: Deploy the Edge Function

You have two options to deploy:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Click **Create a new function** or **Deploy existing function**
4. Name it: `send-contact`
5. Copy the content from `supabase/functions/send-contact/index.ts`
6. Paste it into the function editor
7. Click **Deploy**

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref 0ec90b57d6e95fcbda19832f

# Deploy the function
supabase functions deploy send-contact
```

### Step 3: Configure Environment Variables

1. In your Supabase dashboard, go to **Project Settings** → **Edge Functions**
2. Under **Secrets**, add a new secret:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key from Step 1
3. Save the secret

### Step 4: Test the Form

1. Open your website: `https://your-domain.com/contact.html`
2. Fill out the contact form with test data
3. Submit the form
4. Check your email inbox (alienssoft.tech@gmail.com) for the message
5. Verify the success message appears on the form

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
