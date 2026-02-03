import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';

interface RequestEmailChangeData {
  newEmail: string;
}

interface VerifyEmailChangeData {
  newEmail: string;
  otp: string;
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: async (data: RequestEmailChangeData) => {
      const response = await axiosClient.post('/users/request-email-change', data);
      return response.data;
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to send verification code';
      toast.error(message);
    },
  });
}

export function useVerifyEmailChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VerifyEmailChangeData) => {
      const response = await axiosClient.post('/users/verify-email-change', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          user.email = data.data?.email || data.email;
          localStorage.setItem('currentUser', JSON.stringify(user));
          window.dispatchEvent(new Event('authTokenChanged'));
        } catch (e) {
          console.error('Failed to update stored user email:', e);
        }
      }

      toast.success('Email updated successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to verify code';
      toast.error(message);
    },
  });
}
