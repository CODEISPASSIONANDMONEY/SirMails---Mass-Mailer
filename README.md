# SirMails - Professional Mass Mailer

A production-ready, feature-rich mass email application with drive links and document attachment support. Optimized for deployment on Render.com with comprehensive error handling and monitoring.

## ✨ Features

### Core Capabilities

- 📧 **Parallel Email Sending** - Send to multiple recipients simultaneously (up to 100/batch)
- 🔗 **Drive Links Support** - Share Google Drive/OneDrive links with recipients
- 📎 **File Attachments** - Attach documents directly (up to 25MB total)
- 🎯 **Smart Validation** - Email and URL validation with helpful error messages
- 🔄 **Auto-Retry Logic** - 3 automatic retries with exponential backoff on failures
- 📊 **Excel-like Interface** - Inline editing with real-time validation
- 🎨 **Real-time Status** - Live updates for each email sent
- 🛡️ **Production-Ready** - Error handling, logging, graceful shutdown

### Technical Features

- ⚡ Connection pooling for optimal performance
- 🔐 Secure TLS/SSL email transmission
- 💾 Memory-efficient file handling
- 🌐 CORS support for cross-origin requests
- 📈 Health monitoring endpoints
- 🔍 Configuration verification tools
- 📱 Responsive design
- 🚀 Zero-downtime deployment support

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **NPM** 9.0.0 or higher
- **Gmail Account** with 2-Step Verification enabled
- **Gmail App Password** (for email sending)

## 🚀 Quick Start

### Local Development

1. **Clone and Install:**

   ```bash
   cd "c:\ABBA CONTRIBUTION"
   npm install
   ```

2. **Configure Environment:**

   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env with your credentials
   ```

3. **Verify Setup:**

   ```bash
   npm run verify
   ```

4. **Start Server:**

   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

5. **Open Application:**
   ```
   http://localhost:3000
   ```

### Deploy to Render.com

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for complete deployment instructions.

## 📧 Gmail App Password Setup

### Step-by-Step Guide:

1. **Enable 2-Step Verification:**
   - Visit: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup wizard

2. **Generate App Password:**
   - After enabling 2-Step, visit: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other (Custom name)" as device, type "SirMails"
   - Click "Generate"
   - **Copy the 16-character password** (remove spaces!)

3. **Configure in .env:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop   # Your 16-char password
   ```

⚠️ **Important:** Use the App Password, NOT your regular Gmail password!

## 📖 Usage Guide

### 1. Start the Application

```bash
npm start
```

Server will start on `http://localhost:3000`

### 2. Add Recipients

- Enter email address in the input field
- Click "Add Email"
- Email will be validated automatically
- Click on any email to edit inline

### 3. Add Drive Links

- Click "+ Add Drive Link" to create input fields  
- Paste your Google Drive/OneDrive links
- Click "Submit Links"
- Links will be added to ALL recipients
- Click on links in table to edit

### 4. Add File Attachments (Optional)

- Click "Choose Files" to select documents
- Supported: PDF, DOC, XLS, PPT, images, ZIP
- Maximum 25MB total per batch
- Files will be attached to ALL recipients

### 5. Send Emails

- Review your recipients and content
- Click "Send Emails"
- Monitor progress in Status Messages section
- Each email shows ✅ (success) or ❌ (failed)
## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run verify` | Verify project setup and configuration |
| `npm run preflight` | Run pre-deployment checks |
| `npm test` | Run all verification tests |

## 🌐 API Endpoints

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main web application |
| `/health` | GET | Server health status with metrics |
| `/config-check` | GET | Configuration verification |
| `/send-emails` | POST | Send emails to recipients |

### Health Check Response
```json
{
  "status": "OK",
  "timestamp": "2026-01-14T00:57:56.000Z",
  "uptime": 123,
  "environment": "production",
  "emailConfigured": true,
  "emailStatus": "Ready",
  "memory": {
    "used": "45 MB",
    "total": "128 MB"
  },
  "nodeVersion": "v18.17.0"
}
```

