# Render.com Deployment Guide for SirMails

## Prerequisites

1. A GitHub account (or GitLab/Bitbucket)
2. A Render.com account (sign up at https://render.com)
3. Your code pushed to a Git repository

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for Render deployment"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy on Render.com Using Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository:
   - Authorize Render to access your GitHub account
   - Select your repository from the list
4. Configure the service with these settings:
   - **Name**: `email-sender-app` (or your preferred name)
   - **Region**: Choose closest to your location
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave blank (or `SirMails` if deploying from a subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Select **Free** (or paid plan for better performance)

### 3. Configure Environment Variables

**Before clicking "Create Web Service"**, scroll down to the **Environment Variables** section and add:

- Click **"Add Environment Variable"**
- Add each of the following:
  - `EMAIL_SERVICE` = `gmail` (or your email service)
  - `EMAIL_USER` = `your-email@gmail.com`
  - `EMAIL_PASSWORD` = `your-app-password`

**Important for Gmail users:**

- Don't use your regular Gmail password
- Create an App Password: https://myaccount.google.com/apppasswords
- You may need to enable 2-factor authentication first

### 4. Create and Deploy

1. Click **"Create Web Service"** button at the bottom
2. Render will start building your application
3. Wait for the build and deployment to complete (usually 2-5 minutes)
4. Monitor the build process in the logs tab

### 5. Access Your Application

Once deployed, Render will provide a URL like:

```
https://email-sender-app.onrender.com
```

## Troubleshooting

### Common Issues

1. **Build Fails**

   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node version compatibility

2. **App Crashes After Deployment**

   - Check the service logs
   - Verify environment variables are set correctly
   - Ensure PORT is using `process.env.PORT` (already configured)

3. **Email Not Sending**
   - Verify EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD are set correctly
   - For Gmail: Ensure you're using an App Password, not regular password
   - Check that 2FA is enabled on your Gmail account

### View Logs

1. Go to your service in Render Dashboard
2. Click the **"Logs"** tab
3. Monitor real-time logs for errors

## Important Notes

- **Free Tier**: Render's free tier spins down after 15 minutes of inactivity

  - First request after spin-down may take 30-60 seconds
  - Consider upgrading to a paid plan for production use

- **Security**: Never commit your `.env` file to GitHub

  - It's included in `.gitignore` for protection
  - Always set environment variables in Render Dashboard

- **Custom Domain**: You can add a custom domain in the service settings

## Updating Your Application

When you push changes to your GitHub repository:

```bash
git add .
git commit -m "Your update message"
git push
```

Render will automatically detect the changes and redeploy your application.

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com

## Current Configuration

- Node.js application
- Express server
- Nodemailer for email sending
- Serves static files (HTML, CSS, JS)
