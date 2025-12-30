# 🔧 Troubleshooting Guide

## Button Stays in "Loading..." State

If the "Enable Notifications" button gets stuck in loading state, here are the fixes:

### Issue: Loading State Not Resetting

**Symptoms:**
- Button shows "Loading..." indefinitely
- Button becomes disabled and doesn't respond
- No error message appears

**Solutions:**

#### 1. Check Browser Console
Open DevTools (F12 or Cmd+Option+I) and check the Console tab for errors:

```javascript
// Common errors:
- "Service worker registration failed"
- "Failed to get VAPID key"
- "NotAllowedError: Registration failed"
```

#### 2. Verify .env.local File Exists
```bash
ls -la .env.local
```

If it doesn't exist, create it:
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BA-QLQ2Z945ZGkESjKYMeMYrcSm8tADhFwqOlijr2CkFavdLA-ndiwTFsjyX1uiQRoF5nKt92mNQuvd-uqiZb60
VAPID_PRIVATE_KEY=pjPFCiZ0YHRx3ue0_cCmL81sjhA9SjFTz9U0XT6ZY50
VAPID_SUBJECT=mailto:your-email@example.com
CRON_SECRET=26872c8ccd27bab087066496b67cc90b1e26f6e43b0dd6302e9073948ec6f319
APP_URL=http://localhost:3000
EOF
```

Then restart the dev server:
```bash
npm run dev
```

#### 3. Check Browser Permissions
- Make sure you're on `localhost` or `https://`
- Check if notifications are blocked in browser settings
- Try in a different browser (Chrome/Edge recommended)

#### 4. Clear Service Worker Cache
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Click **Unregister** for any service workers
5. Click **Clear storage** > **Clear site data**
6. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

#### 5. Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

#### 6. Check Service Worker Registration
Open DevTools > Application > Service Workers

You should see:
- Status: **activated and running**
- Source: `/sw.js`

If not registered:
1. Clear cache
2. Hard refresh
3. Check console for errors

### Common Error Messages & Fixes

#### "Service workers are not supported"
**Solution:** Use a modern browser (Chrome, Edge, Firefox, Safari 11.1+)

#### "Push notifications are not supported"
**Solution:** 
- Use HTTPS or localhost
- Update your browser to latest version
- Try Chrome/Edge (best support)

#### "Notification permission denied"
**Solution:**
1. Click the 🔒 or ⓘ icon in address bar
2. Change Notifications to "Allow"
3. Refresh the page
4. Try again

#### "Failed to get VAPID key"
**Solution:**
1. Verify `.env.local` exists
2. Check the file contains `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
3. Restart dev server: `npm run dev`

#### "VAPID public key is missing"
**Solution:**
1. Check `.env.local` has correct format
2. No spaces around `=` sign
3. Keys should be on single lines
4. Restart dev server

### Browser-Specific Issues

#### Safari
- Requires iOS 16.4+ or macOS 13+
- Must add to home screen first on iOS
- Check Settings > Safari > Notifications

#### Firefox
- Check `about:preferences#privacy`
- Ensure "Block new requests" is unchecked
- Clear site permissions and try again

#### Chrome/Edge
- Check `chrome://settings/content/notifications`
- Remove site from blocked list if present
- Try incognito mode to test

### Still Not Working?

#### Debug Checklist
- [ ] `.env.local` file exists
- [ ] Dev server is running (`npm run dev`)
- [ ] Using localhost or HTTPS
- [ ] Browser supports push notifications
- [ ] Notifications not blocked in browser
- [ ] Service worker registered
- [ ] No console errors
- [ ] Tried hard refresh
- [ ] Tried different browser

#### Test API Endpoint Directly
```bash
# Test VAPID key endpoint
curl http://localhost:3000/api/push/vapid-public-key

# Should return:
# {"publicKey":"BA-QLQ2Z945ZGk..."}
```

If this fails, your environment isn't configured correctly.

#### Manual Test
Open browser console and run:
```javascript
// Check service worker
navigator.serviceWorker.ready.then(reg => console.log('SW ready:', reg));

// Check push support
console.log('Push supported:', 'PushManager' in window);

// Check notification permission
console.log('Permission:', Notification.permission);

// Request permission
Notification.requestPermission().then(p => console.log('Result:', p));
```

### Advanced Debugging

#### Enable Verbose Logging
Add to `app/page.tsx` in `subscribeUser` function:
```typescript
console.log('Step 1: Starting subscription...');
console.log('Step 2: Service worker ready');
console.log('Step 3: Got VAPID key:', publicKey);
console.log('Step 4: Subscribed:', sub);
console.log('Step 5: Saved to server');
```

#### Check Network Tab
1. Open DevTools > Network
2. Click "Enable Notifications"
3. Look for:
   - `/api/push/vapid-public-key` - Should return 200
   - `/api/push/subscribe` - Should return 200

If either fails, check server logs in terminal.

### Quick Fixes Summary

```bash
# 1. Restart everything
npm run dev

# 2. Clear browser cache
# DevTools > Application > Clear storage > Clear site data

# 3. Hard refresh
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# 4. Check environment
cat .env.local

# 5. Test API
curl http://localhost:3000/api/push/vapid-public-key
```

### Get Help

If none of these work:
1. Check browser console for specific error
2. Check terminal for server errors
3. Try the test commands above
4. Check if port 3000 is already in use
5. Try a different port: `PORT=3001 npm run dev`

### Prevention

To avoid this issue:
1. Always create `.env.local` before starting
2. Use modern browsers
3. Test on localhost or HTTPS
4. Check browser permissions first
5. Keep browser updated

---

**Most Common Fix:** Restart the dev server after creating `.env.local`!

