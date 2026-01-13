# 🚀 Quick Start - Push Notifications

Get push notifications working in **5 minutes**!

## Step 1: Generate VAPID Keys (30 seconds)

```bash
node scripts/generate-vapid-keys.js
```

You'll see output like:

```
✅ VAPID Keys Generated Successfully!

📋 Copy these to your .env.local file:
──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BHxT5zy...
VAPID_PRIVATE_KEY=abc123def...
──────────────────────────────────────────────────────────────────────
```

## Step 2: Create `.env.local` File (1 minute)

Create `.env.local` in your project root:

```bash
cp env.template .env.local
```

Edit `.env.local` and paste your VAPID keys:

```env
# MongoDB (use local or Atlas)
MONGODB_URI=mongodb://localhost:27017/push-notifications

# VAPID Keys (paste from Step 1)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BHxT5zy...
VAPID_PRIVATE_KEY=abc123def...

# Your email
VAPID_SUBJECT=mailto:your-email@example.com
```

## Step 3: Setup MongoDB (2 minutes)

### Option A: Local MongoDB (fastest for testing)

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download from: https://www.mongodb.com/try/download/community
```

### Option B: MongoDB Atlas (recommended for production)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (no credit card required)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all)
5. Get connection string
6. Paste into `.env.local`

## Step 4: Start Dev Server (30 seconds)

```bash
npm run dev
```

## Step 5: Test Push Notifications (1 minute)

1. **Open browser**: [http://localhost:3000](http://localhost:3000)

2. **Enable notifications**: Click "🔔 Enable Notifications"
   - Browser asks for permission
   - Click "Allow"
   - Status changes to "Subscribed" ✅

3. **Send test notification**: Click "📤 Send Test Notification"
   - Notification appears!
   - Even works when browser is minimized! 🎉

4. **Test API** (optional):
   ```bash
   curl -X POST http://localhost:3000/api/push/send \
     -H "Content-Type: application/json" \
     -d '{"title":"API Test","body":"It works!"}'
   ```

## ✅ Success!

You should see:
- ✅ Notification permission granted
- ✅ Status shows "Subscribed"
- ✅ Test notification appears
- ✅ Subscription saved in MongoDB

---

## 🐛 Troubleshooting

### "VAPID keys not found"
- Did you create `.env.local`?
- Did you restart dev server after creating it?
- Restart: `Ctrl+C` then `npm run dev`

### "MongoDB connection failed"
- Is MongoDB running? `brew services list`
- Try local: `MONGODB_URI=mongodb://localhost:27017/push-notifications`
- Or use MongoDB Atlas (cloud)

### Notification not appearing
- Did you click "Allow" for notifications?
- Check browser settings → Site settings → Notifications
- Try in Chrome/Firefox/Edge (best support)

---

## 📡 API Endpoints

Now that it's working, you can send notifications via API:

### Send Notification

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Message",
    "body": "You have a new message!",
    "icon": "/icon-192x192.png",
    "data": {
      "url": "/messages"
    }
  }'
```

### List Subscriptions

```bash
curl http://localhost:3000/api/push/list-subscriptions
```

---

## 📚 Next Steps

1. **Customize notifications** - Add images, actions, badges
2. **Deploy to production** - Vercel, Netlify, etc.
3. **Add user management** - Associate subscriptions with users
4. **Read full docs** - See [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md)

---

## 🎉 That's It!

You now have a fully working PWA with push notifications!

**Questions?** Check [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md) for detailed documentation.
