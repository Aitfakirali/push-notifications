# Push Notifications PWA with Next.js 14

A Progressive Web App built with Next.js 14 that sends push notifications to subscribed users every day at 10:00 AM.

## Features

- 🔔 **Push Notifications**: Web Push API integration
- 📱 **PWA**: Installable Progressive Web App
- ⏰ **Scheduled Notifications**: Daily notifications at 10:00 AM
- 🎨 **Modern UI**: Beautiful Tailwind CSS interface
- 🔒 **Secure**: VAPID authentication for push notifications
- 💾 **Subscription Management**: Subscribe/unsubscribe functionality

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate VAPID Keys

VAPID keys are required for Web Push authentication:

```bash
node scripts/generate-vapid-keys.js
```

This will output keys that you need to add to your `.env.local` file.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then add your generated keys to `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
CRON_SECRET=your_random_secret_here
APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Start the Cron Scheduler

In a separate terminal, run the cron scheduler to send daily notifications:

```bash
node scripts/cron-scheduler.js
```

This will send notifications every day at 10:00 AM (configurable in the script).

## How It Works

### Push Notification Flow

1. **User subscribes** to notifications via the UI
2. **Browser generates** a unique push subscription
3. **Subscription is saved** on the server (in `subscriptions.json`)
4. **Cron job runs** daily at 10:00 AM
5. **Server sends** push notifications to all subscribed users
6. **Service worker** receives and displays the notification

### Architecture

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       │ Subscribe/Unsubscribe
       │
       ▼
┌─────────────────┐
│   Next.js API   │
│     Routes      │
└────────┬────────┘
         │
         │ Store/Retrieve
         │
         ▼
┌──────────────────┐
│ subscriptions.js │
│    (Storage)     │
└──────────────────┘
         ▲
         │
         │ Read subscriptions
         │
    ┌────┴─────┐
    │   Cron   │
    │ Scheduler│
    └──────────┘
```

## API Routes

### `GET /api/push/vapid-public-key`
Returns the VAPID public key for client-side subscription.

### `POST /api/push/subscribe`
Saves a new push subscription.

**Body**: `PushSubscription` object from browser

### `POST /api/push/unsubscribe`
Removes a push subscription.

**Body**: `PushSubscription` object from browser

### `POST /api/push/send-test`
Sends a test notification to all subscribers.

### `POST /api/push/send-daily`
Sends the daily scheduled notification. Protected by bearer token.

**Headers**: `Authorization: Bearer <CRON_SECRET>`

## Production Deployment

### Deploy to Vercel

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**:
   - Connect your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Set up Vercel Cron Jobs**:

Create `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/push/send-daily",
    "schedule": "0 10 * * *"
  }]
}
```

Or use external cron services:
- [EasyCron](https://www.easycron.com/)
- [cron-job.org](https://cron-job.org/)

Configure them to call:
```
POST https://your-app.vercel.app/api/push/send-daily
Authorization: Bearer YOUR_CRON_SECRET
```

### Alternative Deployments

#### Docker
```bash
docker build -t push-notifications-app .
docker run -p 3000:3000 push-notifications-app
```

#### VPS/Dedicated Server
- Deploy the app normally
- Set up system cron job:
```bash
crontab -e
# Add: 0 10 * * * curl -X POST -H "Authorization: Bearer YOUR_SECRET" http://localhost:3000/api/push/send-daily
```

## Storage

By default, subscriptions are stored in `subscriptions.json`. For production, consider:

- **Database**: PostgreSQL, MongoDB, MySQL
- **Redis**: For fast access
- **Cloud Storage**: Firebase, Supabase

Update the API routes in `app/api/push/` to use your chosen storage solution.

## Customization

### Change Notification Time

Edit `scripts/cron-scheduler.js`:

```javascript
// Change from 10:00 AM to 8:30 AM
cron.schedule('30 8 * * *', () => {
  sendDailyNotifications();
});
```

### Customize Notification Content

Edit `app/api/push/send-daily/route.ts`:

```javascript
const payload = JSON.stringify({
  title: "Your Custom Title",
  body: "Your custom message here",
});
```

### Change Timezone

Edit `scripts/cron-scheduler.js`:

```javascript
cron.schedule('0 10 * * *', () => {
  sendDailyNotifications();
}, {
  timezone: "Europe/London" // Change to your timezone
});
```

## Browser Support

Push notifications are supported in:
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (Desktop & iOS 16.4+)
- ✅ Opera (Desktop & Android)

## Troubleshooting

### Notifications not appearing

1. Check browser permissions (allow notifications)
2. Verify VAPID keys are correct
3. Check browser console for errors
4. Ensure service worker is registered
5. Try in a different browser

### Service Worker not updating

1. Clear browser cache
2. Unregister old service workers in DevTools
3. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Cron job not running

1. Verify timezone settings
2. Check APP_URL and CRON_SECRET
3. Ensure the app is running
4. Check cron scheduler logs

## Development Tips

### Testing Notifications Locally

1. Use HTTPS or localhost (required for service workers)
2. Use the "Send Test Notification" button in the UI
3. Check browser DevTools > Application > Service Workers
4. Use browser DevTools > Application > Push Messaging

### Debugging

Enable verbose logging:
- Browser DevTools Console
- Service Worker DevTools
- Terminal logs from cron scheduler
- Next.js API route logs

## Security

- ✅ VAPID private key kept server-side only
- ✅ Cron endpoint protected with bearer token
- ✅ HTTPS required in production
- ✅ Subscriptions validated before storage

## License

MIT

## Credits

Built with:
- [Next.js 14](https://nextjs.org/)
- [next-pwa](https://github.com/shadowwalker/next-pwa)
- [web-push](https://github.com/web-push-libs/web-push)
- [node-cron](https://github.com/node-cron/node-cron)
- [Tailwind CSS](https://tailwindcss.com/)

