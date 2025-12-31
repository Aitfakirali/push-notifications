// This file will be merged with the Workbox service worker
// It adds push notification support

// Listen for push events
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push notification received:', event);
  
  let data = { 
    title: 'Push Notification', 
    body: 'You have a new notification!' 
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'push-notification',
    requireInteraction: false,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

// Listen for notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app when notification is clicked
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Check if there's already a window open
          for (let i = 0; i < clientList.length; i++) {
            let client = clientList[i];
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          // If not, open a new window
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
  // 'close' action just closes the notification (already done above)
});

// Listen for notification close events (optional)
self.addEventListener('notificationclose', function(event) {
  console.log('[Service Worker] Notification closed:', event);
});

console.log('[Service Worker] Push notification handlers registered');

