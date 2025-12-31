# Push Notification Setup - Complete Guide

## ✅ Push Notification Handlers Are Now Configured!

Your service worker now includes push notification event listeners that will handle incoming notifications.

## How It Works

### 1. Service Worker Registration
The service worker is automatically registered when you visit the app (`app/register-sw.tsx`).

### 2. Push Event Listeners
The service worker listens for three events:

#### A. `push` Event
Triggered when a push notification is received from the server.

```javascript
self.addEventListener('push', function(event) {
  // Receives notification data
  // Displays the notification with icon, vibration, actions
});
```

#### B. `notificationclick` Event  
Triggered when user clicks on the notification.

```javascript
self.addEventListener('notificationclick', function(event) {
  // Opens the app window
  // Or focuses existing window
});
```

#### C. `notificationclose` Event
Triggered when user dismisses the notification.

```javascript
self.addEventListener('notificationclose', function(event) {
  // Optional: track dismissals
});
```

## Testing the Push Notifications

### Step 1: Subscribe to Notifications
1. Open http://localhost:3000
2. Click "Enable Notifications"
3. Allow browser permissions
4. You should see "Successfully subscribed!"

### Step 2: Send a Test Notification
1. Click "Send Test Notification" button
2. You should see a push notification appear

The notification will show:
- Title and body from the API
- App icon
- Action buttons ("Open App" and "Dismiss")
- Vibration pattern

### Step 3: Test Daily Notifications
1. Start the cron scheduler: `npm run cron`
2. Or call the API directly:

```bash
curl -X POST http://localhost:3000/api/push/send-test
```

## Notification Data Format

The API sends notifications in this format:

```javascript
{
  "title": "Good Morning! ☀️",
  "body": "It's Monday, December 30, 2024. Have a great day!",
  "url": "/"  // optional: where to navigate when clicked
}
```

## Customizing Notifications

### Change Notification Content
Edit `app/api/push/send-daily/route.ts` or `app/api/push/send-test/route.ts`:

```typescript
const payload = JSON.stringify({
  title: "Your Custom Title",
  body: "Your custom message",
  url: "/custom-page"  // optional
});
```

### Customize Notification Appearance
Edit `public/push-handler.js`:

```javascript
const notificationOptions = {
  body: notificationData.body,
  icon: '/icon-192x192.png',      // Change icon
  badge: '/icon-192x192.png',     // Change badge
  vibrate: [200, 100, 200],       // Change vibration pattern
  requireInteraction: false,       // Set true to keep notification on screen
  actions: [
    { action: 'open', title: 'Open App' },
    { action: 'close', title: 'Dismiss' }
  ]
};
```

## Debugging Push Notifications

### Check Service Worker Status
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in sidebar
4. Should show: "activated and is running"

### View Notification Logs
1. Open browser console
2. Look for messages starting with `[Push Handler]`
3. You should see:
   ```
   [Push Handler] ✅ Push notification handlers registered successfully
   [Push Handler] Push notification received: [object]
   [Push Handler] Notification displayed successfully
   ```

### Test Push Manually
Open browser console and run:

```javascript
// Check if push is supported
console.log('Push supported:', 'PushManager' in window);

// Get current subscription
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Current subscription:', sub);
  });
});

// Listen for push events
navigator.serviceWorker.addEventListener('message', event => {
  console.log('Message from SW:', event.data);
});
```

## Common Issues & Solutions

### Issue: Notifications not appearing

**Solutions:**
1. ✅ **Check browser permissions**
   - Click 🔒 in address bar
   - Ensure "Notifications" is set to "Allow"

2. ✅ **Refresh the service worker**
   - DevTools > Application > Service Workers
   - Click "Unregister"
   - Hard refresh: `Cmd+Shift+R` or `Ctrl+Shift+R`
   - Re-subscribe to notifications

3. ✅ **Check console for errors**
   - Look for `[Push Handler]` logs
   - Check for any red error messages

4. ✅ **Verify subscription exists**
   ```bash
   cat subscriptions.json
   ```
   Should show your subscription endpoint

### Issue: Service worker not updating

**Solutions:**
1. Clear cache: DevTools > Application > Clear storage
2. Unregister old service worker
3. Run: `npm run add-push-handlers`
4. Hard refresh the page

### Issue: Clicking notification doesn't open app

**Solution:** Check `notificationclick` handler in `public/push-handler.js`

The handler should:
- Find existing window and focus it, OR
- Open new window if none exists

## Production Deployment

### Before Deploying

1. ✅ Build the app (includes push handlers):
   ```bash
   npm run build
   ```

2. ✅ Verify push handlers are included:
   ```bash
   grep "Push Handler" public/sw.js
   ```
   Should show: `[Push Handler] ✅ Push notification handlers registered`

### After Deploying

1. ✅ Test subscription on production URL
2. ✅ Send test notification
3. ✅ Verify notifications appear
4. ✅ Set up cron job to call `/api/push/send-daily`

## How the Flow Works

```
1. User clicks "Enable Notifications"
   ↓
2. Browser requests permission
   ↓
3. Service worker registers push subscription
   ↓
4. Subscription saved to server (subscriptions.json)
   ↓
5. Server sends push notification via Web Push API
   ↓
6. Service worker receives 'push' event
   ↓
7. Service worker displays notification
   ↓
8. User clicks notification
   ↓
9. Service worker handles 'notificationclick' event
   ↓
10. App window opens/focuses
```

## Advanced Configuration

### Add Custom Data to Notifications

In your API route:
```typescript
const payload = JSON.stringify({
  title: "New Message",
  body: "You have a new message from John",
  url: "/messages/123",
  data: {
    messageId: "123",
    userId: "456"
  }
});
```

Access in service worker:
```javascript
self.addEventListener('notificationclick', function(event) {
  const messageId = event.notification.data.messageId;
  const url = `/messages/${messageId}`;
  clients.openWindow(url);
});
```

### Add Images to Notifications

```javascript
const notificationOptions = {
  body: notificationData.body,
  icon: '/icon-192x192.png',
  image: '/notification-image.jpg',  // Add hero image
  badge: '/icon-192x192.png'
};
```

### Silent Notifications (Background Sync)

```javascript
// In your API, omit title/body to make it silent
const payload = JSON.stringify({
  silent: true,
  data: { action: 'sync' }
});
```

## Monitoring & Analytics

Track notification engagement:

```javascript
self.addEventListener('notificationclick', function(event) {
  // Log analytics
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      event: 'notification_click',
      action: event.action,
      timestamp: Date.now()
    })
  });
});
```

## Next Steps

1. ✅ **Test notifications locally**
2. ✅ **Customize notification content**
3. ✅ **Update notification icons**
4. ✅ **Deploy to production**
5. ✅ **Set up cron job for daily notifications**
6. ✅ **Monitor notification delivery and engagement**

---

## Quick Test

Run this now:

```bash
# 1. Make sure server is running
npm run dev

# 2. In browser: Enable notifications

# 3. Send test notification
curl -X POST http://localhost:3000/api/push/send-test

# You should see a notification appear! 🎉
```

**Your push notifications are now fully configured and ready to use!** 🚀

