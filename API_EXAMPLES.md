# 📡 Push Notification API Examples

Complete examples for sending push notifications via API.

## 🔑 Base URL

```
Local: http://localhost:3000
Production: https://your-app.vercel.app
```

---

## 1️⃣ Get VAPID Public Key

Get the public key needed for client-side subscription.

### Request

```bash
curl http://localhost:3000/api/push/vapid-public-key
```

### Response

```json
{
  "publicKey": "BHxT5zy..."
}
```

---

## 2️⃣ Subscribe to Push Notifications

Save a push subscription to MongoDB. (Usually called from browser, not manually)

### Request

```bash
curl -X POST http://localhost:3000/api/push/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BHxT5zy...",
      "auth": "abc123..."
    }
  }'
```

### Response

```json
{
  "success": true,
  "message": "Subscription saved successfully",
  "subscriptionId": "507f1f77bcf86cd799439011"
}
```

---

## 3️⃣ Send Push Notification

Send notifications to all subscribed devices.

### Basic Notification

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World! 👋",
    "body": "This is a basic push notification"
  }'
```

### With Icon

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Message",
    "body": "You have a new message from John",
    "icon": "/icon-192x192.png",
    "badge": "/icon-192x192.png"
  }'
```

### With Large Image

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Photo",
    "body": "John shared a photo",
    "icon": "/icon-192x192.png",
    "image": "https://example.com/photo.jpg"
  }'
```

### With Custom Data

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Order Shipped",
    "body": "Your order #12345 has been shipped",
    "icon": "/icon-192x192.png",
    "data": {
      "orderId": "12345",
      "trackingUrl": "https://example.com/track/12345",
      "customField": "any value"
    }
  }'
```

### With Action Buttons

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Message",
    "body": "You have 3 unread messages",
    "icon": "/icon-192x192.png",
    "actions": [
      {
        "action": "open",
        "title": "Open App",
        "icon": "/icons/open.png"
      },
      {
        "action": "dismiss",
        "title": "Dismiss"
      }
    ]
  }'
```

### Persistent Notification

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important Alert",
    "body": "This notification stays until you interact with it",
    "icon": "/icon-192x192.png",
    "requireInteraction": true
  }'
```

### With Tag (Replace Previous)

```bash
# First notification
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Downloading...",
    "body": "Download started",
    "tag": "download-status"
  }'

# This will replace the previous notification
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Download Complete",
    "body": "Your file is ready",
    "tag": "download-status"
  }'
```

### Complete Example (All Options)

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Notification",
    "body": "This notification has all options",
    "icon": "/icon-192x192.png",
    "badge": "/icon-192x192.png",
    "image": "https://example.com/image.jpg",
    "tag": "unique-tag",
    "requireInteraction": false,
    "data": {
      "url": "https://example.com",
      "userId": "123",
      "customData": "any value"
    },
    "actions": [
      {
        "action": "view",
        "title": "View",
        "icon": "/icons/view.png"
      },
      {
        "action": "dismiss",
        "title": "Dismiss"
      }
    ]
  }'
```

### Response

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
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "status": "fulfilled",
      "success": true
    }
  ]
}
```

---

## 4️⃣ List All Subscriptions

Get all subscribed devices from MongoDB.

### Request

```bash
curl http://localhost:3000/api/push/list-subscriptions
```

### Response

```json
{
  "success": true,
  "count": 3,
  "subscriptions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
      "createdAt": "2026-01-13T10:30:00.000Z",
      "updatedAt": "2026-01-13T10:30:00.000Z"
    }
  ]
}
```

---

## 5️⃣ Unsubscribe

Remove a subscription from MongoDB.

### Request

```bash
curl -X POST http://localhost:3000/api/push/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/..."
  }'
```

### Response

```json
{
  "success": true,
  "message": "Subscription removed successfully"
}
```

---

## 🎯 Use Cases

### 1. New Message Notification

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Message from Sarah",
    "body": "Hey! Are you free for lunch?",
    "icon": "/icon-192x192.png",
    "badge": "/icon-192x192.png",
    "data": {
      "messageId": "msg_123",
      "senderId": "user_456",
      "url": "/messages/msg_123"
    },
    "actions": [
      {"action": "reply", "title": "Reply"},
      {"action": "view", "title": "View"}
    ]
  }'
```

### 2. Order Status Update

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Order Delivered! 📦",
    "body": "Your order #12345 has been delivered",
    "icon": "/icon-192x192.png",
    "image": "https://example.com/package.jpg",
    "data": {
      "orderId": "12345",
      "status": "delivered",
      "url": "/orders/12345"
    },
    "actions": [
      {"action": "view", "title": "View Order"},
      {"action": "rate", "title": "Rate"}
    ]
  }'
```

