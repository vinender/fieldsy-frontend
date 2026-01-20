// Firebase Messaging Service Worker
// This handles push notifications when the app is in the background or closed

// Import Firebase scripts (compat version for service workers)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

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
  // onBackgroundMessage handles messages when the app is in the background or closed
  messaging.onBackgroundMessage((payload) => {
    console.log('----------------------------------------------------');
    console.log('[SW-LOG] 📥 Background Message Received');
    console.log('[SW-LOG] Payload:', JSON.stringify(payload, null, 2));

    const notificationTitle = payload.notification?.title || payload.data?.title || 'Fieldsy';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'You have a new notification',
      icon: payload.notification?.icon || payload.data?.senderImage || '/logo.svg',
      image: payload.notification?.image || payload.data?.image,
      badge: '/logo-badge.png',
      tag: payload.data?.notificationId || `fieldsy-${Date.now()}`,
      data: payload.data || {},
      actions: [
        { action: 'open', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      requireInteraction: false,
      vibrate: [200, 100, 200],
    };

    console.log(`[SW-LOG] 🔔 Showing notification: "${notificationTitle}"`);
    console.log('[SW-LOG] Options:', JSON.stringify(notificationOptions, null, 2));

    // Show the notification
    const promise = self.registration.showNotification(notificationTitle, notificationOptions);

    promise.then(() => console.log('[SW-LOG] ✅ Notification displayed successfully'))
      .catch((err) => console.error('[SW-LOG] ❌ Failed to display notification:', err));

    return promise;
  });
} else {
  console.warn('[SW-LOG] ⚠️ Messaging not initialized in Service Worker');
}

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('----------------------------------------------------');
  console.log('[SW-LOG] 👆 Notification Clicked');
  console.log('[SW-LOG] Action:', event.action);
  console.log('[SW-LOG] Notification Tag:', event.notification.tag);

  // Close the notification
  event.notification.close();

  // Get the link from notification data
  const link = event.notification.data?.link || '/';
  console.log(`[SW-LOG] 🔗 Navigating to: ${link}`);

  // If user clicked dismiss, do nothing
  if (event.action === 'dismiss') {
    console.log('[SW-LOG] User opted to dismiss');
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
          if (client.url && 'focus' in client) { // check client.url to be safer
            console.log('[SW-LOG] 🔍 Found existing window, focusing...');
            client.focus();
            if ('navigate' in client) {
              return client.navigate(link);
            }
          }
        }

        // No existing window found, open a new one
        if (clients.openWindow) {
          console.log('[SW-LOG] 🆕 Opening new window...');
          return clients.openWindow(link);
        }
      })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('[SW-LOG] ❌ Notification Closed by user (Tag:', event.notification.tag, ')');
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[SW-LOG] 🚀 Service Worker Activated');
  event.waitUntil(clients.claim());
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[SW-LOG] 📦 Service Worker Installed');
  self.skipWaiting();
});

// Handle push events directly (fallback)
self.addEventListener('push', (event) => {
  // If messaging is handling it via onBackgroundMessage, usually we don't need this, 
  // but sometimes the "data" only messages fall through to here if not handled correctly.
  console.log('[SW-LOG] ⚡ Raw Push Event Received');

  if (!messaging) {
    console.log('[SW-LOG] (Fallback) Handling push event manually because Messaging is not ready');
    if (event.data) {
      try {
        let data = {};
        try {
          data = event.data.json();
        } catch (e) {
          console.log('[SW-LOG] Push data is text:', event.data.text());
          return;
        }

        console.log('[SW-LOG] Triggering fallback notification with data:', data);

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
        console.error('[SW-LOG] Error parsing push data:', error);
      }
    }
  }
});
