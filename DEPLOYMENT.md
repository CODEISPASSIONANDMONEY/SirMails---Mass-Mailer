# Deployment Guide for Render

## Prerequisites

1. A GitHub account
2. A Render account (sign up at https://render.com)
3. Your email credentials ready (Gmail App Password)

## Step 1: Push to GitHub

1. **Initialize Git repository** (if not already done):

   ```bash
   cd "c:\ABBA CONTRIBUTION\email-sender"
   git init
   git add .
   git commit -m "Initial commit - Email Sender App"
   ```

2. **Create a new repository on GitHub**:

   - Go to https://github.com/new
   - Name it: `email-sender-app`
   - Don't initialize with README
   - Click "Create repository"

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/email-sender-app.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy on Render

1. **Sign in to Render**:

   - Go to https://dashboard.render.com
   - Sign up or log in

2. **Create New Web Service**:

   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub account if not connected
   - Select the `email-sender-app` repository

3. **Configure the Service**:

   - **Name**: `email-sender-app` (or your preferred name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Select "Free" (or paid plan)

4. **Set Environment Variables**:
   Click "Advanced" and add these environment variables:

   - `EMAIL_SERVICE` = `gmail`
   - `EMAIL_USER` = `your-email@gmail.com`
   - `EMAIL_PASSWORD` = `your-app-password`
   - `PORT` = `3000`

   **Important**: Use Gmail App Password, not your regular password!

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (2-5 minutes)
   - Your app will be live at: `https://your-app-name.onrender.com`

## Step 3: Post-Deployment

1. **Access Your App**:

   - Once deployed, click the URL shown in Render dashboard
   - Example: `https://email-sender-app.onrender.com`

2. **Test the Application**:
   - Add email addresses
   - Add drive links
   - Upload files
   - Send test email

## Troubleshooting

### App Crashes or Won't Start

- Check logs in Render dashboard
- Verify all environment variables are set
- Check if EMAIL_PASSWORD is correct (use App Password)

### Email Sending Fails

- Verify Gmail App Password is correct
- Check if 2-Step Verification is enabled on your Google Account
- Review error messages in Status Window

### Free Plan Limitations

- App may spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Upgrade to paid plan for always-on service

## Updating Your App

After making changes:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically redeploy your app!

## Environment Variables Reference

| Variable       | Value                | Description                      |
| -------------- | -------------------- | -------------------------------- |
| EMAIL_SERVICE  | gmail                | Email service provider           |
| EMAIL_USER     | your-email@gmail.com | Your Gmail address               |
| EMAIL_PASSWORD | your-app-password    | Gmail App Password (16 chars)    |
| PORT           | 3000                 | Port number (auto-set by Render) |

## Getting Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification" (required)
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" and your device
5. Copy the 16-character password
6. Use this in EMAIL_PASSWORD variable

## Support

If you encounter issues:

- Check Render logs: Dashboard → Your Service → Logs
- Review application status messages
- Verify all environment variables
- Check server.js console output

## Cost

- **Free Tier**: Perfect for testing and personal use
- **Starter Plan**: $7/month for always-on service
- No credit card required for free tier
