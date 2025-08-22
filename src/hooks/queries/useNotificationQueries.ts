import { useQuery, UseQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (page?: number) => ['notifications', 'list', page] as const,
  unread: () => ['notifications', 'unread'] as const,
  count: () => ['notifications', 'count'] as const,
};

// Types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  data?: any;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationCountResponse {
  success: boolean;
  count: number;
}

// Hook to fetch notifications
export function useNotifications(
  page: number = 1,
  limit: number = 10,
  options?: Omit<UseQueryOptions<NotificationResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationQueryKeys.list(page),
    queryFn: async () => {
      const response = await axiosClient.get(`/notifications?page=${page}&limit=${limit}`);
      return response.data as NotificationResponse;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
}

// Hook to fetch unread notifications count
export function useUnreadNotificationsCount(
  options?: Omit<UseQueryOptions<NotificationCountResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationQueryKeys.count(),
    queryFn: async () => {
      const response = await axiosClient.get('/notifications/unread-count');
      return response.data as NotificationCountResponse;
    },
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    ...options,
  });
}

// Hook for infinite scrolling notifications
export function useInfiniteNotifications(
  limit: number = 10,
  options?: Omit<UseQueryOptions<NotificationResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useInfiniteQuery({
    queryKey: notificationQueryKeys.all,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosClient.get(`/notifications?page=${pageParam}&limit=${limit}`);
      return response.data as NotificationResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination) {
        const { page, totalPages } = lastPage.pagination;
        return page < totalPages ? page + 1 : undefined;
      }
      return undefined;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    ...options,
  });
}