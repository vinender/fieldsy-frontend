import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';
import { authQueryKeys } from '../queries/useAuthQueries';

// Types for mutations
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export interface UpdateRoleData {
  role: string;
  userId?: string;
}

export interface SocialLoginData {
  provider: string;
  accessToken?: string;
  profile?: any;
}

// Hook for user login
export function useLogin(
  options?: Omit<UseMutationOptions<any, Error, LoginData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await axiosClient.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
      toast.success('Login successful!');
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook for user registration
export function useRegister(
  options?: Omit<UseMutationOptions<any, Error, RegisterData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await axiosClient.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
      toast.success('Registration successful!');
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook for updating user role
export function useUpdateRole(
  options?: Omit<UseMutationOptions<any, Error, UpdateRoleData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UpdateRoleData) => {
      const response = await axiosClient.patch('/auth/update-role', data);
      return response.data;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
      toast.success('Role updated successfully!');
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Update role error:', error);
      toast.error(error.response?.data?.message || 'Failed to update role. Please try again.');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook for social login
export function useSocialLogin(
  options?: Omit<UseMutationOptions<any, Error, SocialLoginData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: SocialLoginData) => {
      const response = await axiosClient.post('/auth/social-login', data);
      return response.data;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
      toast.success('Social login successful!');
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Social login error:', error);
      toast.error(error.response?.data?.message || 'Social login failed. Please try again.');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}