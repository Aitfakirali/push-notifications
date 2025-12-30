# Quick Setup Guide

Follow these steps to get your push notification app running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Generate VAPID Keys

```bash
node scripts/generate-vapid-keys.js
```

Copy the output keys.

## Step 3: Create .env.local File

Create a file named `.env.local` in the root directory and paste your keys:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<paste_public_key_here>
VAPID_PRIVATE_KEY=<paste_private_key_here>
VAPID_SUBJECT=mailto:your-email@example.com
CRON_SECRET=<paste_cron_secret_here>
APP_URL=http://localhost:3000
```

## Step 4: Create PWA Icons

Replace the placeholder files with actual PNG icons:
- `public/icon-192x192.png` (192x192 pixels)
- `public/icon-512x512.png` (512x512 pixels)

You can use these tools:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Or use ImageMagick to convert an existing icon:
```bash
convert your-icon.png -resize 192x192 public/icon-192x192.png
convert your-icon.png -resize 512x512 public/icon-512x512.png
```

## Step 5: Run the App

```bash
npm run dev
```

Open http://localhost:3000

## Step 6: Run the Cron Scheduler

In a new terminal:

```bash
node scripts/cron-scheduler.js
```

## Step 7: Test

1. Click "Enable Notifications" in the browser
2. Allow notifications when prompted
3. Click "Send Test Notification" to test
4. The cron scheduler will send notifications daily at 10:00 AM

## Production Deployment

See README.md for detailed production deployment instructions including:
- Vercel deployment
- Vercel Cron setup
- Database integration
- Custom domain setup

## Troubleshooting

**Can't see notifications?**
- Check browser permissions
- Use HTTPS or localhost
- Check browser console for errors

**Service worker not working?**
- Hard refresh (Cmd+Shift+R)
- Clear cache
- Check DevTools > Application > Service Workers

**Need help?**
- Check README.md for detailed documentation
- Ensure all environment variables are set
- Verify VAPID keys are correct

