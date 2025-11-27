'use client';

import { useState, useEffect, ReactNode } from 'react';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { LocationProvider } from '@/contexts/LocationContext';

interface ClientOnlyProvidersProps {
  children: ReactNode;
}

/**
 * Wrapper component that only renders socket/notification providers on the client side.
 * This prevents hydration mismatches caused by socket.io and browser-only APIs.
 */
export function ClientOnlyProviders({ children }: ClientOnlyProvidersProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR and initial hydration, render children without providers
  if (!isMounted) {
    return <>{children}</>;
  }

  // After hydration, wrap with providers
  return (
    <LocationProvider>
      <NotificationProvider>
        <SocketProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </SocketProvider>
      </NotificationProvider>
    </LocationProvider>
  );
}
