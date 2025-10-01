# 📧 QUICK SETUP: Email Notifications (2 minutes)

## What You Need
Your contact form is **working** ✅ and saving to database. Now let's enable email notifications!

---

## 🚀 3 SIMPLE STEPS

### **1. Get Resend API Key (FREE)**

1. Visit: **https://resend.com/signup**
2. Sign up (free account - 3,000 emails/month)
3. Go to: **API Keys** → **Create API Key**
4. Name it: `MARASSI Contact Form`
5. **COPY the key** (looks like: `re_xxxxx...`)

### **2. Add to Netlify**

1. **Netlify Dashboard** → **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Enter:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_xxxxx...` (paste your key)
4. Click **"Save"**

### **3. Redeploy**

1. **Deploys** tab → **Trigger deploy**
2. Wait 2 minutes
3. **Test the form!**

---

## ✅ That's It!

After redeploy:
- Submit contact form
- Email arrives at: `alienssoft.tech@gmail.com`
- From: `MARASSI Logistics <onboarding@resend.dev>`
- With reply-to set to customer's email

---

## 📝 Notes

- **Free tier**: 3,000 emails/month (plenty!)
- **FROM address**: Currently uses `onboarding@resend.dev` (works immediately)
- **Verify your domain** later to use `noreply@marassi.com`

---

## 🔧 To Use Your Own Domain Later

1. In Resend Dashboard: **Domains** → **Add Domain** → `marassi.com`
2. Add DNS records (TXT, MX, CNAME)
3. Wait for verification (~30 minutes)
4. In Netlify, add env var: `RESEND_FROM_EMAIL=noreply@marassi.com`
5. Redeploy

---

## 🆘 Troubleshooting

**No email received?**
- Check spam folder
- Verify API key is correct in Netlify
- Check Netlify function logs
- Make sure you redeployed after adding the key

**Still issues?**
- Check [Resend Logs](https://resend.com/logs)
- View Netlify Function logs
- Test API key: https://resend.com/docs/send-with-curl

---

## 📞 Quick Links

- Resend Dashboard: https://resend.com/home
- Resend API Keys: https://resend.com/api-keys
- Resend Docs: https://resend.com/docs
- Email Logs: https://resend.com/logs

---

**Current Status:**
- ✅ Form saving to database
- ✅ Code updated to use Resend properly
- ⏳ Waiting for your Resend API key
- ⏳ Add key to Netlify
- ⏳ Redeploy and test
