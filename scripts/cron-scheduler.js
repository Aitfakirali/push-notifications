#!/usr/bin/env node

/**
 * Cron Scheduler Script
 * This script runs continuously and sends push notifications every day at 10:00 AM
 * 
 * For production, you should use:
 * - A proper cron job on your server
 * - A cloud scheduler (e.g., Vercel Cron, AWS EventBridge, Google Cloud Scheduler)
 * - A dedicated task queue service
 */

const cron = require('node-cron');
const https = require('https');
const http = require('http');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || '';

console.log('🚀 Cron Scheduler started');
console.log('📅 Scheduled to send notifications daily at 10:00 AM');
console.log('🌐 App URL:', APP_URL);

// Schedule task to run every day at 10:00 AM
// Format: minute hour day month weekday
// '0 10 * * *' = At 10:00 AM every day
cron.schedule('0 10 * * *', () => {
  console.log(`\n⏰ [${new Date().toISOString()}] Running scheduled notification task...`);
  sendDailyNotifications();
}, {
  timezone: "America/New_York" // Change this to your timezone
});

// For testing: also run every minute (comment this out in production)
// cron.schedule('* * * * *', () => {
//   console.log(`\n🧪 [${new Date().toISOString()}] Test notification (runs every minute)...`);
//   sendDailyNotifications();
// });

function sendDailyNotifications() {
  const url = new URL('/api/push/send-daily', APP_URL);
  const protocol = url.protocol === 'https:' ? https : http;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CRON_SECRET}`,
    },
  };

  const req = protocol.request(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('✅ Response status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('📊 Result:', response);
      } catch (e) {
        console.log('📄 Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error sending notifications:', error.message);
  });

  req.end();
}

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down cron scheduler...');
  process.exit(0);
});

console.log('\n✨ Scheduler is running. Press Ctrl+C to stop.\n');

