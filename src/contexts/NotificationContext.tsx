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
  console.log('notificationData',notificationData)
  // Mutations
  const markNotificationAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const clearAllMutation = useClearAllNotifications();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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

  // Fetch notifications via socket
  const fetchNotifications = useCallback((page: number = 1, limit: number = 20) => {
    if (socket?.connected) {
      console.log('[NotificationContext] Fetching notifications via socket');
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
        console.log('Connected to notification server');
        console.log('Socket ID:', socketInstance.id);
        console.log('Auth token being used:', token?.substring(0, 20) + '...');
        setIsConnected(true);
        
        // Fetch notifications via socket when connected
        socketInstance.emit('fetch-notifications', { page: 1, limit: 20 });
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from notification server');
        setIsConnected(false);
      });

      // Handle new notification
      socketInstance.on('notification', (notification: any) => {
        console.log('=== New Notification Received ===');
        console.log('Full notification object:', notification);
        console.log('Notification ID:', notification.id);
        console.log('For User ID:', notification.userId);
        console.log('Type:', notification.type);
        console.log('Title:', notification.title);
        
        // Refetch notifications to update the list
        refetchNotifications();
        
        // Show toast notification
        toast.success(notification.title || 'New Notification', {
          description: notification.message || 'You have a new notification',
          duration: 5000,
        });
      });

      // Handle notifications fetched via socket
      socketInstance.on('notifications-fetched', (data: {
        notifications: Notification[];
        unreadCount: number;
        pagination: any;
      }) => {
        console.log('[NotificationContext] Received notifications from socket:', data);
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      });
      
      // Handle notification read acknowledgment
      socketInstance.on('notification-read', (data: {
        notificationId: string;
        unreadCount: number;
      }) => {
        console.log('[NotificationContext] Notification marked as read:', data);
        setUnreadCount(data.unreadCount || 0);
        // Update the specific notification in the list
        setNotifications(prev => prev.map(n => 
          n.id === data.notificationId ? { ...n, read: true } : n
        ));
      });
      
      // Handle all notifications read acknowledgment
      socketInstance.on('all-notifications-read', (data: {
        unreadCount: number;
      }) => {
        console.log('[NotificationContext] All notifications marked as read');
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      });
      
      // Handle errors
      socketInstance.on('notifications-error', (data: { error: string }) => {
        console.error('[NotificationContext] Error fetching notifications:', data.error);
        // Fallback to REST API
        refetchNotifications();
      });
      
      // Handle unread count update
      socketInstance.on('unreadCount', (count: number) => {
        setUnreadCount(count);
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