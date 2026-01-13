# 🚀 My PWA App - Pages Router with Push Notifications

A Progressive Web App built with **Next.js 16 Pages Router**, `@ducanh2912/next-pwa`, and **push notifications** stored in MongoDB.

## ✨ Features

- ✅ **PWA Installation** - Installable on desktop and mobile
- ✅ **Offline Support** - Works without internet connection
- ✅ **Fast & Reliable** - Optimized performance
- ✅ **Push Notifications** - Web push with MongoDB storage
- ✅ **API Triggers** - Send notifications via REST API
- ✅ **Pages Router** - Classic Next.js routing
- ✅ **TypeScript** - Type-safe development
- ✅ **Tailwind CSS** - Modern styling

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
# Copy environment template
cp env.template .env.local

# Generate VAPID keys
node scripts/generate-vapid-keys.js
```

Copy the generated keys to your `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/push-notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-public-key>
VAPID_PRIVATE_KEY=<your-private-key>
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. Setup MongoDB

**Option A: MongoDB Atlas (Cloud)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Add to `.env.local`

**Option B: Local MongoDB**

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Use: MONGODB_URI=mongodb://localhost:27017/push-notifications
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Test PWA Installation

### Desktop

1. Open the app in Chrome/Edge
2. Look for the **install icon (➕)** in the address bar
3. Click it to install

### Mobile

1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the **Share** button
3. Select **"Add to Home Screen"**

### Verify Installation

1. Open **DevTools** (F12)
2. Go to **Application** tab
3. Check:
   - **Manifest** → Shows "Installable" ✅
   - **Service Workers** → 1 active worker ✅
   - **Console** → `✅ PWA Service Worker registered: /`

## 📁 Project Structure

```
push-notifications-fresh/
├── pages/
│   ├── _app.tsx            ← Service worker registration
│   ├── _document.tsx       ← PWA metadata
│   ├── index.tsx           ← Homepage with push UI
│   └── api/
│       └── push/
│           ├── vapid-public-key.ts  ← Get VAPID key
│           ├── subscribe.ts         ← Subscribe endpoint
│           ├── unsubscribe.ts       ← Unsubscribe endpoint
│           ├── send.ts              ← Send notifications
│           └── list-subscriptions.ts ← List all subs
├── lib/
│   ├── mongodb.ts          ← MongoDB connection
│   └── vapid.ts            ← VAPID configuration
├── models/
│   └── Subscription.ts     ← Subscription schema
├── scripts/
│   └── generate-vapid-keys.js ← Key generator
├── styles/
│   └── globals.css         ← Global styles
├── public/
│   ├── manifest.json       ← PWA manifest
│   ├── sw.js              ← Service worker with push ✅
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── next.config.ts          ← PWA configuration
├── env.template            ← Environment template
├── PUSH_NOTIFICATIONS.md   ← Full push docs
└── package.json
```

## 🔧 Key Files

### `pages/_app.tsx`

Registers the service worker on app mount:

```typescript
useEffect(() => {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.register("/sw.js").then((registration) => {
			console.log("✅ PWA Service Worker registered:", registration.scope);
		});
	}
}, []);
```

### `pages/_document.tsx`

Contains PWA metadata and manifest link:

```typescript
<Head>
	<link rel="manifest" href="/manifest.json" />
	<link rel="icon" href="/icon-192x192.png" />
	<link rel="apple-touch-icon" href="/icon-192x192.png" />
	<meta name="theme-color" content="#000000" />
	{/* ... more PWA meta tags */}
</Head>
```

### `next.config.ts`

Configures @ducanh2912/next-pwa:

```typescript
const withPWA = withPWAInit({
	dest: "public",
	register: false, // We register manually in _app.tsx
	workboxOptions: {
		skipWaiting: true,
	},
});
```

### `public/manifest.json`

Defines PWA properties:

```json
{
	"name": "My PWA App",
	"short_name": "PWA App",
	"display": "standalone",
	"theme_color": "#000000",
	"icons": [
		/* ... */
	]
}
```

## 🎨 Customization

### Change App Name

1. `public/manifest.json` → Update `name` and `short_name`
2. `pages/_document.tsx` → Update `apple-mobile-web-app-title`
3. `pages/index.tsx` → Update page title in `<Head>`

### Change Theme Color

1. `public/manifest.json` → Update `theme_color` and `background_color`
2. `pages/_document.tsx` → Update `theme-color` meta tag

### Change Icons

Replace these files with your own (keep same sizes):

- `public/icon-192x192.png` (192x192 pixels)
- `public/icon-512x512.png` (512x512 pixels)

### Update Homepage

Edit `pages/index.tsx` to customize the UI.

## 📦 Scripts

