const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = !isProduction;

// Trust proxy - important for Render.com
app.set("trust proxy", 1);

// Request logging middleware
if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Security and CORS middleware
const corsOptions = {
  origin: isProduction ? process.env.ALLOWED_ORIGINS?.split(",") || "*" : "*",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files with proper caching headers
app.use(
  express.static(__dirname, {
    maxAge: isProduction ? "1d" : 0,
    etag: true,
    lastModified: true,
  })
);

// Configure email transporter with production-ready settings
let transporter;
let transporterError = null;

function createTransporter() {
  // Only create transporter if credentials are available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    const message =
      "⚠️  Email credentials not configured. Email sending will be disabled.";
    console.warn(message);
    console.warn(
      "   Set EMAIL_USER and EMAIL_PASSWORD environment variables to enable email."
    );
    transporterError = "Email credentials not configured";
    return null;
  }

  try {
    const config = {
      host:
        process.env.EMAIL_SERVICE === "gmail"
          ? "smtp.gmail.com"
          : process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: isProduction,
        minVersion: "TLSv1.2",
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 45000,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
    };

    const mailer = nodemailer.createTransport(config);

    // Verify connection on startup (with timeout)
    const verifyTimeout = setTimeout(() => {
      console.warn(
        "⚠️  Email verification taking too long, continuing anyway..."
      );
    }, 10000);

    mailer.verify((error, success) => {
      clearTimeout(verifyTimeout);
      if (error) {
        console.error("❌ Email transporter error:", error.message);
        console.log("   Check your EMAIL_USER and EMAIL_PASSWORD settings");
        console.log("   For Gmail: https://myaccount.google.com/apppasswords");
        transporterError = error.message;
      } else {
        console.log("✅ Email server is ready to send messages");
        console.log(`   Using: ${process.env.EMAIL_USER}`);
        transporterError = null;
      }
    });

    return mailer;
  } catch (error) {
    console.error("❌ Failed to create email transporter:", error.message);
    transporterError = error.message;
    return null;
  }
}

transporter = createTransporter();

// Send emails endpoint
app.post("/send-emails", async (req, res) => {
  try {
    // Check if email transporter is available
    if (!transporter) {
      return res.status(503).json({
        error: "Email service not configured",
        details:
          transporterError ||
          "Please set EMAIL_USER and EMAIL_PASSWORD environment variables",
        help: "For Gmail, generate an App Password at: https://myaccount.google.com/apppasswords",
      });
    }

    const { recipients } = req.body;

    // Validate request
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        details:
          "No valid recipients provided. Please add at least one email address.",
      });
    }

    // Limit batch size to prevent timeouts
    if (recipients.length > 100) {
      return res.status(400).json({
        error: "Too many recipients",
        details: `You're trying to send ${recipients.length} emails. Maximum is 100 per batch.`,
        help: "Split your recipients into smaller batches.",
      });
    }

    // Validate email addresses
    const invalidEmails = recipients.filter(
      (r) => !r.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)
    );
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        error: "Invalid email addresses",
        details: `${invalidEmails.length} recipient(s) have invalid email addresses`,
        invalidEmails: invalidEmails.map((r) => r.email || "empty"),
      });
    }

    console.log(`📧 Processing ${recipients.length} email(s)...`);

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
            console.log(`✅ Email sent to: ${recipient.email}`);
            return {
              email: recipient.email,
              success: true,
            };
          } catch (err) {
            lastError = err;
            console.log(
              `⚠️  Attempt ${attempt}/3 failed for ${recipient.email}: ${err.message}`
            );
            if (attempt < 3) {
              // Wait before retry (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * attempt)
              );
            }
          }
        }

        // All retries failed
        throw lastError;
      } catch (error) {
        console.error(
          `❌ Failed to send to ${recipient.email}:`,
          error.message
        );

        // Provide helpful error message
        let errorMsg = error.message;
        if (error.message.includes("timeout")) {
          errorMsg =
            "Connection timeout. Check your email credentials and network settings.";
        } else if (
          error.message.includes("authentication") ||
          error.message.includes("Invalid login")
        ) {
          errorMsg =
            "Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD in environment variables.";
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

    console.log(`📊 Results: ${successCount} sent, ${failedCount} failed`);

    res.json({
      success: true,
      successCount,
      failedCount,
      results,
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

// Root route - serves index.html
app.get("/", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "index.html"));
  } catch (error) {
    console.error("Error serving index.html:", error);
    res.status(500).send("Error loading application");
  }
});

