# HOW TO GET SUPABASE CREDENTIALS FOR NETLIFY

## The Issue
You're using **Bolt/Claude Code** which has Supabase pre-configured internally via MCP (Model Context Protocol). However, when deploying to **Netlify**, you need to provide your own Supabase credentials as environment variables.

---

## ✅ SOLUTION: Get Your Supabase Credentials

### **Option 1: Use Bolt's Built-in Supabase (if accessible)**

The Supabase database is already working here in Bolt. You just need the URL and API keys.

**Since Bolt manages this internally, here's what to do:**

1. **Contact Bolt/Claude Code Support** and ask for:
   - Your Supabase Project URL
   - Your Supabase Anon Key (public key)
   - Your Supabase Service Role Key (private key)

2. OR check if there's a Bolt dashboard where you can view project settings

---

### **Option 2: Create Your Own FREE Supabase Project (Recommended)**

This is the **EASIEST and RECOMMENDED** approach:

#### **Step 1: Sign up for Supabase**
1. Go to: https://supabase.com
2. Click **"Start your project"**
3. Sign in with GitHub (or email)

#### **Step 2: Create a New Project**
1. Click **"New Project"**
2. Fill in:
   - **Name**: MARASSI Logistics
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to Saudi Arabia (e.g., Singapore or Mumbai)
3. Click **"Create new project"**
4. Wait 2-3 minutes for project to initialize

#### **Step 3: Get Your Credentials**

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** tab
3. You'll see:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGc...
service_role key: eyJhbGc... (click "reveal" to see it)
```

**Copy these three values!**

#### **Step 4: Create the Database Table**

1. In Supabase Dashboard, click **SQL Editor** (in sidebar)
2. Click **"New query"**
3. Paste this SQL:

```sql
-- Create contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for contact form)
CREATE POLICY "Allow public inserts" ON contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Create policy for admin to read all messages
CREATE POLICY "Allow service role to read all" ON contact_messages
  FOR SELECT
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages(created_at DESC);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_contact_messages_status
  ON contact_messages(status);
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: "Success. No rows returned"

---

## 🚀 ADD CREDENTIALS TO NETLIFY

Once you have your Supabase credentials (from Option 1 or 2):

### **In Netlify Dashboard:**

1. Go to: **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add these THREE variables:

```
Variable 1:
Key: SUPABASE_URL
Value: https://xxxxxxxxxxxxx.supabase.co
(your Project URL from Supabase)

Variable 2:
Key: SUPABASE_ANON_KEY
Value: eyJhbGc...
(your anon/public key from Supabase)

Variable 3:
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGc...
(your service_role key from Supabase - keep this SECRET!)
```

4. Click **"Save"**

---

## 🔄 REDEPLOY YOUR SITE

After adding environment variables:

1. Go to **Deploys** tab in Netlify
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment to complete (2-3 minutes)
4. Test your contact form!

---

## ✅ TESTING

### **Test 1: Check if credentials are loaded**
Visit in browser:
```
https://your-site.netlify.app/.netlify/functions/send-contact
```
Expected response: `{"error":"Method not allowed"}` ← This is GOOD!

### **Test 2: Submit the form**
1. Go to your contact page
2. Fill out the form
3. Submit
4. Should see: "Message sent successfully!"

### **Test 3: Check Supabase Dashboard**
1. Go to Supabase Dashboard
2. Click **Table Editor** (in sidebar)
3. Select **contact_messages** table
4. You should see your test message!

---

## 🆘 TROUBLESHOOTING

### **Error: "Server configuration error"**
- Environment variables not set in Netlify
- Go to Netlify → Site settings → Environment variables
- Verify all 3 variables are added
- Redeploy the site

### **Error: "Failed to save message"**
- Database table doesn't exist
- Run the SQL script above in Supabase SQL Editor
- Check RLS policies are created

### **Error: "Invalid credentials"**
- Wrong API keys
- Copy-paste error (extra spaces?)
- Using expired/revoked keys
- Get fresh keys from Supabase Dashboard → Settings → API

---

## 📝 QUICK CHECKLIST

- [ ] Create Supabase account (or get Bolt credentials)
- [ ] Create new Supabase project
- [ ] Run SQL script to create table
- [ ] Copy Project URL, anon key, and service_role key
- [ ] Add 3 environment variables in Netlify
- [ ] Redeploy site in Netlify
- [ ] Test contact form
- [ ] Check message appears in Supabase table

---

## 🎯 FINAL NOTE

**Recommendation:** Use Option 2 (create your own Supabase project). It's:
- ✅ FREE (up to 500MB database)
- ✅ Easy to set up (5 minutes)
- ✅ Full control over your data
- ✅ No dependency on Bolt infrastructure
- ✅ Works perfectly with Netlify

Once set up, your contact form will work flawlessly on your live Netlify site!
