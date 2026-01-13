import webpush from 'web-push';

// VAPID keys should be generated once and stored securely
// Run this script once to generate keys:
// node -e "console.log(require('web-push').generateVAPIDKeys())"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('⚠️  VAPID keys not found. Please add them to your .env.local file.');
  console.error('Run this command to generate keys:');
  console.error('node -e "console.log(require(\'web-push\').generateVAPIDKeys())"');
}

// Configure web-push with VAPID details
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export { webpush, VAPID_PUBLIC_KEY };
