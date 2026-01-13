# Email Sender with Drive Links

A web application that allows you to send emails with drive links to multiple recipients. Features an Excel-like interface with inline editing capabilities.

## Features

- ✅ Add recipient email addresses manually
- ✅ Add multiple drive links per recipient
- ✅ Excel-like table interface
- ✅ Inline editing of emails and drive links
- ✅ Email validation (ensures proper format with single @ symbol)
- ✅ Drive link validation
- ✅ Real-time status messages showing success/errors
- ✅ Confirmation before sending
- ✅ Individual send status for each recipient

## Prerequisites

- Node.js (version 14 or higher)
- A Gmail account (or other email service)
- Gmail App Password (if using Gmail)

## Installation

1. **Navigate to the project directory:**

   ```bash
   cd "c:\ABBA CONTRIBUTION\email-sender"
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure email settings:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your email credentials:
     ```
     EMAIL_SERVICE=gmail
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-password
     ```

### Getting Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security**
3. Under "Signing in to Google," select **2-Step Verification** (you need to enable this first)
4. At the bottom, select **App passwords**
5. Select **Mail** and your device
6. Copy the generated 16-character password
7. Use this password in your `.env` file

## Usage

1. **Start the server:**

   ```bash
   npm start
   ```

2. **Open your browser:**
   Navigate to: http://localhost:3000

3. **Using the application:**
   - Enter an email address and click "Add Email"
   - Enter drive links (one per line) and click "Add Drive Links"
   - The data will appear in the table below
   - Click any email or drive link cell to edit it
   - Review the data in the table
   - Click "Send Emails" to send all emails
   - Check the Status Messages window for results

## Features in Detail

### Email Validation

- Must contain exactly one @ symbol
- Follows RFC 5322 email standards
- Invalid emails are highlighted in red
- Cannot send emails with invalid addresses

### Drive Links

- Can add multiple links per recipient
- Links are validated as proper URLs
- Each link must be on a separate line
- Links can be edited directly in the table

### Excel-like Interface

- Green header like Excel
- Hover effects on rows
- Click-to-edit cells
- Inline editing with Enter to save, Escape to cancel

### Status Window

- Shows all operations in real-time
- Color-coded messages:
  - Blue: Information
  - Green: Success
  - Red: Error
  - Yellow: Warning
- Timestamps for each message
- Auto-scrolls to latest message

## Troubleshooting

### "Network error" when sending emails

- Make sure the server is running (`npm start`)
- Check if you can access http://localhost:3000

### "Email transporter error"

- Verify your `.env` file has correct credentials
- For Gmail, make sure you're using an App Password, not your regular password
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
