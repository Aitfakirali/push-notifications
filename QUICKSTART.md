# 🚀 Quick Start Guide

Get your push notification app running in 3 minutes!

## Your Generated Keys

Your VAPID keys have been generated! Create a `.env.local` file with these values:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BA-QLQ2Z945ZGkESjKYMeMYrcSm8tADhFwqOlijr2CkFavdLA-ndiwTFsjyX1uiQRoF5nKt92mNQuvd-uqiZb60
VAPID_PRIVATE_KEY=pjPFCiZ0YHRx3ue0_cCmL81sjhA9SjFTz9U0XT6ZY50
VAPID_SUBJECT=mailto:your-email@example.com
CRON_SECRET=26872c8ccd27bab087066496b67cc90b1e26f6e43b0dd6302e9073948ec6f319
APP_URL=http://localhost:3000
```

## Steps

### 1. Create .env.local file

Copy the above keys into a new file called `.env.local` in the project root.

### 2. Start the development server

```bash
npm run dev
```

### 3. Open your browser

Visit http://localhost:3000

### 4. Enable notifications

Click the "Enable Notifications" button and allow permissions.

### 5. Test notifications

Click "Send Test Notification" to verify it works!

### 6. Start the scheduler (optional)

In a new terminal, run:

```bash
npm run cron
```

This will send notifications daily at 10:00 AM.

## What's Next?

- **Customize notifications**: Edit `app/api/push/send-daily/route.ts`
- **Change schedule**: Edit `scripts/cron-scheduler.js` (line 30)
- **Custom icons**: Replace `public/icon-*.png` files
- **Deploy**: See README.md for deployment instructions

## Troubleshooting

**Not seeing notifications?**
- Make sure you're using HTTPS or localhost
- Check browser permissions
- Try in Chrome/Edge first (best support)

**Service worker issues?**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear site data in DevTools > Application

## Production Deployment

For production, you'll need:
1. Deploy to a hosting platform (Vercel, Netlify, etc.)
2. Set environment variables in the hosting dashboard
3. Set up a cron job or scheduled task to call the API

See README.md for complete deployment instructions!

---

**Need Help?** Check out:
- README.md - Full documentation
- SETUP.md - Detailed setup guide
- Browser DevTools Console - Check for errors

