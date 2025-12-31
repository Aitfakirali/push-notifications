#!/usr/bin/env node

/**
 * This script adds push notification handlers to the generated service worker
 * Run this after build: npm run build && npm run add-push-handlers
 */

const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'public', 'sw.js');
const pushHandlerPath = path.join(__dirname, '..', 'public', 'push-handler.js');

console.log('📝 Adding push notification handlers to service worker...');

// Check if sw.js exists
if (!fs.existsSync(swPath)) {
  console.error('❌ Error: sw.js not found. Run "npm run build" first.');
  process.exit(1);
}

// Check if push-handler.js exists
if (!fs.existsSync(pushHandlerPath)) {
  console.error('❌ Error: push-handler.js not found.');
  process.exit(1);
}

// Read the service worker file
let swContent = fs.readFileSync(swPath, 'utf-8');

// Check if push handlers are already added
if (swContent.includes('[Push Handler]')) {
  console.log('✅ Push handlers already added to service worker');
  process.exit(0);
}

// Read the push handler file
const pushHandlerContent = fs.readFileSync(pushHandlerPath, 'utf-8');

// Append push handlers to the service worker
swContent += '\n\n// === PUSH NOTIFICATION HANDLERS ===\n';
swContent += pushHandlerContent;

// Write back to sw.js
fs.writeFileSync(swPath, swContent, 'utf-8');

console.log('✅ Push notification handlers added successfully!');
console.log('📍 Location: public/sw.js');

