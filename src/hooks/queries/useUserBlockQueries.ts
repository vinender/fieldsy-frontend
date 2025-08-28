import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';

interface BlockUserData {
  blockedUserId: string;
  reason?: string;
}

interface UnblockUserData {
  blockedUserId: string;
}

interface BlockStatus {
  isBlocked: boolean;
  isBlockedBy: boolean;
  canChat: boolean;
}

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BlockUserData) => {
      const response = await axiosClient.post('/user-blocks/block', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'User blocked successfully');
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['block-status'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to block user';
      toast.error(message);
      throw error;
    }
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UnblockUserData) => {
      const response = await axiosClient.post('/user-blocks/unblock', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'User unblocked successfully');
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['block-status'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to unblock user';
      toast.error(message);
      throw error;
    }
  });
};

export const useBlockedUsers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['blocked-users', page, limit],
    queryFn: async () => {
      const response = await axiosClient.get('/user-blocks/blocked', {
        params: { page, limit }
      });
      return response.data;
    }
  });
};

export const useBlockedByUsers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['blocked-by-users', page, limit],
    queryFn: async () => {
      const response = await axiosClient.get('/user-blocks/blocked-by', {
        params: { page, limit }
      });
      return response.data;
    }
  });
};

export const useBlockStatus = (otherUserId: string | undefined) => {
  return useQuery<{ success: boolean; data: BlockStatus }>({
    queryKey: ['block-status', otherUserId],
    queryFn: async () => {
      const response = await axiosClient.get(`/user-blocks/status/${otherUserId}`);
      return response.data;
    },
    enabled: !!otherUserId,
    staleTime: 30000, // Cache for 30 seconds
  });
};

// Hook to check if messaging is allowed between two users
export const useCanChat = (otherUserId: string | undefined) => {
  const { data, isLoading } = useBlockStatus(otherUserId);
  
  return {
    canChat: data?.data?.canChat ?? true,
    isBlocked: data?.data?.isBlocked ?? false,
    isBlockedBy: data?.data?.isBlockedBy ?? false,
    isLoading
  };
};