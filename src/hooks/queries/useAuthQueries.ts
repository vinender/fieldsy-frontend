import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const authQueryKeys = {
  currentUser: () => ['auth', 'me'] as const,
};

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrentUserResponse {
  success: boolean;
  user: User;
}

// Hook to fetch current user
export function useCurrentUser(options?: Omit<UseQueryOptions<CurrentUserResponse, Error>, 'queryKey' | 'queryFn'>) {
  const query = useQuery({
    queryKey: authQueryKeys.currentUser(),
    queryFn: async () => {
      const response = await axiosClient.get('/auth/me');
      console.log('[useCurrentUser] Response:', response.data);
      return response.data as CurrentUserResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });

  console.log('[useCurrentUser] Query data:', query.data);
  console.log('[useCurrentUser] Query enabled:', options?.enabled);
  
  return {
    data: query.data?.data || query.data?.user, // Handle both response formats
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}