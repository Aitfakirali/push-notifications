const webpush = require('web-push');

console.log('Generating VAPID keys...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys generated successfully!\n');
console.log('Add these to your .env.local file:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:your-email@example.com');
console.log('CRON_SECRET=' + require('crypto').randomBytes(32).toString('hex'));
console.log('\nIMPORTANT: Keep the private key secret and never commit it to version control!');

