#!/usr/bin/env node

/**
 * Email Connection Test Script
 * Tests if your Gmail credentials are working correctly
 */

require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("\n🔍 Testing Email Connection...\n");

// Check if credentials exist
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error("❌ EMAIL_USER or EMAIL_PASSWORD not set in .env file");
  process.exit(1);
}

console.log("📋 Configuration:");
console.log(`   Email: ${process.env.EMAIL_USER}`);
console.log(`   Password: ***${process.env.EMAIL_PASSWORD.slice(-4)}`);
console.log(`   Service: ${process.env.EMAIL_SERVICE || "gmail"}`);
console.log("");

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
  debug: true, // Enable debug output
  logger: true, // Enable logger
});

console.log("🔌 Attempting connection to Gmail SMTP...\n");

// Test connection
transporter.verify(function (error, success) {
  if (error) {
    console.error("\n❌ CONNECTION FAILED!\n");
    console.error("Error:", error.message);
    console.error("\n📝 Possible causes:");

    if (error.message.includes("timeout")) {
      console.error("   1. ⚠️  Gmail App Password might be invalid");
      console.error("   2. ⚠️  Network/firewall blocking connection");
      console.error("   3. ⚠️  Gmail security settings blocking access");
    } else if (
      error.message.includes("authentication") ||
      error.message.includes("Invalid login")
    ) {
      console.error("   1. ❌ Wrong Gmail App Password");
      console.error("   2. ❌ 2-Step Verification not enabled");
      console.error("   3. ❌ Using regular password instead of App Password");
    } else {
      console.error("   1. Check error message above");
      console.error("   2. Verify Gmail account is active");
    }

    console.error("\n🔧 How to fix:");
    console.error("   1. Go to: https://myaccount.google.com/apppasswords");
    console.error("   2. Generate a NEW App Password");
    console.error("   3. Copy the 16-character password (remove spaces)");
    console.error("   4. Update EMAIL_PASSWORD in .env file");
    console.error("   5. Run this test again: npm run test-email\n");

    process.exit(1);
  } else {
    console.log("\n✅ CONNECTION SUCCESSFUL!\n");
    console.log("🎉 Your Gmail credentials are working correctly!");
    console.log("");
    console.log("📧 Test sending an email? (y/n)");

    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question("> ", (answer) => {
      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        sendTestEmail();
      } else {
        console.log(
          "\n✅ Connection test complete. Your app is ready to send emails!"
        );
        readline.close();
        process.exit(0);
      }
    });
  }
});

async function sendTestEmail() {
  console.log("\n📧 Sending test email...");

  const testEmail = process.env.EMAIL_USER; // Send to yourself

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: "✅ SirMails Test Email - Connection Successful",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🎉 Success!</h2>
          <p>Your SirMails email configuration is working correctly.</p>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Email: ${process.env.EMAIL_USER}</li>
            <li>Service: Gmail SMTP</li>
            <li>Test Date: ${new Date().toLocaleString()}</li>
          </ul>
          <p>You can now deploy your application with confidence!</p>
          <hr>
          <small>This is an automated test email from SirMails Mass Mailer</small>
        </div>
      `,
    });

    console.log("\n✅ TEST EMAIL SENT SUCCESSFULLY!");
    console.log(`   Check inbox: ${testEmail}`);
    console.log("\n🎉 Your email configuration is perfect!");
    console.log("   You can now deploy to Render.com with these credentials.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Failed to send test email:", error.message);
    process.exit(1);
  }
}
