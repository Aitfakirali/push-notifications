# 🚀 Quick Start: Testing on iPhone

## ⚠️ IMPORTANT: iOS Simulator Does NOT Support Push Notifications!

You need a **real iPhone device** (iOS 16.4 or later) to test push notifications.

## 📱 Fast Setup (3 Steps)

### Step 1: Start Dev Server (Terminal 1)
```bash
npm run dev
```

Keep this running!

### Step 2: Start ngrok Tunnel (Terminal 2)
```bash
./test-ios.sh
```

Or manually:
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Step 3: Test on iPhone

1. **Open Safari** on your iPhone (must use Safari!)
2. **Navigate to** the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
3. **Click "Enable Notifications"**
4. **Allow** when prompted
5. **Back on your Mac**, open http://localhost:3000
6. **Click "Send Test Notification"**
7. **Lock your iPhone** or switch to another app
8. **See the notification!** 🎉

## 🎯 Testing Flow

```
Your Mac (Web Browser)                 iPhone
─────────────────────                  ──────────
http://localhost:3000  ──── ngrok ───> Safari
       ↓                                   ↓
Click "Send Test"                  Subscribe to notifications
       ↓                                   ↓
API sends push                     Notification appears! 🔔
```

## 📋 Quick Checklist

- [ ] Real iPhone (iOS 16.4+) - NOT simulator
- [ ] Dev server running (`npm run dev`)
- [ ] ngrok running (`./test-ios.sh`)
- [ ] Safari browser on iPhone (not Chrome)
- [ ] Opened ngrok HTTPS URL on iPhone
- [ ] Enabled notifications on iPhone
- [ ] Sent test from Mac browser
- [ ] Locked iPhone to see notification

## 🔍 Troubleshooting

### "Service workers are not supported"
- ✅ Use Safari browser (not Chrome)
- ✅ Ensure iOS version is 16.4 or higher
- ✅ Make sure you're using HTTPS ngrok URL

### "Can't see notification"
- ✅ Lock your iPhone (notifications show when locked)
- ✅ Check Do Not Disturb is OFF
- ✅ Go to Settings > Notifications > Safari > Allow
- ✅ Check console on iPhone via Safari Web Inspector

### "ngrok session expired"
- Restart: `./test-ios.sh`
- Copy new URL
- Reopen on iPhone

## 💡 Pro Tip: Add to Home Screen

For best PWA experience on iPhone:
1. Open the ngrok URL in Safari
2. Tap the Share button
3. Scroll down, tap "Add to Home Screen"
4. Tap "Add"
5. Open from home screen icon
6. Then enable notifications

This makes it feel like a native app!

## 🎨 What Your iPhone Will See

**Notification appearance:**
- 🔔 Title (e.g., "Good Morning! ☀️")
- 📝 Body message
- 🖼️ Your app icon
- 📱 Two buttons: "Open App" and "Dismiss"
- 📳 Vibration pattern

**When clicked:**
- Opens or focuses your PWA
- Logs to console

## 🚀 Next Steps

1. ✅ Test basic notification (follow steps above)
2. ✅ Try "Send Test Notification" button
3. ✅ Start cron scheduler: `npm run cron` (for daily notifications)
4. ✅ Customize notification message in `app/api/push/send-daily/route.ts`
5. ✅ Deploy to production (Vercel) for permanent HTTPS

## 📖 Full Guide

See **TESTING_IOS.md** for:
- Alternative testing methods
- Local IP + HTTPS setup
- Vercel deployment
- Advanced debugging
- iOS-specific behaviors

---

**Ready?** Run `./test-ios.sh` in a new terminal and follow the steps! 📱

