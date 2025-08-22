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

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { user: authUser } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Use React Query hooks for notifications
  const { data: notificationData, isLoading, refetch: refetchNotifications } = useNotificationQuery();
  const { data: unreadData } = useUnreadNotificationsCount();
  
  // Mutations
  const markNotificationAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const clearAllMutation = useClearAllNotifications();
  
  const notifications = notificationData?.notifications || [];
  const unreadCount = unreadData?.count || 0;
  const loading = isLoading;

  // Get auth token from either NextAuth or custom auth
  const getAuthToken = useCallback(() => {
    // Try NextAuth first
    if (session?.accessToken) {
      return session.accessToken;
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

  // Fetch notifications (trigger refetch)
  const fetchNotifications = useCallback(() => {
    refetchNotifications();
  }, [refetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsReadMutation.mutateAsync(id);
      
      // Also emit through socket if connected
      if (socket) {
        socket.emit('markAsRead', id);
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
      if (socket) {
        socket.emit('markAllAsRead');
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
    
    // Only connect if we have a token
    if (token) {

      const socketInstance = io(
        process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:5001',
        {
          auth: {
            token,
          },
        }
      );

      socketInstance.on('connect', () => {
        console.log('Connected to notification server');
        console.log('Socket ID:', socketInstance.id);
        console.log('Auth token being used:', token?.substring(0, 20) + '...');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from notification server');
        setIsConnected(false);
      });

      // Handle new notification
      socketInstance.on('notification', (notification: Notification) => {
        console.log('=== New Notification Received ===');
        console.log('Notification ID:', notification.id);
        console.log('For User ID:', notification.userId);
        console.log('Type:', notification.type);
        console.log('Title:', notification.title);
        
        // Refetch notifications to update the list
        refetchNotifications();
        
        // Show toast notification
        toast.success(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      });

      // Handle unread count update
      socketInstance.on('unreadCount', (count: number) => {
        // Refetch to update unread count
        refetchNotifications();
      });

      setSocket(socketInstance);
      
      // Fetch initial notifications
      fetchNotifications();

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [getAuthToken, refetchNotifications]);

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