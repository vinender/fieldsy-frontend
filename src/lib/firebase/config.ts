import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase client SDK
 * Only runs on client-side (browser)
 */
export const initializeFirebaseClient = (): FirebaseApp | null => {
  // Only run on client side
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if Firebase is already initialized
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  // Validate configuration
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('[Firebase] Configuration not found in environment variables');
    console.warn('[Firebase] Push notifications will not be available');
    console.warn('[Firebase] To enable, set NEXT_PUBLIC_FIREBASE_* variables in .env.local');
    return null;
  }

  try {
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] Client SDK initialized');
    return app;
  } catch (error: any) {
    console.error('[Firebase] Initialization failed:', error.message);
    return null;
  }
};

/**
 * Get Firebase Cloud Messaging instance
 * Returns null if not supported or not initialized
 */
export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  // Return cached instance if available
  if (messaging) {
    return messaging;
  }

  // Only run on client side
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if messaging is supported in this browser
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('[Firebase] Messaging not supported in this browser');
      return null;
    }
  } catch (error) {
    console.warn('[Firebase] Could not check messaging support:', error);
    return null;
  }

  // Initialize Firebase if not already done
  const firebaseApp = initializeFirebaseClient();
  if (!firebaseApp) {
    return null;
  }

  try {
    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch (error: any) {
    console.error('[Firebase] Could not get messaging instance:', error.message);
    return null;
  }
};

/**
 * Check if Firebase is configured and ready
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  );
};

export { app, messaging };