### 3. Breaking News Alert

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🚨 Breaking News",
    "body": "Major announcement just made",
    "icon": "/icon-192x192.png",
    "image": "https://example.com/news-image.jpg",
    "requireInteraction": true,
    "data": {
      "articleId": "news_789",
      "category": "breaking",
      "url": "/news/news_789"
    },
    "actions": [
      {"action": "read", "title": "Read Now"},
      {"action": "later", "title": "Save for Later"}
    ]
  }'
```

### 4. Reminder Notification

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "⏰ Reminder",
    "body": "Meeting starts in 15 minutes",
    "icon": "/icon-192x192.png",
    "badge": "/icon-192x192.png",
    "requireInteraction": true,
    "data": {
      "eventId": "meeting_101",
      "startTime": "2026-01-13T14:00:00Z",
      "url": "/calendar/meeting_101"
    },
    "actions": [
      {"action": "join", "title": "Join Now"},
      {"action": "snooze", "title": "Snooze"}
    ]
  }'
```

### 5. Social Interaction

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Follower",
    "body": "John Doe started following you",
    "icon": "/icon-192x192.png",
    "image": "https://example.com/john-avatar.jpg",
    "data": {
      "userId": "user_789",
      "action": "follow",
      "url": "/profile/user_789"
    },
    "actions": [
      {"action": "view", "title": "View Profile"},
      {"action": "follow", "title": "Follow Back"}
    ]
  }'
```

---

## 🔐 Production: Add Authentication

For production, protect the `/api/push/send` endpoint:

### Add API Key to .env.local

```env
API_SECRET=your-secret-key-here
```

### Send with Authorization Header

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-key-here" \
  -d '{
    "title": "Secure Notification",
    "body": "This requires authentication"
  }'
```

### Update API Code

```typescript
// pages/api/push/send.ts
if (req.headers.authorization !== `Bearer ${process.env.API_SECRET}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

---

## 🧪 Testing Tools

### Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "Push Notifications API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Send Notification",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"title\":\"Test\",\"body\":\"Hello World\"}"
        },
        "url": "http://localhost:3000/api/push/send"
      }
    }
  ]
}
```

### JavaScript/Node.js

```javascript
const sendNotification = async () => {
  const response = await fetch('http://localhost:3000/api/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Hello from JavaScript!',
      body: 'This notification was sent from code',
      icon: '/icon-192x192.png',
    }),
  });
  
  const result = await response.json();
  console.log(result);
};

sendNotification();
```

### Python

```python
import requests

def send_notification():
    url = 'http://localhost:3000/api/push/send'
    payload = {
        'title': 'Hello from Python!',
        'body': 'This notification was sent from Python',
        'icon': '/icon-192x192.png'
    }
    
    response = requests.post(url, json=payload)
    print(response.json())

send_notification()
```

### PHP

```php
<?php
$url = 'http://localhost:3000/api/push/send';
$data = [
    'title' => 'Hello from PHP!',
    'body' => 'This notification was sent from PHP',
    'icon' => '/icon-192x192.png'
];

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
print_r(json_decode($result));
?>
```

---

## 📊 Response Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | Success | Notification sent successfully |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid or missing API key |
| 404 | Not Found | No subscriptions found |
| 405 | Method Not Allowed | Wrong HTTP method |
| 500 | Server Error | Internal server error |

---

## 🎯 Best Practices

1. **Keep titles short** - Max 50 characters
2. **Keep body concise** - Max 120 characters
3. **Use icons** - Always provide an icon
4. **Add data** - Include URLs or IDs for navigation
5. **Limit frequency** - Don't spam users
6. **Use tags** - Group related notifications
7. **Test first** - Always test before sending to all users
8. **Handle errors** - Check response stats for failures

---

## 📚 Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Notification title |
| `body` | string | Yes | Notification body text |
| `icon` | string | No | Small icon URL (default: /icon-192x192.png) |
| `badge` | string | No | Badge icon URL (default: /icon-192x192.png) |
| `image` | string | No | Large image URL |
| `tag` | string | No | Unique tag (replaces previous with same tag) |
| `requireInteraction` | boolean | No | Keep visible until clicked (default: false) |
| `data` | object | No | Custom data payload |
| `actions` | array | No | Action buttons (max 2) |

---

**🎉 You're ready to send push notifications via API!**

For more details, see [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md)
