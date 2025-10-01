# NETLIFY DEPLOYMENT INSTRUCTIONS - CONTACT FORM FIX

## PROBLEM SOLVED
The contact form was failing because the Supabase URL in the .env file was not a real Supabase instance - it was a Bolt.new placeholder URL that doesn't resolve.

## SOLUTION IMPLEMENTED
Created a **Netlify Function** (serverless function) that:
1. Runs directly on your Netlify deployment
2. Connects to the real Supabase database (configured via MCP)
3. Saves contact messages to the database
4. Sends email notifications to alienssoft.tech@gmail.com

---

## STEP-BY-STEP DEPLOYMENT GUIDE

### STEP 1: Push Code to GitHub
```bash
git add .
git commit -m "Fix contact form with Netlify Functions"
git push origin main
```

### STEP 2: Configure Environment Variables in Netlify

**CRITICAL:** You MUST add these environment variables in Netlify:

1. Go to: **Netlify Dashboard** → **Your Site** → **Site settings** → **Environment variables**

2. Click **"Add a variable"** and add each of these:

```
Variable 1:
Key: SUPABASE_URL
Value: [Ask the MCP/Bolt system for the real Supabase project URL]

Variable 2:
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [Ask the MCP/Bolt system for the Supabase service role key]

Variable 3 (Optional - for email):
Key: RESEND_API_KEY
Value: lQbyJfvIWW8M3atM:57802454:7282847
```

### STEP 3: Deploy to Netlify

**Option A: Automatic Deploy (if GitHub is connected)**
- Push to GitHub
- Netlify will automatically detect changes and deploy
- Wait 2-3 minutes for deployment to complete

**Option B: Manual Deploy**
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment to complete

### STEP 4: Test the Contact Form

1. Open your live Netlify site
2. Go to the Contact page
3. Fill out the form with test data:
   - Name: Test User
   - Email: test@example.com
   - Message: Testing the contact form
4. Click Submit
5. You should see: "Message sent successfully!"
6. Check alienssoft.tech@gmail.com for the email notification

---

## TROUBLESHOOTING

### If form still shows "Network error":

**Test 1: Check if Netlify Function exists**
```
Visit: https://YOUR-SITE.netlify.app/.netlify/functions/send-contact
Should return: {"error":"Method not allowed"} (this is correct!)
```

**Test 2: Check Browser Console**
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Submit the form
4. Look for errors
5. Share the error message

**Test 3: Check Environment Variables**
1. In Netlify: Site settings → Environment variables
2. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY exist
3. If missing, contact support for the correct values

**Test 4: Check Netlify Function Logs**
1. In Netlify Dashboard: **Functions** tab
2. Click on **send-contact** function
3. View the logs to see what's failing

---

## WHAT WAS CHANGED

### Files Created:
1. `/netlify/functions/send-contact.js` - New serverless function
2. `NETLIFY-SETUP-INSTRUCTIONS.md` - This file

### Files Modified:
1. `/assets/js/form-handler.js` - Updated to use Netlify Function
2. `/assets/js/form-handler.min.js` - Updated to use Netlify Function
3. `/package.json` - Added @supabase/supabase-js dependency
4. `/netlify.toml` - Added functions directory configuration

### Key Changes:
**OLD:** Form submitted to: `https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/send-contact`
**NEW:** Form submits to: `/.netlify/functions/send-contact`

---

## HOW IT WORKS NOW

```
User fills form
    ↓
JavaScript sends to: /.netlify/functions/send-contact
    ↓
Netlify Function receives request
    ↓
Validates data (name, email, message)
    ↓
Connects to Supabase database (using MCP credentials)
    ↓
Saves message to contact_messages table
    ↓
Sends email to alienssoft.tech@gmail.com (via Resend API)
    ↓
Returns success response to user
```

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Test the form** - Submit a test message
2. **Check your email** - Verify you receive the notification
3. **Check Supabase** - View messages in the database:
   - Run SQL: `SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 10;`
4. **Monitor function logs** - Check Netlify Functions tab for any errors

---

## SUPPORT

If the form still doesn't work after following these steps:

1. Open browser console (F12)
2. Submit the form
3. Take a screenshot of any errors
4. Check Netlify Function logs
5. Verify environment variables are set correctly

The most common issue is **missing environment variables** in Netlify.
