const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(".")); // Serve static files from current directory

// Configure email transporter
// You'll need to set up your email credentials in .env file
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // e.g., 'gmail', 'outlook'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log("Email transporter error:", error);
    console.log("Please configure your email credentials in .env file");
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Send emails endpoint
app.post("/send-emails", async (req, res) => {
  try {
    const { recipients } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: "No recipients provided" });
    }

    const results = [];
    let successCount = 0;
    let failedCount = 0;

    // Send emails sequentially
    for (const recipient of recipients) {
      try {
        // Create drive links HTML
        let driveLinksHtml = "";
        if (recipient.driveLinks && recipient.driveLinks.length > 0) {
          driveLinksHtml = "<h3>Shared Drive Links:</h3><ul>";
          recipient.driveLinks.forEach((link) => {
            driveLinksHtml += `<li><a href="${link}">${link}</a></li>`;
          });
          driveLinksHtml += "</ul>";
        }

        // Create attachments info HTML
        let attachmentsHtml = "";
        if (recipient.attachments && recipient.attachments.length > 0) {
          attachmentsHtml = "<h3>Attached Documents:</h3><ul>";
          recipient.attachments.forEach((file) => {
            attachmentsHtml += `<li>${file.name} (${(file.size / 1024).toFixed(
              2
            )} KB)</li>`;
          });
          attachmentsHtml += "</ul>";
        }

        if (!driveLinksHtml && !attachmentsHtml) {
          driveLinksHtml = "<p>No documents shared.</p>";
        }

        // Prepare attachments for nodemailer
        const attachments = [];
        if (recipient.attachments && recipient.attachments.length > 0) {
          recipient.attachments.forEach((file) => {
            attachments.push({
              filename: file.name,
              content: file.content,
              encoding: "base64",
              contentType: file.type,
            });
          });
        }

        // Email content
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipient.email,
          subject: "Shared Documents",
          html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Hello!</h2>
                            <p>Please find the shared documents below:</p>
                            ${driveLinksHtml}
                            ${attachmentsHtml}
                            <br>
                            <p>Best regards</p>
                        </div>
                    `,
          attachments: attachments,
        };

        await transporter.sendMail(mailOptions);

        results.push({
          email: recipient.email,
          success: true,
        });
        successCount++;

        console.log(`Email sent successfully to: ${recipient.email}`);
      } catch (error) {
        results.push({
          email: recipient.email,
          success: false,
          error: error.message,
        });
        failedCount++;

        console.error(
          `Failed to send email to ${recipient.email}:`,
          error.message
        );
      }
    }

    res.json({
      success: true,
      successCount,
      failedCount,
      results,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

// Root route - serves index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Email server is running" });
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
