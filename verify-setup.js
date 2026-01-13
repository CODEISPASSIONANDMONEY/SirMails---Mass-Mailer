#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if the project is properly configured and ready to run
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying SirMails Setup...\n');

let warnings = 0;
let errors = 0;

// Load environment variables
require('dotenv').config();

// Check 1: Required files
console.log('📁 Checking Required Files...');
const requiredFiles = [
  { file: 'server.js', description: 'Main server file' },
  { file: 'index.html', description: 'Frontend HTML' },
  { file: 'script.js', description: 'Frontend JavaScript' },
  { file: 'styles.css', description: 'Frontend CSS' },
  { file: 'package.json', description: 'NPM configuration' },
  { file: '.env.example', description: 'Environment template' }
];

requiredFiles.forEach(({ file, description }) => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file.padEnd(20)} - ${description}`);
  } else {
    console.log(`   ❌ ${file.padEnd(20)} - MISSING!`);
    errors++;
  }
});

// Check 2: Node modules
console.log('\n📦 Checking Dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('   ✅ node_modules directory exists');
  
  // Check key dependencies
  const deps = ['express', 'nodemailer', 'cors', 'dotenv'];
  deps.forEach(dep => {
    const depPath = path.join('node_modules', dep);
    if (fs.existsSync(depPath)) {
      console.log(`   ✅ ${dep} installed`);
    } else {
      console.log(`   ❌ ${dep} NOT installed`);
      errors++;
    }
  });
} else {
  console.log('   ⚠️  node_modules not found');
  console.log('   ℹ️  Run: npm install');
  warnings++;
}

// Check 3: Environment configuration
console.log('\n⚙️  Checking Environment Configuration...');
const envFile = '.env';
if (fs.existsSync(envFile)) {
  console.log(`   ✅ ${envFile} exists`);
  
  // Check critical env vars
  const criticalVars = [
    { key: 'EMAIL_USER', required: true, description: 'Gmail address' },
    { key: 'EMAIL_PASSWORD', required: true, description: 'Gmail App Password' },
    { key: 'EMAIL_SERVICE', required: false, description: 'Email service provider' },
    { key: 'PORT', required: false, description: 'Server port' }
  ];
  
  criticalVars.forEach(({ key, required, description }) => {
    if (process.env[key]) {
      const value = key.includes('PASSWORD') 
        ? `***${process.env[key].slice(-4)}` 
        : process.env[key];
      console.log(`   ✅ ${key.padEnd(20)} = ${value}`);
    } else {
      if (required) {
        console.log(`   ❌ ${key.padEnd(20)} - NOT SET (${description})`);
        errors++;
      } else {
        console.log(`   ⚠️  ${key.padEnd(20)} - Using default (${description})`);
      }
    }
  });
} else {
  console.log(`   ⚠️  ${envFile} not found`);
  console.log('   ℹ️  Copy .env.example to .env and configure it');
  warnings++;
}

// Check 4: Port availability
console.log('\n🔌 Checking Port Availability...');
const port = process.env.PORT || 3000;
const net = require('net');
const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`   ⚠️  Port ${port} is already in use`);
    console.log(`   ℹ️  Set a different PORT in .env or stop the other service`);
    warnings++;
  }
  server.close();
  printSummary();
});

server.once('listening', () => {
  console.log(`   ✅ Port ${port} is available`);
  server.close();
  printSummary();
});

server.listen(port, '127.0.0.1');

function printSummary() {
  console.log('\n' + '='.repeat(60));
  
  if (errors === 0 && warnings === 0) {
    console.log('✅ SETUP VERIFICATION PASSED');
    console.log('\n🚀 Your project is ready to run!');
    console.log('\nNext steps:');
    console.log('   1. npm start - Start the server');
    console.log('   2. Open http://localhost:3000 in your browser');
    console.log('   3. Test sending an email');
  } else if (errors === 0) {
    console.log('⚠️  SETUP VERIFICATION PASSED WITH WARNINGS');
    console.log(`\n${warnings} warning(s) found - review above`);
    console.log('\nThe project should run, but you may encounter issues.');
  } else {
    console.log('❌ SETUP VERIFICATION FAILED');
    console.log(`\n${errors} error(s) and ${warnings} warning(s) found`);
    console.log('\nPlease fix the errors above before running the project.');
  }
  
  console.log('='.repeat(60));
  console.log('\n📚 For detailed setup instructions, see:');
  console.log('   - DEPLOYMENT_GUIDE.md');
  console.log('   - README.md');
  console.log('\n💡 Need help? Check:');
  console.log('   - /config-check endpoint after starting server');
  console.log('   - /health endpoint for status');
  console.log('');
  
  process.exit(errors > 0 ? 1 : 0);
}
