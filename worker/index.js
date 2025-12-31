// Custom service worker for push notifications
// This file is loaded by next-pwa

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Initialize workbox
workbox.setConfig({
  debug: false,
});

// Precaching
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Push notification handler
self.addEventListener('push', function(event) {
  console.log('[SW] Push notification received:', event);
  
  let data = { 
    title: '🔔 Push Notification', 
    body: 'You have a new notification!' 
  };
  
  if (event.data) {
    try {
      data = event.data.json();
      console.log('[SW] Notification data:', data);
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
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          for (let i = 0; i < clientList.length; i++) {
            let client = clientList[i];
            if ('focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url || '/');
          }
        })
    );
  }
});

console.log('[SW] Push notification handlers registered');

