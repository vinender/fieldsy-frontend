import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { getFirebaseMessaging, isFirebaseConfigured } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import axiosClient from '@/lib/api/axios-client';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

interface UsePushNotificationsReturn {
  /** Current browser notification permission state */
  permissionState: PermissionState;
  /** Whether push notifications are supported in this browser */
  isSupported: boolean;
  /** Whether Firebase is configured in environment */
  isConfigured: boolean;
  /** Loading state for permission request */
  isLoading: boolean;
  /** Request notification permission and register device token */
  requestPermission: () => Promise<boolean>;
  /** Unsubscribe from push notifications (remove device token) */
  unsubscribe: () => Promise<void>;
}

/**
 * Hook for managing push notifications
 * Handles permission requests, token registration, and foreground message handling
 */
export const usePushNotifications = (): UsePushNotificationsReturn => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [permissionState, setPermissionState] = useState<PermissionState>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messaging, setMessaging] = useState<Messaging | null>(null);
  const isConfigured = isFirebaseConfigured();

  // Check support and current permission on mount
  useEffect(() => {
    const checkSupport = async () => {
      // Only run on client side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      // Check if Notification API is available
      if (!('Notification' in window)) {
        console.log('[PushNotifications] Notification API not available');
        setPermissionState('unsupported');
        setIsSupported(false);
        setIsLoading(false);
        return;
      }

      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.log('[PushNotifications] Service Worker not supported');
        setPermissionState('unsupported');
        setIsSupported(false);
        setIsLoading(false);
        return;
      }

      setIsSupported(true);
      setPermissionState(Notification.permission as PermissionState);

      // Initialize Firebase Messaging
      if (isConfigured) {
        try {
          const msg = await getFirebaseMessaging();
          setMessaging(msg);
        } catch (error) {
          console.warn('[PushNotifications] Could not initialize messaging:', error);
        }
      }

      setIsLoading(false);
    };

    checkSupport();
  }, [isConfigured]);

  // Setup foreground message handler
  useEffect(() => {
    if (!messaging || !isAuthenticated) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[PushNotifications] Foreground message received:', payload);

      const { title, body } = payload.notification || {};
      const data = payload.data || {};

      // Show toast notification for foreground messages
      if (title) {
        console.log('[PushNotifications] Notification received in foreground:', title);
        // Custom UI removed as per request
      }
    });

    return () => unsubscribe();
  }, [messaging, isAuthenticated]);

  // Request permission and register token with backend
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !isConfigured) {
      console.warn('[PushNotifications] Not supported or not configured');
      return false;
    }

    try {
      setIsLoading(true);

      // Request browser permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission as PermissionState);

      if (permission !== 'granted') {
        console.log('[PushNotifications] Permission denied');
        return false;
      }

      // Get or initialize messaging
      let msg = messaging;
      if (!msg) {
        msg = await getFirebaseMessaging();
        setMessaging(msg);
      }

      if (!msg) {
        console.error('[PushNotifications] Could not get messaging instance');
        return false;
      }

      // Get FCM registration token
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.error('[PushNotifications] VAPID key not configured');
        return false;
      }

      const token = await getToken(msg, { vapidKey });

      if (!token) {
        console.error('[PushNotifications] Failed to get FCM token');
        return false;
      }

      console.log('[PushNotifications] FCM token obtained');

      // Register token with backend
      await axiosClient.post('/device-tokens', {
        token,
        platform: 'web',
        deviceName: navigator.userAgent.substring(0, 100),
      });

      console.log('[PushNotifications] Token registered with backend');
      toast.success('Push notifications enabled');
      return true;
    } catch (error: any) {
      console.error('[PushNotifications] Error requesting permission:', error);
      toast.error('Failed to enable push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isConfigured, messaging]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!messaging) return;

    try {
      setIsLoading(true);

      // Get current token
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) return;

      const token = await getToken(messaging, { vapidKey });

      if (token) {
        // Remove token from backend
        await axiosClient.delete('/device-tokens', {
          data: { token },
        });
        console.log('[PushNotifications] Token removed from backend');
        toast.success('Push notifications disabled');
      }
    } catch (error: any) {
      console.error('[PushNotifications] Error unsubscribing:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messaging]);

  return {
    permissionState,
    isSupported,
    isConfigured,
    isLoading,
    requestPermission,
    unsubscribe,
  };
};

export default usePushNotifications;
