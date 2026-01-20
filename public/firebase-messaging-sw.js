// Firebase Messaging Service Worker
// This handles push notifications when the app is in the background or closed

// Import Firebase scripts (compat version for service workers)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBRbqS6fZzHAKlzkLMLxEtBUBLnnHYnrPI',
  authDomain: 'fieldsy-web.firebaseapp.com',
  projectId: 'fieldsy-web',
  storageBucket: 'fieldsy-web.firebasestorage.app',
  messagingSenderId: '580739528563',
  appId: '1:580739528563:web:dd92c3c9d9c22187c47706',
};

// Initialize Firebase in the service worker
let messaging = null;

try {
  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();
  console.log('[SW] Firebase initialized successfully');
} catch (error) {
  console.error('[SW] Firebase initialization error:', error);
}

// Handle background messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'Fieldsy';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'You have a new notification',
      icon: payload.notification?.icon || payload.data?.senderImage || '/logo.svg',
      image: payload.notification?.image || payload.data?.image,
      badge: '/logo-badge.png',
      tag: payload.data?.notificationId || `fieldsy-${Date.now()}`,
      data: payload.data || {},
      // Enable action buttons
      actions: [
        {
          action: 'open',
          title: 'View',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
      // Require interaction to dismiss (keeps notification visible)
      requireInteraction: false,
      // Vibration pattern for mobile
      vibrate: [200, 100, 200],
    };

    // Show the notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  // Close the notification
  event.notification.close();

  // Get the link from notification data
  const link = event.notification.data?.link || '/';

  // If user clicked dismiss, do nothing
  if (event.action === 'dismiss') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Try to find an existing window and focus it
        for (const client of clientList) {
          if ('focus' in client && 'navigate' in client) {
            // Found an existing window
            client.focus();
            // Navigate to the link
            return client.navigate(link);
          }
        }

        // No existing window found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(link);
        }
      })
  );
});

// Handle notification close events (optional - for analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated');
  // Claim control of all pages immediately
  event.waitUntil(clients.claim());
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[SW] Service worker installed');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Handle push events directly (fallback for when Firebase messaging isn't initialized)
self.addEventListener('push', (event) => {
  if (!messaging) {
    console.log('[SW] Push event received (Fallback)');
    if (event.data) {
      try {
        // Attempt to parse JSON
        // Note: FCM raw payloads might differ, but this is a good-faith fallback
        let data = {};
        try {
          data = event.data.json();
        } catch (e) {
          console.log('[SW] Push data text:', event.data.text());
          return;
        }

        console.log('[SW] Push data:', data);

        const title = data.notification?.title || data.data?.title || 'Fieldsy';
        const notificationOptions = {
          body: data.notification?.body || data.data?.body || 'You have a new notification',
          icon: data.notification?.icon || data.data?.senderImage || '/logo.svg',
          image: data.notification?.image || data.data?.image,
          badge: '/logo-badge.png',
          data: data.data || {},
        };

        event.waitUntil(self.registration.showNotification(title, notificationOptions));

      } catch (error) {
        console.error('[SW] Error parsing push data:', error);
      }
    }
  }
});
