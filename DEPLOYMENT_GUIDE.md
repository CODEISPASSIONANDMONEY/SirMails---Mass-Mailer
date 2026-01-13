# SirMails - Mass Mailer Deployment Guide

## 🚀 Quick Deploy to Render.com

### Prerequisites

1. GitHub account with this repository
2. Render.com account (free tier available)
3. Gmail account with App Password configured

---

## 📧 Gmail Configuration (CRITICAL)

### Step 1: Enable 2-Step Verification

1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the setup process

### Step 2: Generate App Password

1. After enabling 2-Step Verification, go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device, enter "SirMails"
4. Click "Generate"
5. **Copy the 16-character password** (remove spaces)
6. **This is your EMAIL_PASSWORD for Render**

---

## 🌐 Render.com Deployment

### Option 1: Using Blueprint (Recommended)

1. Fork/Push this repository to GitHub
2. Go to https://dashboard.render.com
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. The `render.yaml` will auto-configure everything
6. Add environment variables (see below)
7. Click "Apply"

### Option 2: Manual Setup

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: sirmails-mass-mailer
   - **Runtime**: Node
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Plan**: Free

---

## 🔐 Environment Variables (MUST CONFIGURE)

In Render Dashboard → Your Service → Environment:

| Variable         | Value                | Required |
| ---------------- | -------------------- | -------- |
| `NODE_ENV`       | `production`         | ✅ Yes   |
| `EMAIL_SERVICE`  | `gmail`              | ✅ Yes   |
| `EMAIL_USER`     | Your Gmail address   | ✅ Yes   |
| `EMAIL_PASSWORD` | 16-char App Password | ✅ Yes   |
| `SMTP_HOST`      | `smtp.gmail.com`     | Auto-set |
| `SMTP_PORT`      | `587`                | Auto-set |

### ⚠️ Common Mistakes to Avoid:

- ❌ Using regular Gmail password instead of App Password
- ❌ Including spaces in the App Password
- ❌ Not enabling 2-Step Verification first
- ❌ Leaving EMAIL_USER or EMAIL_PASSWORD empty

---

## ✅ Verify Deployment

### 1. Check Health Endpoint

Visit: `https://your-app-name.onrender.com/health`

Should return:

```json
{
  "status": "OK",
  "timestamp": "2026-01-14T...",
  "uptime": 123,
  "environment": "production",
  "emailConfigured": true,
  "memory": {...}
}
```

### 2. Check Logs

In Render Dashboard → Logs, you should see:

```
✅ Email server is ready to send messages
🚀 Server running on http://0.0.0.0:10000
```

### 3. Test the Application

1. Open your deployed URL
2. Add an email address
3. Add drive links or documents
4. Click "Send Emails"
5. Check status messages

---

## 🐛 Troubleshooting

### "Connection timeout" Error

**Cause**: Wrong email credentials
**Fix**:

1. Verify EMAIL_USER is correct Gmail address
2. Regenerate App Password
3. Update EMAIL_PASSWORD in Render

### "Email service not configured" Error

**Cause**: Missing environment variables
**Fix**: Add EMAIL_USER and EMAIL_PASSWORD in Render Environment tab

### "Authentication failed" Error

**Cause**: Using regular password instead of App Password
**Fix**:

1. Enable 2-Step Verification
2. Generate new App Password
3. Use 16-character App Password (no spaces)

### Deployment Fails

**Fix**:

1. Check logs in Render Dashboard
2. Ensure `package.json` is valid
3. Verify Node version (18+)
4. Try "Manual Deploy" from Render Dashboard

---

## 📊 Performance Tips

### Free Tier Limitations

- Service spins down after 15 min of inactivity
- First request after spin-down takes 30-60 seconds
- Limited to 512 MB RAM

### Optimize for Free Tier

- Keep batch size under 50 emails
- Large attachments may cause timeouts
- First email after wake-up may be slow

### Upgrade Benefits (Paid Plan)

- No spin-down
- More RAM (faster processing)
- Custom domains
- Better support

---

## 🔄 Auto-Deploy Setup

This repo is configured for auto-deploy:

1. Push changes to `main` branch
2. Render automatically deploys
3. Check deployment status in Dashboard

---

## 📞 Support

### Check These First:

1. Logs in Render Dashboard
2. `/health` endpoint response
3. Environment variables are set
4. Gmail App Password is correct

### Still Having Issues?

- Check Render status: https://status.render.com
- Review Gmail security settings
- Verify 2-Step Verification is enabled

---

## ✨ Features

✅ Parallel email sending (fast!)
✅ Automatic retry (3 attempts)
✅ Connection pooling
✅ Graceful shutdown
✅ Health checks
✅ Error handling
✅ Production-ready logging
✅ Memory efficient
✅ Secure CORS
✅ Rate limiting

---

## 🎯 Success Checklist

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated
- [ ] Repository pushed to GitHub
- [ ] Render service created
- [ ] Environment variables added
- [ ] Health check passes
- [ ] Test email sent successfully

**Once all checked, you're ready to go! 🚀**
