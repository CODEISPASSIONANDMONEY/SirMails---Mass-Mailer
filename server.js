const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(__dirname)); // Serve static files from current directory

// Configure email transporter with proper SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE === "gmail" ? "smtp.gmail.com" : process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 30000, // 30 seconds
  pool: true, // use pooled connections
  maxConnections: 5,
  maxMessages: 10,
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
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({
        error:
          "Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in environment variables.",
      });
    }

    const { recipients } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: "No recipients provided" });
    }

    const results = [];
    let successCount = 0;
    let failedCount = 0;

    // Send emails in parallel for better performance
    const emailPromises = recipients.map(async (recipient) => {
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

        // Retry logic for connection timeout
        let lastError;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to: ${recipient.email}`);
            return {
              email: recipient.email,
              success: true,
            };
          } catch (err) {
            lastError = err;
            console.log(`Attempt ${attempt} failed for ${recipient.email}: ${err.message}`);
            if (attempt < 3) {
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }

        // All retries failed
        throw lastError;
      } catch (error) {
        console.error(
          `Failed to send email to ${recipient.email} after 3 attempts:`,
          error.message
        );
        
        // Provide helpful error message
        let errorMsg = error.message;
        if (error.message.includes('timeout')) {
          errorMsg = 'Connection timeout. Check your email credentials and network settings.';
        } else if (error.message.includes('authentication') || error.message.includes('Invalid login')) {
          errorMsg = 'Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD in environment variables.';
        }
        
        return {
          email: recipient.email,
          success: false,
          error: errorMsg,
        };
      }
    });

    // Wait for all emails to complete
    const emailResults = await Promise.allSettled(emailPromises);

    // Process results
    emailResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
        if (result.value.success) {
          successCount++;
        } else {
          failedCount++;
        }
      } else {
        failedCount++;
        results.push({
          email: "unknown",
          success: false,
          error: result.reason?.message || "Unknown error",
        });
      }
    });

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
  res.sendFile(path.join(__dirname, "index.html"));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Email server is running",
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
