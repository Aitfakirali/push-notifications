# Testing Push Notifications on iOS - Complete Guide

## ⚠️ Important: iOS Simulator Limitations

**iOS Simulators DO NOT support push notifications.** You need:
- ✅ Real iPhone device (iOS 16.4+)
- ✅ HTTPS connection (required for service workers)
- ✅ Safari browser

## 🎯 Testing Options for iOS

### Option 1: Test on Real iPhone (Recommended)

#### Step 1: Expose Your Local Server via ngrok

**Install ngrok:**
```bash
# macOS with Homebrew
brew install ngrok

# Or download from https://ngrok.com/download
```

**Start your dev server:**
```bash
npm run dev
```

**In a new terminal, expose it:**
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

#### Step 2: Update Environment Variables

Create a temporary `.env.local.ios` file:
```bash
cp .env.local .env.local.ios
```

Edit `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BA-QLQ2Z945ZGkESjKYMeMYrcSm8tADhFwqOlijr2CkFavdLA-ndiwTFsjyX1uiQRoF5nKt92mNQuvd-uqiZb60
VAPID_PRIVATE_KEY=pjPFCiZ0YHRx3ue0_cCmL81sjhA9SjFTz9U0XT6ZY50
VAPID_SUBJECT=mailto:your-email@example.com
CRON_SECRET=26872c8ccd27bab087066496b67cc90b1e26f6e43b0dd6302e9073948ec6f319
APP_URL=https://abc123.ngrok.io  # ⬅️ Change this to your ngrok URL
```

**Restart your dev server:**
```bash
npm run dev
```

#### Step 3: Test on iPhone

1. **Open Safari** on your iPhone (not Chrome or any other browser)
2. **Navigate to:** `https://abc123.ngrok.io` (your ngrok URL)
3. **Click "Enable Notifications"**
4. **Allow notifications** when prompted
5. **Add to Home Screen** (recommended for full PWA experience):
   - Tap the Share button
   - Scroll down and tap "Add to Home Screen"
   - Tap "Add"
6. **Send a test notification**
7. **Lock your iPhone** or switch to another app to see the notification

### Option 2: Use Your Mac's IP Address (Same Wi-Fi Network)

If your iPhone and Mac are on the same Wi-Fi:

#### Step 1: Find Your Mac's IP Address

```bash
# macOS
ipconfig getifaddr en0  # For Wi-Fi
# Or
ifconfig | grep "inet "
```

You'll get something like: `192.168.1.100`

#### Step 2: Configure HTTPS with Self-Signed Certificate

**Install mkcert:**
```bash
brew install mkcert
mkcert -install
```

**Create certificate for your local IP:**
```bash
cd /Users/mac/dev/frontend/push-notifications
mkcert localhost 127.0.0.1 192.168.1.100 ::1
```

This creates:
- `localhost+3.pem` (certificate)
- `localhost+3-key.pem` (private key)

#### Step 3: Update next.config.js

```javascript
const fs = require('fs');
const path = require('path');

const withPWA = require("next-pwa")({
	fallbacks: {
		document: "/_offline",
	},
	dest: "public",
	cacheStartUrl: false,
	dynamicStartUrl: false,
	disable: false,
	register: true,
	skipWaiting: true,
	reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
};

// For local development with HTTPS
if (process.env.NODE_ENV === 'development') {
	const httpsConfig = {
		key: fs.readFileSync('./localhost+3-key.pem'),
		cert: fs.readFileSync('./localhost+3.pem'),
	};
}

module.exports = withPWA(nextConfig);
```

#### Step 4: Start Server with HTTPS

Create a custom server file:

```bash
cat > server.js << 'EOF'
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./localhost+3-key.pem'),
  cert: fs.readFileSync('./localhost+3.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
  });
});
EOF
```

**Update package.json:**
```json
"scripts": {
  "dev": "node server.js",
  "dev:http": "next dev",
  ...
}
```

**Install certificate on iPhone:**
1. Text/email yourself the `localhost+3.pem` file
2. Open on iPhone, install profile
3. Settings > General > About > Certificate Trust Settings
4. Enable trust for the certificate

#### Step 5: Test

1. Open Safari on iPhone
2. Go to `https://192.168.1.100:3000`
3. Enable notifications and test!

### Option 3: Deploy to a Testing Service (Easiest)

**Deploy to Vercel (Free):**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /Users/mac/dev/frontend/push-notifications
vercel
```

Follow prompts, then:
1. Open the deployed URL on your iPhone
2. Test notifications
3. Works perfectly with HTTPS

## 🧪 Testing Workflow

### From Your Web Browser (Development Machine)

**Terminal 1 - Start dev server:**
```bash
npm run dev
```

**Terminal 2 - Start ngrok:**
```bash
ngrok http 3000
```

**Terminal 3 - Start cron (optional):**
```bash
npm run cron
```

### Send Notification from Web to iPhone

Once your iPhone is subscribed:

**Method 1: Click "Send Test Notification" in the web UI**
- Open `http://localhost:3000` on your Mac
- Click the button
- Notification appears on your iPhone! 📱

