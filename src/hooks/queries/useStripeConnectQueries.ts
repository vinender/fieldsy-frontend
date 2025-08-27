import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const stripeConnectQueryKeys = {
  all: ['stripeConnect'] as const,
  accountStatus: () => [...stripeConnectQueryKeys.all, 'accountStatus'] as const,
  balance: () => [...stripeConnectQueryKeys.all, 'balance'] as const,
  payoutHistory: (params?: any) => [...stripeConnectQueryKeys.all, 'payoutHistory', params] as const,
};

// Types
export interface StripeAccountStatus {
  hasAccount: boolean;
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  requirementsCurrentlyDue?: string[];
  requirementsPastDue?: string[];
  bankAccountLast4?: string;
  bankAccountBrand?: string;
}

export interface StripeBalance {
  availableBalance: number;
  pendingBalance: number;
  currency: string;
}

export interface Payout {
  id: string;
  stripePayoutId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description?: string;
  arrivalDate?: string;
  failureCode?: string;
  failureMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutHistoryResponse {
  payouts: Payout[];
  total: number;
  page: number;
  totalPages: number;
}

// Hook to get Stripe account status
export function useStripeAccountStatus(
  options?: Omit<UseQueryOptions<{ success: boolean; data: StripeAccountStatus }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: stripeConnectQueryKeys.accountStatus(),
    queryFn: async () => {
      const response = await axiosClient.get('/stripe-connect/account-status');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

// Hook to get Stripe balance
export function useStripeBalance(
  options?: Omit<UseQueryOptions<{ success: boolean; data: StripeBalance }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: stripeConnectQueryKeys.balance(),
    queryFn: async () => {
      const response = await axiosClient.get('/stripe-connect/balance');
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}

// Hook to get payout history
export function usePayoutHistory(
  params?: {
    page?: number;
    limit?: number;
    status?: string;
  },
  options?: Omit<UseQueryOptions<{ success: boolean; data: PayoutHistoryResponse }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: stripeConnectQueryKeys.payoutHistory(params),
    queryFn: async () => {
      const response = await axiosClient.get('/stripe-connect/payout-history', {
        params: params || {},
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}