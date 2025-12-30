# Deployment Guide

## Quick Deploy to Vercel (Recommended)

Vercel offers the easiest deployment with built-in cron support.

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Push Notifications App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure Environment Variables:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
   - `CRON_SECRET`
5. Click "Deploy"

### 3. Verify Deployment

The `vercel.json` file is already configured to run cron jobs at 10:00 AM daily.

Test your deployment:
- Visit your deployed URL
- Subscribe to notifications
- Wait for 10:00 AM or manually trigger via API

## Alternative Deployment Options

### Deploy to Netlify

1. Push to GitHub
2. Connect repository to Netlify
3. Add environment variables
4. Deploy
5. Use external cron service:
   - [EasyCron](https://www.easycron.com/)
   - [cron-job.org](https://cron-job.org/)
   
   Configure to POST to: `https://your-app.netlify.app/api/push/send-daily`
   With header: `Authorization: Bearer YOUR_CRON_SECRET`

### Deploy to VPS/Dedicated Server

1. **Setup Server**
```bash
ssh user@your-server
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
npm run build
```

2. **Create .env.local**
```bash
nano .env.local
# Add your environment variables
```

3. **Start with PM2**
```bash
npm install -g pm2
pm2 start npm --name "push-app" -- start
pm2 start scripts/cron-scheduler.js --name "cron-scheduler"
pm2 save
pm2 startup
```

4. **Setup Nginx (optional)**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Setup SSL with Certbot**
```bash
sudo certbot --nginx -d your-domain.com
```

### Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add environment variables
4. Deploy
5. Add cron job in Railway dashboard or use external service

### Deploy to Render

1. Push to GitHub
2. Connect to [render.com](https://render.com)
3. Create new Web Service
4. Add environment variables
5. Deploy
6. Add Cron Job:
   - Go to Dashboard > Create > Cron Job
   - Command: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://your-app.onrender.com/api/push/send-daily`
   - Schedule: `0 10 * * *`

## Docker Deployment

### Build and Run

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
EOF

# Build
docker build -t push-notifications-app .

# Run
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_key" \
  -e VAPID_PRIVATE_KEY="your_key" \
  -e VAPID_SUBJECT="mailto:you@example.com" \
  -e CRON_SECRET="your_secret" \
  --name push-app \
  push-notifications-app

# Run cron scheduler
docker run -d \
  -e APP_URL="http://localhost:3000" \
  -e CRON_SECRET="your_secret" \
  --name cron-scheduler \
  push-notifications-app \
  node scripts/cron-scheduler.js
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_VAPID_PUBLIC_KEY}
      - VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}
      - VAPID_SUBJECT=${VAPID_SUBJECT}
      - CRON_SECRET=${CRON_SECRET}
    restart: unless-stopped

  cron:
    build: .
    command: node scripts/cron-scheduler.js
    environment:
      - APP_URL=http://app:3000
      - CRON_SECRET=${CRON_SECRET}
    depends_on:
      - app
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Database Integration

For production, replace file-based storage with a database:

### PostgreSQL Example

```bash
npm install pg
```

```typescript
// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function saveSubscription(subscription: any) {
  await pool.query(
    'INSERT INTO subscriptions (endpoint, keys, subscribed_at) VALUES ($1, $2, $3) ON CONFLICT (endpoint) DO NOTHING',
    [subscription.endpoint, JSON.stringify(subscription.keys), new Date()]
  );
}

export async function getSubscriptions() {
  const result = await pool.query('SELECT * FROM subscriptions');
  return result.rows;
}

export async function removeSubscription(endpoint: string) {
  await pool.query('DELETE FROM subscriptions WHERE endpoint = $1', [endpoint]);
}
```

### MongoDB Example

```bash
npm install mongodb
```

```typescript
// lib/db.ts
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('push-notifications');
const subscriptions = db.collection('subscriptions');

export async function saveSubscription(subscription: any) {
  await subscriptions.updateOne(
    { endpoint: subscription.endpoint },
    { $set: { ...subscription, subscribedAt: new Date() } },
    { upsert: true }
  );
}

export async function getSubscriptions() {
  return subscriptions.find({}).toArray();
}

export async function removeSubscription(endpoint: string) {
  await subscriptions.deleteOne({ endpoint });
}
```

## Environment Variables Checklist

Make sure all these are set in your deployment platform:

- ✅ `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Public VAPID key
- ✅ `VAPID_PRIVATE_KEY` - Private VAPID key (keep secret!)
- ✅ `VAPID_SUBJECT` - Your contact email (mailto:...)
- ✅ `CRON_SECRET` - Secret for protecting cron endpoint
- ✅ `APP_URL` - Your app's URL (for external cron only)
- Optional: `DATABASE_URL` - If using a database

## Testing Production

After deployment:

1. **Test subscription flow**
   - Visit your deployed URL
   - Click "Enable Notifications"
   - Verify subscription is saved

2. **Test notifications**
   - Click "Send Test Notification"
   - Should receive notification immediately

3. **Test cron job**
   - Wait for scheduled time (10:00 AM)
   - Or manually trigger: 
     ```bash
     curl -X POST \
       -H "Authorization: Bearer YOUR_CRON_SECRET" \
       https://your-app.com/api/push/send-daily
     ```

## Monitoring

### Check Subscription Count

Add this API route:

```typescript
// app/api/push/stats/route.ts
export async function GET() {
  const subscriptions = getSubscriptions();
  return NextResponse.json({
    totalSubscriptions: subscriptions.length,
    lastCheck: new Date().toISOString(),
  });
}
```

### Error Tracking

Consider adding:
- [Sentry](https://sentry.io/) for error tracking
- [LogRocket](https://logrocket.com/) for session replay
- Cloud platform logs (Vercel, Netlify, etc.)

## Scaling Considerations

For high traffic:

1. **Use a message queue** (Redis, RabbitMQ)
2. **Batch notifications** (send in chunks)
3. **Use a worker service** (separate from web server)
4. **Database connection pooling**
5. **CDN for static assets**
6. **Load balancing** (multiple instances)

## Backup & Recovery

```bash
# Backup subscriptions (file-based)
cp subscriptions.json subscriptions.backup.json

# Backup subscriptions (database)
pg_dump your_db > backup.sql  # PostgreSQL
mongodump --db push-notifications  # MongoDB
```

## Troubleshooting

**Cron not running on Vercel?**
- Check vercel.json is in root
- Verify cron is enabled in project settings
- Check function logs in Vercel dashboard

**Notifications not sending?**
- Verify VAPID keys are correct
- Check API route logs
- Ensure CRON_SECRET matches

**High latency?**
- Move to edge functions
- Use a CDN
- Optimize database queries
- Add caching

## Security Checklist

- ✅ HTTPS enabled
- ✅ Private key never exposed to client
- ✅ CRON_SECRET used for endpoint protection
- ✅ Rate limiting on API routes
- ✅ Input validation
- ✅ CORS properly configured
- ✅ Environment variables secured

## Support

Need help? Check:
- README.md - Full documentation
- GitHub Issues
- Vercel/Netlify support docs
- Web Push API documentation

---

**Ready to deploy?** Start with Vercel for the easiest setup!

