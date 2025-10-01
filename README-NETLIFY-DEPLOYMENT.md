# Netlify Deployment Guide

## Your Project is Now Configured for Netlify Static Hosting

### What Changed
- Added `netlify.toml` - Configuration for Netlify
- Added `_redirects` - Handles routing
- Removed `.env` - No environment variables needed

### Deploy to Netlify

#### Option A: Deploy via Netlify CLI
```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

#### Option B: Deploy via Git (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Netlify will auto-detect settings from netlify.toml
6. Click "Deploy"

### Build Settings (Auto-configured in netlify.toml)
- **Build command**: `echo 'Static site - no build needed'`
- **Publish directory**: `.` (root)
- **Node version**: 18.x

### Important Notes
- `server.js` is for LOCAL development only
- Netlify serves your HTML files directly (no Express server)
- All routing is handled by the `_redirects` file
- Contact form needs Netlify Forms or external service

### Local Development
```bash
npm start
# Visit http://localhost:3000
```

### Contact Form Setup
Your contact form currently submits to `/submit`. For Netlify:

1. Add `netlify` attribute to form in contact.html:
   ```html
   <form netlify name="contact">
   ```

2. Or use a service like:
   - Formspree
   - Netlify Forms
   - EmailJS
