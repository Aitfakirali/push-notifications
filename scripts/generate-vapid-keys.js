#!/usr/bin/env node

/**
 * Generate VAPID keys for Web Push Notifications
 * 
 * Run this script once to generate your VAPID keys:
 *   node scripts/generate-vapid-keys.js
 * 
 * Then copy the keys to your .env.local file
 */

const webpush = require('web-push');

console.log('\n🔑 Generating VAPID Keys for Web Push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys Generated Successfully!\n');
console.log('📋 Copy these to your .env.local file:\n');
console.log('─'.repeat(70));
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('─'.repeat(70));
console.log('\n⚠️  Important:');
console.log('   • Keep the private key SECRET');
console.log('   • Never commit .env.local to version control');
console.log('   • The public key can be safely exposed to clients');
console.log('\n✨ Done!\n');
