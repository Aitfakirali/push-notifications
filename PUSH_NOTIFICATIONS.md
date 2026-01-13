# 🔔 Push Notifications Guide

Complete guide for using push notifications in your PWA with MongoDB storage.

## 📋 Table of Contents

1. [Setup](#setup)
2. [Configuration](#configuration)
3. [Testing](#testing)
4. [API Reference](#api-reference)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup

### 1. Install Dependencies

Already installed:
```bash
npm install mongoose web-push
```

### 2. Generate VAPID Keys

VAPID keys are required for web push authentication. Generate them once:

```bash
node scripts/generate-vapid-keys.js
```

This will output something like:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BHxT5zy...
VAPID_PRIVATE_KEY=abc123def...
```

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/push-notifications

# VAPID Keys (from step 2)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BHxT5zy...
VAPID_PRIVATE_KEY=abc123def...

# Your email or website URL
VAPID_SUBJECT=mailto:your-email@example.com
```

### 4. Setup MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
5. Get your connection string
6. Replace `<username>`, `<password>`, and `<database>` in the connection string

#### Option B: Local MongoDB

1. Install MongoDB locally:
   ```bash
   # macOS
   brew install mongodb-community
   brew services start mongodb-community
   
   # Linux
   sudo apt-get install mongodb
   sudo systemctl start mongodb
   ```

2. Use local connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/push-notifications
   ```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Yes | VAPID public key (safe to expose) |
| `VAPID_PRIVATE_KEY` | Yes | VAPID private key (keep secret!) |
| `VAPID_SUBJECT` | No | Your email or website URL (defaults to mailto:admin@example.com) |

### Database Schema

Subscriptions are stored in MongoDB with this schema:

```typescript
{
  endpoint: String (unique),
  keys: {
    p256dh: String,
    auth: String
  },
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing

### Test Push Notifications in Browser

1. **Open the app**: [http://localhost:3000](http://localhost:3000)

2. **Subscribe**: Click "🔔 Enable Notifications"
   - Browser will ask for permission
   - Click "Allow"
   - Subscription will be saved to MongoDB

3. **Send test notification**: Click "📤 Send Test Notification"
   - Should see a notification appear
   - Works even when browser is minimized!

4. **Check MongoDB**: Verify subscription was saved
   ```bash
   # Using MongoDB Compass or mongo shell
   db.subscriptions.find()
   ```

### Test API with cURL

#### Subscribe to Push Notifications

First, get a subscription object from the browser console:

```javascript
// In browser console
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(sub => 
    console.log(JSON.stringify(sub.toJSON(), null, 2))
  )
);
```

Then test the subscribe API:

```bash
curl -X POST http://localhost:3000/api/push/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }'
```

#### Send Push Notification

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello from cURL! 🎉",
    "body": "This is a test notification",
    "icon": "/icon-192x192.png",
    "data": {
      "url": "https://example.com",
      "customField": "customValue"
    }
  }'
```

#### List All Subscriptions

```bash
curl http://localhost:3000/api/push/list-subscriptions
```

#### Unsubscribe

```bash
curl -X POST http://localhost:3000/api/push/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/..."
  }'
```

---

## 📡 API Reference

### GET `/api/push/vapid-public-key`

Get the VAPID public key for subscribing to push notifications.

**Response:**
```json
{
  "publicKey": "BHxT5zy..."
}
```

---

### POST `/api/push/subscribe`

Subscribe a device to push notifications. Saves subscription to MongoDB.

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription saved successfully",
  "subscriptionId": "507f1f77bcf86cd799439011"
}
```

---

### POST `/api/push/unsubscribe`

Unsubscribe a device from push notifications.

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription removed successfully"
}
```

---

### POST `/api/push/send`

Send push notifications to all subscribed devices.

**Request Body:**
```json
{
  "title": "Notification Title",
  "body": "Notification body text",
  "icon": "/icon-192x192.png",
  "badge": "/icon-192x192.png",
  "image": "/optional-large-image.jpg",
  "tag": "unique-tag",
  "requireInteraction": false,
  "data": {
    "url": "https://example.com",
    "customField": "any value"
  },
  "actions": [
    {
      "action": "open",
      "title": "Open App",
      "icon": "/icons/open.png"
    },
    {
      "action": "close",
      "title": "Dismiss"
    }
  ]
}
```

**Required Fields:**
- `title` (string)
- `body` (string)

**Optional Fields:**
- `icon` (string) - Small icon URL (default: /icon-192x192.png)
- `badge` (string) - Badge icon URL (default: /icon-192x192.png)
- `image` (string) - Large image URL
- `tag` (string) - Notification tag (replaces previous with same tag)
- `requireInteraction` (boolean) - Keep notification visible until clicked
- `data` (object) - Custom data payload
- `actions` (array) - Action buttons

**Response:**
```json
{
  "success": true,
  "message": "Notifications sent",
  "stats": {
    "total": 5,
    "successful": 4,
    "failed": 0,
    "removed": 1
  },
  "results": [
    {
      "endpoint": "https://...",
      "status": "fulfilled",
      "success": true
    }
  ]
}
```

---

### GET `/api/push/list-subscriptions`

Get all subscribed devices from MongoDB.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "subscriptions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-01-13T10:30:00.000Z",
      "updatedAt": "2026-01-13T10:30:00.000Z"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### "VAPID keys not found" Error

**Problem:** Environment variables not loaded.

**Solution:**
1. Make sure `.env.local` exists in project root
2. Restart dev server after creating/editing `.env.local`
3. Verify keys are in correct format (no quotes, no extra spaces)

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

### "Please define the MONGODB_URI" Error

**Problem:** MongoDB connection string missing.

**Solution:**
1. Create `.env.local` file
2. Add `MONGODB_URI=...`
3. Restart dev server

---

### Notifications Not Appearing

**Problem:** Various causes.

**Checklist:**
- ✅ Notification permission granted? (Check browser settings)
- ✅ Service worker registered? (Check DevTools → Application → Service Workers)
- ✅ Subscribed successfully? (Check status in UI)
- ✅ Browser supports push? (Chrome, Firefox, Edge, Safari 16+)
- ✅ HTTPS or localhost? (Push only works on secure contexts)

**Check browser console for errors:**
```
F12 → Console tab
```

**Check service worker console:**
```
F12 → Application → Service Workers → Click "inspect" under your SW
```

---

### Expired Subscriptions

**Problem:** Subscription endpoint returns 410 Gone or 404 Not Found.

**Solution:** This is handled automatically! The API will:
1. Detect expired subscriptions
2. Remove them from MongoDB
3. Report them in the response stats

You'll see this in the response:
```json
{
  "stats": {
    "removed": 1
  }
}
```

---

### MongoDB Connection Issues

**Problem:** Can't connect to MongoDB.

**Atlas (Cloud):**
1. Check IP whitelist (add 0.0.0.0/0 for all IPs)
2. Verify username/password
3. Check connection string format
4. Ensure cluster is running

**Local:**
1. Check MongoDB is running: `brew services list`
2. Start if needed: `brew services start mongodb-community`
3. Test connection: `mongosh`

---

### Testing with Multiple Devices

**Problem:** Want to test notifications on multiple devices.

**Solution:**

1. **Deploy to production** (Vercel, Netlify, etc.)
   ```bash
   npm run build
   vercel --prod
   ```

2. **Use ngrok for local testing:**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Start your dev server
   npm run dev
   
   # In another terminal, tunnel to localhost:3000
   ngrok http 3000
   
   # Access the https URL on any device
   ```

3. **Subscribe on each device** - Each will be saved separately in MongoDB

---

## 🔐 Security Best Practices

### 1. Protect VAPID Private Key
- ✅ Keep in `.env.local` (not in git)
- ✅ Use environment variables in production
- ❌ Never expose in client-side code
- ❌ Never commit to version control

### 2. Secure MongoDB Connection
- ✅ Use strong passwords
- ✅ Enable IP whitelisting
- ✅ Use MongoDB Atlas for production
- ✅ Enable encryption at rest

### 3. Rate Limiting (Production)
Add rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const sendNotificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests, please try again later',
});
```

### 4. Authentication (Production)
Protect `/api/push/send` endpoint:

```typescript
// Add authentication middleware
if (req.headers.authorization !== `Bearer ${process.env.API_SECRET}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

---

## 🚀 Production Deployment

### Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

```
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BHxT5zy...
VAPID_PRIVATE_KEY=abc123def...
VAPID_SUBJECT=mailto:your-email@example.com
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY
vercel env add VAPID_PRIVATE_KEY
vercel env add VAPID_SUBJECT

# Deploy to production
vercel --prod
```

### Test Production Push Notifications

```bash
curl -X POST https://your-app.vercel.app/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Production Test",
    "body": "Push notifications working in production!"
  }'
```

---

## 📱 Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ v42+ | ✅ v42+ | Full support |
| Firefox | ✅ v44+ | ✅ v48+ | Full support |
| Edge | ✅ v17+ | ✅ v79+ | Full support |
| Safari | ✅ v16+ | ✅ v16.4+ | iOS requires Add to Home Screen |
| Opera | ✅ v29+ | ✅ v29+ | Full support |

**Notes:**
- iOS Safari requires the app to be added to home screen (installed as PWA)
- Push notifications require HTTPS (except localhost)
- Service workers required

---

## 🎯 Next Steps

### Enhance Notifications

1. **Add custom actions:**
   ```javascript
   actions: [
     { action: 'view', title: 'View', icon: '/icons/view.png' },
     { action: 'dismiss', title: 'Dismiss' }
   ]
   ```

2. **Handle action clicks in service worker:**
   ```javascript
   self.addEventListener('notificationclick', (event) => {
     if (event.action === 'view') {
       // Navigate to specific page
       clients.openWindow('/notifications');
     }
   });
   ```

3. **Add notification scheduling:**
   - Store scheduled notifications in MongoDB
   - Use cron jobs or serverless functions
   - Send at specific times

### Add User Management

1. **Associate subscriptions with users:**
   ```typescript
   // Add userId to subscription model
   {
     userId: String,
     endpoint: String,
     keys: { ... }
   }
   ```

2. **Send to specific users:**
   ```typescript
   // Find subscriptions by userId
   const subscriptions = await Subscription.find({ userId });
   ```

### Analytics

1. **Track notification performance:**
   - Delivery rate
   - Click-through rate
   - Conversion rate

2. **Store in MongoDB:**
   ```typescript
   {
     notificationId: String,
     sentAt: Date,
     clickedAt: Date,
     userId: String
   }
   ```

---

## 📚 Additional Resources

- [MDN Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push npm package](https://github.com/web-push-libs/web-push)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [VAPID Protocol](https://tools.ietf.org/html/rfc8292)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

---

## ✅ Checklist

- [ ] Generate VAPID keys
- [ ] Configure environment variables
- [ ] Setup MongoDB (Atlas or local)
- [ ] Test subscription in browser
- [ ] Send test notification
- [ ] Verify subscription in MongoDB
- [ ] Test API endpoints with cURL
- [ ] Test on multiple devices
- [ ] Deploy to production
- [ ] Setup monitoring/analytics

---

## 💬 Support

If you run into issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review browser console for errors
3. Check service worker console
4. Verify environment variables are set correctly
5. Ensure MongoDB connection is working

---

**🎉 You're all set! Enjoy your push notifications!**