**Method 2: Use curl from terminal:**
```bash
curl -X POST http://localhost:3000/api/push/send-test
```

**Method 3: Call via JavaScript:**
```javascript
fetch('http://localhost:3000/api/push/send-test', {
  method: 'POST'
});
```

## 📋 Complete Testing Checklist

### One-Time Setup (Choose One Method)

- [ ] **Option A: ngrok** (Easiest)
  - [ ] Install ngrok
  - [ ] Start ngrok: `ngrok http 3000`
  - [ ] Update `APP_URL` in `.env.local`
  
- [ ] **Option B: Local IP + HTTPS**
  - [ ] Install mkcert
  - [ ] Generate certificates
  - [ ] Create custom server
  - [ ] Install cert on iPhone
  
- [ ] **Option C: Vercel**
  - [ ] Deploy to Vercel
  - [ ] Use Vercel URL

### Every Testing Session

- [ ] Start dev server: `npm run dev`
- [ ] (If using ngrok) Start ngrok: `ngrok http 3000`
- [ ] Open Safari on iPhone
- [ ] Navigate to your HTTPS URL
- [ ] Subscribe to notifications
- [ ] Send test from web browser
- [ ] Check iPhone for notification

## 🔍 Debugging iOS Notifications

### Check iOS Requirements

**Minimum Requirements:**
- iOS 16.4+ (check Settings > General > About > iOS Version)
- Safari browser
- HTTPS connection
- Notification permissions granted

### Enable Web Inspector on iPhone

1. **iPhone Settings:**
   - Settings > Safari > Advanced > Web Inspector (ON)

2. **Mac Safari:**
   - Safari > Develop > [Your iPhone] > [Your Page]
   - View console logs

### Common Issues & Solutions

#### Issue: "Service workers are not supported"

**Solution:** 
- Use Safari (not Chrome)
- Ensure iOS 16.4+
- Must be HTTPS (not http://)

#### Issue: "Add to Home Screen" required?

**For iOS, best experience:**
1. Open in Safari
2. Tap Share button
3. "Add to Home Screen"
4. Open from home screen
5. Then enable notifications

#### Issue: Notifications not appearing

**Check:**
- [ ] Notification permission granted
- [ ] "Do Not Disturb" is off
- [ ] Banner style is set in Settings > Notifications
- [ ] Test with phone locked

#### Issue: ngrok session expired

**Solution:**
```bash
# Stop ngrok (Ctrl+C)
# Start new session
ngrok http 3000

# Update .env.local with new URL
# Restart dev server
```

## 📱 iOS-Specific Notification Behavior

**iOS shows notifications:**
- ✅ When app is in background
- ✅ When phone is locked
- ✅ When using another app

**iOS does NOT show notifications:**
- ❌ When PWA is in foreground and active
- ❌ When "Do Not Disturb" is on
- ❌ If notification permissions denied

**To see notification while testing:**
- Lock your iPhone, OR
- Switch to another app, OR
- Press home button

## 🚀 Quick Start Script

Save this as `test-ios.sh`:

```bash
#!/bin/bash

echo "🚀 Starting iOS Push Notification Testing"
echo "========================================"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "⚠️  ngrok not installed. Install with: brew install ngrok"
    exit 1
fi

# Start dev server in background
echo "📱 Starting dev server..."
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Start ngrok
echo "🌐 Starting ngrok tunnel..."
ngrok http 3000 &
NGROK_PID=$!

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the ngrok HTTPS URL from above"
echo "2. Update APP_URL in .env.local"
echo "3. Restart this script"
echo "4. Open the ngrok URL on your iPhone"
echo "5. Enable notifications"
echo "6. Send test notification!"
echo ""
echo "Press Ctrl+C to stop"

# Wait for user to stop
wait
```

Make it executable and run:
```bash
chmod +x test-ios.sh
./test-ios.sh
```

## 📊 Testing Results Comparison

| Method | Setup Time | HTTPS | Cost | Best For |
|--------|-----------|-------|------|----------|
| ngrok | 2 min | ✅ Yes | Free | Quick testing |
| Local IP + HTTPS | 10 min | ✅ Yes | Free | Offline testing |
| Vercel Deploy | 5 min | ✅ Yes | Free | Production-like |

## 💡 Pro Tips

1. **Use ngrok for quick tests** - Easiest setup
2. **Install PWA on home screen** - Better iOS integration
3. **Test with phone locked** - Most realistic scenario
4. **Check Safari Web Inspector** - See console logs
5. **Keep ngrok URL** - Share with team for testing

## ✨ Summary

**For iPhone 15 Testing:**
1. ❌ iOS Simulator won't work
2. ✅ Use real iPhone device (iOS 16.4+)
3. ✅ Use ngrok for HTTPS tunnel
4. ✅ Open in Safari (not other browsers)
5. ✅ Subscribe on iPhone
6. ✅ Send from your web UI on Mac
7. ✅ Lock phone to see notification

**Ready to start?** Choose ngrok method - it's the fastest! 🚀

