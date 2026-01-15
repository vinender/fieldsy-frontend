// Firebase Messaging Service Worker
// This handles push notifications when the app is in the background or closed

// Import Firebase scripts (compat version for service workers)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration will be injected when the service worker is registered
// These are placeholders that get replaced with actual values
const firebaseConfig = {
  apiKey: 'FIREBASE_API_KEY_PLACEHOLDER',
  authDomain: 'FIREBASE_AUTH_DOMAIN_PLACEHOLDER',
  projectId: 'FIREBASE_PROJECT_ID_PLACEHOLDER',
  storageBucket: 'FIREBASE_STORAGE_BUCKET_PLACEHOLDER',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER',
  appId: 'FIREBASE_APP_ID_PLACEHOLDER',
};

// Initialize Firebase in the service worker
// Only initialize if we have valid config (not placeholders)
let messaging = null;

try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('PLACEHOLDER')) {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    console.log('[SW] Firebase initialized successfully');
  } else {
    console.log('[SW] Firebase config not yet available, waiting for initialization');
  }
} catch (error) {
  console.error('[SW] Firebase initialization error:', error);
}

// Handle background messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'Fieldsy';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: '/logo.svg',
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
  console.log('[SW] Push event received');

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[SW] Push data:', data);

      // Only show notification if Firebase messaging didn't handle it
      if (!messaging) {
        const title = data.notification?.title || 'Fieldsy';
        const options = {
          body: data.notification?.body || 'You have a new notification',
          icon: '/logo.svg',
          badge: '/logo-badge.png',
          data: data.data || {},
        };

        event.waitUntil(self.registration.showNotification(title, options));
      }
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }
});