```bash
# Development
npm run dev          # Start dev server (uses Webpack)

# Production
npm run build        # Build for production
npm start           # Start production server

# Linting
npm run lint        # Check code quality
```

**Note:** We use `--webpack` flag because `@ducanh2912/next-pwa` doesn't support Turbopack yet.

## 🔍 How It Works

### Service Worker Registration

1. App loads → `pages/_app.tsx` runs
2. `useEffect` checks for service worker support
3. Registers `/sw.js` (generated by next-pwa)
4. Console shows: `✅ PWA Service Worker registered: /`

### PWA Generation

1. During build, `@ducanh2912/next-pwa` processes your app
2. Generates `public/sw.js` and `public/workbox-*.js`
3. Precaches pages and assets
4. Enables offline functionality

### Installation Flow

1. User visits your PWA
2. Browser detects PWA criteria are met
3. Shows install prompt/icon
4. User installs → app opens in standalone mode

## 🛠️ Technologies

- **Next.js 16.1.1** - React framework with Pages Router
- **@ducanh2912/next-pwa 10.2.9** - PWA plugin (maintained fork)
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4** - Utility-first CSS
- **Workbox** - Service worker utilities
- **MongoDB** - Database for storing subscriptions
- **Mongoose** - MongoDB ODM
- **web-push** - Web push notification library

## ✅ PWA Checklist

Your app meets all PWA requirements:

- [x] HTTPS (or localhost for testing)
- [x] Service worker registered
- [x] Web app manifest
- [x] Icons (192x192, 512x512)
- [x] Start URL defined
- [x] Display mode: standalone
- [x] Theme color set
- [x] Responsive design
- [x] Works offline (after first visit)

## 🐛 Troubleshooting

### Service Worker Not Registering

**Check Console:** Look for errors in browser console.

**Clear Cache:**

```bash
# In DevTools
Application → Storage → Clear site data
```

**Rebuild:**

```bash
rm -rf .next
npm run build
npm start
```

### Install Prompt Not Showing

**Requirements:**

- Must be served over HTTPS (or localhost)
- Service worker must be active
- Manifest must be valid
- Must not already be installed

**Check Installability:**

1. DevTools → Application → Manifest
2. Look for errors under "Installability"

### Changes Not Reflecting

**Development:** Next.js dev mode disables most SW caching

**Production:**

```bash
npm run build
npm start
```

### Build Errors

**If you see Webpack errors:**

- Make sure `--webpack` flag is in build command
- Check `package.json` scripts

**If TypeScript errors:**

```bash
npm run lint
```

## 📚 Learn More

- [Next.js Pages Router Docs](https://nextjs.org/docs/pages)
- [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

Make sure your hosting:

- Serves over HTTPS
- Doesn't block service workers
- Serves `sw.js` with correct MIME type

## 🔔 Push Notifications

### Test in Browser

1. **Enable notifications**: Click "🔔 Enable Notifications" button
2. **Grant permission**: Allow notifications in browser popup
3. **Send test**: Click "📤 Send Test Notification"
4. **Verify**: Check notification appears (even when browser minimized!)

### Send via API

```bash
# Send push notification to all subscribers
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello! 👋",
    "body": "This is a push notification",
    "icon": "/icon-192x192.png"
  }'
```

### API Endpoints

| Endpoint                       | Method | Description                    |
| ------------------------------ | ------ | ------------------------------ |
| `/api/push/vapid-public-key`   | GET    | Get VAPID public key           |
| `/api/push/subscribe`          | POST   | Subscribe to notifications     |
| `/api/push/unsubscribe`        | POST   | Unsubscribe from notifications |
| `/api/push/send`               | POST   | Send notification to all       |
| `/api/push/list-subscriptions` | GET    | List all subscriptions         |

📖 **Full documentation:** See [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md)

## 🎯 Next Steps

Now you can:

1. ✅ **Test push notifications** - Enable and test in browser
2. ✅ **Send via API** - Trigger notifications programmatically
3. ✅ **Customize notifications** - Add images, actions, badges
4. ✅ **Add pages** - Create files in `pages/` directory
5. ✅ **Add components** - Create `components/` directory
6. ✅ **Deploy** - Push to Vercel/Netlify with environment variables

## 🎉 Success Indicators

When everything works, you'll see:

- ✅ `npm run dev` starts without errors
- ✅ Page loads at http://localhost:3000
- ✅ Console shows: `✅ PWA Service Worker registered: /`
- ✅ DevTools shows manifest and service worker
- ✅ Install icon appears in browser
- ✅ App can be installed to home screen
- ✅ Works in standalone mode after installation

---

**Built with ❤️ using Next.js Pages Router**