// Health check endpoint with detailed status
app.get("/health", (req, res) => {
  const healthStatus = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    port: PORT,
    emailConfigured: !!transporter,
    emailStatus: transporter ? "Ready" : transporterError || "Not configured",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
    },
    nodeVersion: process.version,
  };

  res.status(200).json(healthStatus);
});

// Configuration check endpoint
app.get("/config-check", (req, res) => {
  const config = {
    server: {
      port: PORT,
      host: HOST,
      environment: process.env.NODE_ENV || "development",
    },
    email: {
      service: process.env.EMAIL_SERVICE || "gmail",
      user: process.env.EMAIL_USER ? "✅ Set" : "❌ Not set",
      password: process.env.EMAIL_PASSWORD ? "✅ Set" : "❌ Not set",
      smtpHost: process.env.SMTP_HOST || "smtp.gmail.com (default)",
      smtpPort: process.env.SMTP_PORT || "587 (default)",
      transporterReady: !!transporter,
      error: transporterError || null,
    },
    recommendations: [],
  };

  // Add recommendations
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    config.recommendations.push({
      issue: "Email credentials not configured",
      action: "Set EMAIL_USER and EMAIL_PASSWORD environment variables",
      help: "For Gmail: https://myaccount.google.com/apppasswords",
    });
  }

  if (transporterError) {
    config.recommendations.push({
      issue: "Email transporter error",
      error: transporterError,
      action: "Check your email credentials and network connection",
    });
  }

  if (isProduction && !process.env.EMAIL_USER) {
    config.recommendations.push({
      issue: "Running in production without email configured",
      action: "Configure email credentials in Render dashboard",
      urgency: "HIGH",
    });
  }

  const statusCode = config.recommendations.length > 0 ? 200 : 200;
  res.status(statusCode).json(config);
});

// 404 handler
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    // Serve index.html for client-side routes
    res.sendFile(path.join(__dirname, "index.html"));
  } else {
    res.status(404).json({ error: "Route not found" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);

  // Don't leak error details in production
  const errorMessage = isProduction ? "Internal server error" : err.message;

  res.status(err.status || 500).json({
    error: errorMessage,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// Graceful shutdown handler
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    if (transporter) {
      transporter.close();
      console.log("Email transporter closed");
    }
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    if (transporter) {
      transporter.close();
      console.log("Email transporter closed");
    }
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

const server = app.listen(PORT, HOST, () => {
  console.log("=".repeat(60));
  console.log("🚀 SirMails - Mass Mailer Server Started");
  console.log("=".repeat(60));
  console.log(`📍 URL: http://${HOST}:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `📧 Email Service: ${transporter ? "✅ Configured" : "⚠️  Not Configured"}`
  );
  if (process.env.EMAIL_USER) {
    console.log(`   Using: ${process.env.EMAIL_USER}`);
  } else {
    console.log(`   ⚠️  Set EMAIL_USER and EMAIL_PASSWORD to enable email`);
  }
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log(`🔧 Node: ${process.version}`);
  console.log("=".repeat(60));
  console.log("📋 Available Endpoints:");
  console.log(`   GET  / - Web Application`);
  console.log(`   GET  /health - Health Check`);
  console.log(`   GET  /config-check - Configuration Status`);
  console.log(`   POST /send-emails - Send Emails API`);
  console.log("=".repeat(60));

  if (!transporter) {
    console.log("\n⚠️  WARNING: Email service is not configured!");
    console.log("   The application will run but cannot send emails.");
    console.log("   To fix:");
    console.log(
      "   1. Get Gmail App Password: https://myaccount.google.com/apppasswords"
    );
    console.log("   2. Set environment variables:");
    console.log("      - EMAIL_USER=your-email@gmail.com");
    console.log("      - EMAIL_PASSWORD=your-16-char-app-password");
    console.log("");
  }

  if (isDevelopment) {
    console.log("💡 Development Tips:");
    console.log("   - Visit /config-check to verify configuration");
    console.log("   - Check /health for server status");
    console.log("   - Logs will show all requests");
    console.log("=".repeat(60) + "\n");
  }
});
