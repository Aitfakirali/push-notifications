# Service Worker Installation Issues - Troubleshooting Guide

## ✅ Fixed Configuration

I've updated your `next.config.js` to properly handle the service worker installation.

### Changes Made:

1. **Disabled PWA in development** - Prevents caching issues during development
2. **Improved service worker registration** - Better logging and error handling
3. **Added clean build script** - Ensures fresh builds

## 🔧 How to Fix Service Worker Issues

### Step 1: Clean Previous Build

```bash
./clean-build.sh
```

Or manually:
```bash
rm -rf .next
rm -f public/sw.js public/sw.js.map public/workbox-*.js public/worker-*.js public/fallback-*.js
npm run build
npm run add-push-handlers
```

### Step 2: Check Service Worker in DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in the left sidebar
4. You should see:
   - ✅ Status: "activated and is running"
   - ✅ Source: `/sw.js`
   - ✅ Scope: `/`

### Step 3: Verify in Console

When you load the page, you should see these logs:

```
✅ Service Worker registered successfully
   Scope: http://localhost:3000/
   State: activated
✅ Service Worker is active and ready
✅ Service Worker ready for push notifications
✅ Push Manager is available
[Push Handler] ✅ Push notification handlers registered successfully
```

### Step 4: Check for Errors

If you see errors, check:

#### Error: "Service Worker registration failed"
**Cause:** Not using HTTPS or localhost

**Solution:**
- Development: Use `localhost` (works without HTTPS)
- Testing on iPhone: Use ngrok for HTTPS
- Production: Deploy with HTTPS

#### Error: "Failed to register a ServiceWorker"
**Cause:** Scope or path issues

**Solution:**
- Service worker file must be at `/sw.js` (root of public folder)
- Check browser console for specific error
- Try hard refresh: `Cmd+Shift+R` or `Ctrl+Shift+R`

#### Error: "An unknown error occurred"
**Cause:** Old service worker cached

**Solution:**
```javascript
// In DevTools Console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});

// Then hard refresh
```

## 🎯 Testing Modes

### Development Mode (Recommended)

```bash
npm run dev
```

**Behavior:**
- PWA features disabled (no aggressive caching)
- Service worker NOT active (per new config)
- Easier debugging
- Hot reload works

**To test push notifications in dev:**
1. Build for production: `npm run build`
2. Run production server: `npm start`
3. Test notifications

### Production Mode

```bash
npm run build
npm start
```

**Behavior:**
- PWA fully active
- Service worker caches assets
- Push notifications work
- Offline support enabled

## 🔍 Debug Service Worker

### Check Registration Status

Open DevTools Console and run:

```javascript
// Check if service worker is supported
console.log('SW supported:', 'serviceWorker' in navigator);

// Check registration
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('✅ Registered');
    console.log('Scope:', reg.scope);
    console.log('Active:', reg.active?.state);
    console.log('Installing:', reg.installing?.state);
    console.log('Waiting:', reg.waiting?.state);
  } else {
    console.log('❌ Not registered');
  }
});

// Check for push subscription
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Push subscription:', sub ? '✅ Exists' : '❌ None');
  });
});
```

### View Service Worker Source

1. DevTools > Application > Service Workers
2. Click "source" link next to service worker
3. Verify `[Push Handler]` code is present
4. Set breakpoints to debug

### Force Update Service Worker

```javascript
// In console:
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update().then(() => {
    console.log('Service Worker updated');
  });
});
```

### Unregister All Service Workers

```javascript
// In console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => {
    reg.unregister().then(() => {
      console.log('Unregistered:', reg.scope);
    });
  });
});

// Then refresh the page
```

## 📋 Updated next.config.js

Your new configuration:

```javascript
const withPWA = require("next-pwa")({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development", // KEY CHANGE
	reloadOnOnline: true,
	publicExcludes: ['!sw-push.js', '!push-handler.js'],
	buildExcludes: [/middleware-manifest\.json$/],
});
```

**Key Points:**
- `disable: process.env.NODE_ENV === "development"` - PWA off in dev
- Service worker only active in production build
- Push handlers automatically added after build

## 🚀 Recommended Workflow

### For Development:
```bash
# Regular development (no PWA)
npm run dev

# When you need to test PWA features:
npm run build
npm start
```

### For Testing Push Notifications:
```bash
# Terminal 1: Production build
npm run build
npm start

# Terminal 2: ngrok for iPhone testing
./test-ios.sh

# Terminal 3: Cron scheduler (optional)
npm run cron
```

## ✅ Verification Checklist

After following these steps:

- [ ] Ran clean build: `./clean-build.sh` OR `npm run build`
- [ ] Started production server: `npm start`
- [ ] Opened DevTools > Application > Service Workers
- [ ] See "activated and is running" status
- [ ] Console shows "✅ Service Worker registered successfully"
- [ ] Console shows "[Push Handler] ✅ Push notification handlers registered"
- [ ] Can click "Enable Notifications" without errors
- [ ] Push subscription created successfully
- [ ] Test notification appears

## 💡 Quick Fix Commands

```bash
# Complete reset and rebuild
./clean-build.sh
npm start

# Just rebuild (if you made code changes)
npm run build
npm run add-push-handlers

# Check service worker file
cat public/sw.js | grep "Push Handler"

# Should show: [Push Handler] lines if properly installed
```

## 🎯 Expected Console Output

When everything works correctly:

```
✅ Service Worker registered successfully
   Scope: http://localhost:3000/
   State: activated
✅ Service Worker is active and ready
✅ Service Worker ready for push notifications
✅ Push Manager is available
ℹ️ Not subscribed to push notifications yet
[Push Handler] ✅ Push notification handlers registered successfully

[After clicking "Enable Notifications":]
✅ Already subscribed to push notifications
Successfully subscribed to notifications!

[When test notification sent:]
[Push Handler] Push notification received
[Push Handler] Parsed notification data: {title: "...", body: "..."}
[Push Handler] Notification displayed successfully
```

## 🆘 Still Not Working?

Try this nuclear option:

```bash
# 1. Stop all servers (Ctrl+C in all terminals)

# 2. Complete clean
rm -rf .next node_modules package-lock.json
rm -f public/sw.js public/workbox-*.js public/worker-*.js public/fallback-*.js

# 3. Fresh install
npm install

# 4. Build
npm run build

# 5. Start
npm start

# 6. Clear browser
# DevTools > Application > Clear storage > Clear site data

# 7. Hard refresh
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

**Current Status:** Your service worker configuration has been updated. Run `npm run build && npm start` to test!

