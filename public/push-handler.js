// Push Notification Handlers
// This script adds push notification support to the service worker

console.log('[Push Handler] Initializing push notification handlers...');

// Listen for push events
self.addEventListener('push', function(event) {
  console.log('[Push Handler] Push notification received:', event);
  
  let notificationData = { 
    title: '🔔 Notification', 
    body: 'You have a new notification!' 
  };
  
  // Try to parse the push data
  if (event.data) {
    try {
      notificationData = event.data.json();
      console.log('[Push Handler] Parsed notification data:', notificationData);
    } catch (e) {
      console.log('[Push Handler] Could not parse JSON, using text:', e);
      notificationData.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: notificationData.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'push-notification',
    requireInteraction: false,
    data: {
      dateOfArrival: Date.now(),
      url: notificationData.url || '/',
      ...notificationData.data
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'close',
        title: 'Dismiss',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || '🔔 Notification', 
      notificationOptions
    ).then(() => {
      console.log('[Push Handler] Notification displayed successfully');
    }).catch((error) => {
      console.error('[Push Handler] Error displaying notification:', error);
    })
  );
});

// Listen for notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[Push Handler] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    // User clicked close, just close the notification
    console.log('[Push Handler] User dismissed notification');
    return;
  }

  // For 'open' action or clicking the notification body
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(function(clientList) {
      console.log('[Push Handler] Found', clientList.length, 'open windows');
      
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          console.log('[Push Handler] Focusing existing window');
          return client.focus();
        }
      }
      
      // If not, open a new window
      if (clients.openWindow) {
        const urlToOpen = event.notification.data?.url || '/';
        console.log('[Push Handler] Opening new window:', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    }).catch((error) => {
      console.error('[Push Handler] Error handling notification click:', error);
    })
  );
});

// Listen for notification close events
self.addEventListener('notificationclose', function(event) {
  console.log('[Push Handler] Notification closed:', event);
  // You can track dismissals here if needed
});

console.log('[Push Handler] ✅ Push notification handlers registered successfully');

