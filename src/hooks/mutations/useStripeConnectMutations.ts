import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';
import { stripeConnectQueryKeys } from '../queries/useStripeConnectQueries';

// Types
export interface CreateAccountResponse {
  success: boolean;
  message?: string;
  data?: {
    accountId: string;
    stripeAccountId: string;
  };
}

export interface OnboardingLinkResponse {
  success: boolean;
  data: {
    url: string;
  };
}

export interface CreatePayoutData {
  amount: number;
  currency?: string;
  method?: 'standard' | 'instant';
}

// Hook to create Stripe Connect account
export function useCreateStripeAccount(
  options?: Omit<UseMutationOptions<CreateAccountResponse, Error, void>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosClient.post('/stripe-connect/create-account');
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: stripeConnectQueryKeys.accountStatus() });
      toast.success(result.message || 'Stripe account created successfully');
      
      if (options?.onSuccess) {
        options.onSuccess(result, undefined, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create Stripe account');
      
      if (options?.onError) {
        options.onError(error, undefined, {} as any);
      }
    },
    ...options,
  });
}

// Hook to get Stripe onboarding link
export function useGetOnboardingLink(
  options?: Omit<UseMutationOptions<OnboardingLinkResponse, Error, { returnUrl?: string; refreshUrl?: string }>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosClient.post('/stripe-connect/onboarding-link', data);
      return response.data;
    },
    onSuccess: (result, variables) => {
      // Redirect to Stripe onboarding
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      toast.error(error.response?.data?.message || 'Failed to get onboarding link');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });
}

// Hook to update bank account
export function useUpdateBankAccount(
  options?: Omit<UseMutationOptions<OnboardingLinkResponse, Error, void>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: async () => {
      const response = await axiosClient.post('/stripe-connect/update-bank');
      return response.data;
    },
    onSuccess: (result) => {
      // Redirect to Stripe account update
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
      
      if (options?.onSuccess) {
        options.onSuccess(result, undefined, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to get update link');
      
      if (options?.onError) {
        options.onError(error, undefined, {} as any);
      }
    },
    ...options,
  });
}

// Hook to create payout
export function useCreatePayout(
  options?: Omit<UseMutationOptions<any, Error, CreatePayoutData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosClient.post('/stripe-connect/payout', data);
      return response.data;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: stripeConnectQueryKeys.balance() });
      queryClient.invalidateQueries({ queryKey: stripeConnectQueryKeys.payoutHistory() });
      toast.success(result.message || 'Payout initiated successfully');
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      toast.error(error.response?.data?.message || 'Failed to create payout');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });
}

// Hook to disconnect Stripe account
export function useDisconnectStripeAccount(
  options?: Omit<UseMutationOptions<any, Error, void>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosClient.delete('/stripe-connect/disconnect');
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: stripeConnectQueryKeys.all });
      toast.success(result.message || 'Bank account disconnected successfully');
      
      if (options?.onSuccess) {
        options.onSuccess(result, undefined, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to disconnect account');
      
      if (options?.onError) {
        options.onError(error, undefined, {} as any);
      }
    },
    ...options,
  });
}