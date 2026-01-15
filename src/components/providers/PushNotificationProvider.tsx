'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { isFirebaseConfigured } from '@/lib/firebase/config';

interface PushNotificationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that handles push notification setup
 * - Registers service worker on mount
 * - Auto-prompts for permission after user logs in (optional)
 * - Can be configured to show a permission prompt UI
 */
export const PushNotificationProvider: React.FC<PushNotificationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { permissionState, isSupported, isConfigured, requestPermission } = usePushNotifications();
  const [hasPrompted, setHasPrompted] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  // Register service worker on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (!isFirebaseConfigured()) {
      console.log('[PushProvider] Firebase not configured, skipping service worker registration');
      return;
    }
    if (swRegistered) return;

    const registerServiceWorker = async () => {
      try {
        // Check if already registered
        const existingRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');

        if (existingRegistration) {
          console.log('[PushProvider] Service Worker already registered:', existingRegistration.scope);
          setSwRegistered(true);
          return;
        }

        // Register the service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });

        console.log('[PushProvider] Service Worker registered:', registration.scope);
        setSwRegistered(true);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('[PushProvider] Service Worker update found');
        });
      } catch (error) {
        console.error('[PushProvider] Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, [swRegistered]);

  // Auto-request permission after login (optional - currently disabled)
  // Uncomment the useEffect below to automatically prompt for permission
  // after user logs in. This is disabled by default for better UX.
  /*
  useEffect(() => {
    // Auto-request permission if user is authenticated and hasn't been prompted
    if (
      isAuthenticated &&
      isSupported &&
      isConfigured &&
      permissionState === 'default' &&
      !hasPrompted
    ) {
      // Delay the prompt for better UX (let the page load first)
      const timer = setTimeout(() => {
        requestPermission();
        setHasPrompted(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isSupported, isConfigured, permissionState, hasPrompted, requestPermission]);
  */

  // Auto-register token if permission already granted
  useEffect(() => {
    if (
      isAuthenticated &&
      isSupported &&
      isConfigured &&
      permissionState === 'granted' &&
      !hasPrompted
    ) {
      // User already granted permission, register token
      requestPermission().then(() => {
        setHasPrompted(true);
      });
    }
  }, [isAuthenticated, isSupported, isConfigured, permissionState, hasPrompted, requestPermission]);

  return <>{children}</>;
};

export default PushNotificationProvider;