## 🐛 Troubleshooting

### Connection Timeout Errors

**Symptom:** "Connection timeout" when sending emails

**Solutions:**
1. Verify EMAIL_USER and EMAIL_PASSWORD are correct
2. Regenerate Gmail App Password
3. Check your internet connection
4. Verify Gmail account doesn't have suspicious activity blocks

### Email Service Not Configured

**Symptom:** "Email service not configured" error

**Solutions:**
1. Check if .env file exists
2. Verify EMAIL_USER and EMAIL_PASSWORD are set
3. Restart the server after changing .env
4. Run `npm run verify` to check configuration

### Authentication Failed

**Symptom:** "Authentication failed" or "Invalid login"

**Solutions:**
1. **NOT using App Password** - Generate one at https://myaccount.google.com/apppasswords
2. App Password has spaces - Remove all spaces
3. 2-Step Verification not enabled - Enable it first
4. Wrong email address - Double-check EMAIL_USER

### Port Already in Use

**Symptom:** "EADDRINUSE" error

**Solutions:**
1. Change PORT in .env file
2. Stop other applications using port 3000
3. On Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`

### Server Won't Start

**Solutions:**
1. Run `npm install` to ensure dependencies are installed
2. Check Node.js version: `node --version` (must be 18+)
3. Run `npm run verify` to identify issues
4. Check server logs for specific errors

## 📊 Performance Tips

### For Local Development
- Use `npm run dev` for auto-reload
- Keep batch size under 50 emails for faster testing
- Monitor memory usage in /health endpoint

### For Production (Render.com)
- Free tier: Service spins down after 15 min inactivity
- First request after spin-down: 30-60 seconds
- Batch limit: 100 emails per request
- Large attachments may cause timeouts
- Use connection pooling (already configured)

## 🔒 Security Best Practices

✅ Never commit .env file to git (.gitignore prevents this)
✅ Use App Passwords, not regular passwords  
✅ Rotate App Passwords periodically
✅ Enable 2-Step Verification on Gmail
✅ Monitor /health endpoint for unusual activity
✅ Keep dependencies updated: `npm audit fix`

## 📁 Project Structure

```
├── server.js              # Main server file
├── index.html             # Frontend HTML
├── script.js              # Frontend JavaScript  
├── styles.css             # Frontend styles
├── package.json           # Dependencies
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
├── render.yaml           # Render.com configuration
├── verify-setup.js       # Setup verification script
├── preflight-check.js    # Pre-deployment checks
├── DEPLOYMENT_GUIDE.md   # Deployment instructions
└── README.md             # This file
```

## 🆘 Getting Help

1. **Check Configuration:** Visit `/config-check` endpoint
2. **Check Health:** Visit `/health` endpoint  
3. **Run Verification:** `npm run verify`
4. **Check Logs:** Server logs show detailed error messages
5. **Documentation:** Read DEPLOYMENT_GUIDE.md

## 📝 License

MIT License - Feel free to use and modify!

## 👨‍💻 Contributing

Contributions welcome! Please ensure:
- Code passes `npm run verify`
- All endpoints tested
- Documentation updated
- No sensitive data in commits

---

**Made with ❤️ for efficient mass email communication**
- Enable 2-Step Verification in your Google Account

### Emails not sending

- Check the Status Messages window for specific errors
- Verify your email and password in `.env`
- Check if your email service is configured correctly

## File Structure

```
email-sender/
├── index.html          # Main HTML file
├── styles.css          # CSS styling (Excel-like design)
├── script.js           # Frontend JavaScript
├── server.js           # Backend Node.js server
├── package.json        # Node.js dependencies
├── .env                # Email configuration (create from .env.example)
├── .env.example        # Example environment variables
└── README.md           # This file
```

## Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express
- **Email:** Nodemailer
- **Other:** dotenv, CORS

## Security Notes

- Never commit your `.env` file to version control
- Keep your App Password secure
- Use App Passwords instead of regular passwords
- Consider rate limiting for production use

## License

MIT
