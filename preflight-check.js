#!/usr/bin/env node

/**
 * Pre-flight check script for production deployment
 * Verifies all required environment variables and configurations
 */

console.log("🔍 Running pre-flight checks...\n");

let hasErrors = false;

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split(".")[0].substring(1));
if (majorVersion < 18) {
  console.error(
    "❌ Node.js version must be 18 or higher. Current:",
    nodeVersion
  );
  hasErrors = true;
} else {
  console.log("✅ Node.js version:", nodeVersion);
}

// Check required environment variables
const requiredEnvVars = {
  EMAIL_USER: "Your Gmail address",
  EMAIL_PASSWORD: "Your Gmail App Password (16 characters)",
};

const optionalEnvVars = {
  NODE_ENV: "production",
  EMAIL_SERVICE: "gmail",
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "587",
};

console.log("\n📋 Required Environment Variables:");
for (const [key, description] of Object.entries(requiredEnvVars)) {
  if (process.env[key]) {
    const value = key.includes("PASSWORD")
      ? "***" + process.env[key].slice(-4)
      : process.env[key];
    console.log(`✅ ${key}: ${value}`);
  } else {
    console.error(`❌ ${key}: NOT SET (${description})`);
    hasErrors = true;
  }
}

console.log("\n📋 Optional Environment Variables:");
for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
  const value = process.env[key] || defaultValue;
  console.log(`   ${key}: ${value} ${!process.env[key] ? "(default)" : ""}`);
}

// Check required files
const fs = require("fs");
const requiredFiles = [
  "server.js",
  "index.html",
  "script.js",
  "styles.css",
  "package.json",
];

console.log("\n📁 Required Files:");
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file}: NOT FOUND`);
    hasErrors = true;
  }
}

// Final verdict
console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.error("❌ PRE-FLIGHT CHECK FAILED");
  console.error("\nPlease fix the errors above before deploying.");
  console.error("\nFor help, see DEPLOYMENT_GUIDE.md");
  process.exit(1);
} else {
  console.log("✅ PRE-FLIGHT CHECK PASSED");
  console.log("\n🚀 Ready for deployment!");
  console.log("=".repeat(50) + "\n");
  process.exit(0);
}
