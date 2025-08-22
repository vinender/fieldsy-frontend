import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { notificationQueryKeys } from '../queries/useNotificationQueries';
import { toast } from 'sonner';

// Mark notification as read
export function useMarkNotificationAsRead(
  options?: Omit<UseMutationOptions<any, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await axiosClient.patch(`/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.count() });
    },
    ...options,
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsAsRead(
  options?: Omit<UseMutationOptions<any, Error, void>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosClient.patch('/notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.count() });
      toast.success('All notifications marked as read');
    },
    ...options,
  });
}

// Delete notification
export function useDeleteNotification(
  options?: Omit<UseMutationOptions<any, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await axiosClient.delete(`/notifications/${notificationId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.count() });
      toast.success('Notification deleted');
    },
    ...options,
  });
}

// Clear all notifications
export function useClearAllNotifications(
  options?: Omit<UseMutationOptions<any, Error, void>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosClient.delete('/notifications/clear-all');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.count() });
      toast.success('All notifications cleared');
    },
    ...options,
  });
}