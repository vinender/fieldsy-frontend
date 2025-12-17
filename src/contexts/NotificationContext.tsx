import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useNotifications as useNotificationQuery, useUnreadNotificationsCount } from '@/hooks/queries/useNotificationQueries';
import {
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useClearAllNotifications
} from '@/hooks/mutations/useNotificationMutations';
import { useRouter } from 'next/router';

// Track shown notification IDs to prevent duplicates across tabs/reconnections
const shownNotificationIds = new Set<string>();
// Clean up old notification IDs after 30 seconds to prevent memory buildup
const NOTIFICATION_DEDUP_TTL = 30000;

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  loading: boolean;
  fetchNotifications: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

// Default context value for when provider is not available (SSR/initial render)
const defaultContextValue: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  loading: false,
  fetchNotifications: () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  clearAll: async () => {},
};

const NotificationContext = createContext<NotificationContextType>(defaultContextValue);

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Only fetch notifications if user is authenticated
  const isAuthenticated = !!session || !!authUser;
  
  // Check if we're on landing page or other public pages where notifications aren't needed
  const isPublicPage = router.pathname === '/' && !isAuthenticated;
  const shouldLoadNotifications = isAuthenticated && !isPublicPage;
  
  // Use React Query hooks for notifications - only enabled when needed
  const { data: notificationData, isLoading, refetch: refetchNotifications } = useNotificationQuery(1, 10, {
    enabled: shouldLoadNotifications,
  });
  const { data: unreadData } = useUnreadNotificationsCount({
    enabled: shouldLoadNotifications,
  });

  // Mutations
  const markNotificationAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const clearAllMutation = useClearAllNotifications();

  // Use React Query data as the source of truth for notifications
  const notifications = notificationData?.data || [];
  const unreadCount = unreadData?.count || 0;
  const loading = isLoading;
  // Get auth token from either NextAuth or custom auth
  const getAuthToken = useCallback(() => {
    // Try NextAuth first
    if (session?.accessToken) {
      return session.accessToken;
    }

    // Only access localStorage on client-side
    if (typeof window === 'undefined') {
      return null;
    }

    // Try custom auth from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.token;
    }

    // Try from localStorage authToken
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      return authToken;
    }

    return null;
  }, [session?.accessToken]);

  // Fetch notifications via socket
  const fetchNotifications = useCallback((page: number = 1, limit: number = 20) => {
    if (socket?.connected) {
      socket.emit('fetch-notifications', { page, limit });
    } else {
      // Fallback to REST API if socket not connected
      refetchNotifications();
    }
  }, [socket, refetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsReadMutation.mutateAsync(id);
      
      // Also emit through socket if connected
      if (socket?.connected) {
        socket.emit('mark-notification-read', { notificationId: id });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [markNotificationAsReadMutation, socket]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      
      // Also emit through socket if connected  
      if (socket?.connected) {
        socket.emit('mark-all-notifications-read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [markAllAsReadMutation, socket]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [deleteNotificationMutation]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await clearAllMutation.mutateAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [clearAllMutation]);

  // Setup WebSocket connection
  useEffect(() => {
    const token = getAuthToken();
    
    // Only connect if we have a token AND we're not on a public page
    if (token && shouldLoadNotifications) {

      const socketInstance = io(
        process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000',
        {
          auth: {
            token,
          },
        }
      );

      socketInstance.on('connect', () => {
        setIsConnected(true);
        // Fetch notifications via socket when connected
        socketInstance.emit('fetch-notifications', { page: 1, limit: 20 });
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      // Handle new notification
      socketInstance.on('notification', (notification: any) => {
        // Refetch notifications to update the list
        refetchNotifications();

        // Deduplicate toast notifications - prevent showing same notification multiple times
        // This can happen when user has multiple tabs open or socket reconnects
        const notificationId = notification.id || notification._id;
        if (notificationId && shownNotificationIds.has(notificationId)) {
          console.log('[NotificationContext] Duplicate notification suppressed:', notificationId);
          return;
        }

        // Mark this notification as shown
        if (notificationId) {
          shownNotificationIds.add(notificationId);
          // Clean up after TTL to prevent memory buildup
          setTimeout(() => {
            shownNotificationIds.delete(notificationId);
          }, NOTIFICATION_DEDUP_TTL);
        }

        // Suppress toast for booking confirmations - the BookingSuccessModal handles this
        // This prevents the toast from appearing before the modal when payment completes
        const suppressedTypes = [
          'BOOKING_CONFIRMATION',
          'booking_confirmed',
          'booking_received'
        ];

        if (suppressedTypes.includes(notification.type)) {
          console.log('[NotificationContext] Booking notification toast suppressed, modal will handle:', notification.type);
          return;
        }

        // Show toast notification for other types
        toast.success(notification.title || 'New Notification', {
          description: notification.message || 'You have a new notification',
          duration: 5000,
        });
      });

      // Handle notifications fetched via socket - React Query handles the data
      socketInstance.on('notifications-fetched', () => {
        refetchNotifications();
      });

      // Handle notification read acknowledgment
      socketInstance.on('notification-read', () => {
        refetchNotifications();
      });

      // Handle all notifications read acknowledgment
      socketInstance.on('all-notifications-read', () => {
        refetchNotifications();
      });

      // Handle errors - fallback to REST API
      socketInstance.on('notifications-error', () => {
        refetchNotifications();
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [getAuthToken, refetchNotifications, shouldLoadNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}