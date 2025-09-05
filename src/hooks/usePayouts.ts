import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Types
export interface Transaction {
  id: string;
  orderId: string;
  paymentId: string;
  date: string;
  amount: number;
  status: 'completed' | 'refunded' | 'failed' | 'pending';
  type: string;
  fieldName?: string;
  fieldAddress?: string;
  customerName?: string;
  customerEmail?: string;
  description?: string;
}

export interface EarningsHistory {
  transactions: Transaction[];
  totalEarnings: number;
  stats: {
    completed: number;
    refunded: number;
    failed: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EarningsSummary {
  totalEarnings: number;
  currentBalance: number;
  pendingPayouts: number;
  lastPayout: Date | null;
  monthlyEarnings: Array<{
    month: string;
    amount: number;
  }>;
}

// Hooks

// Get earnings history with pagination
export const useEarningsHistory = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { data: session } = useSession();
  
  return useQuery<EarningsHistory>({
    queryKey: ['earnings-history', params],
    queryFn: async () => {
      const token = (session as any)?.accessToken || 
                   (typeof window !== 'undefined' && localStorage.getItem('authToken'));
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await fetch(
        `${API_URL}/earnings/payout-history?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch earnings history');
      }

      return response.json();
    },
    enabled: !!session || !!(typeof window !== 'undefined' && localStorage.getItem('authToken')),
  });
};

// Get earnings summary
export const useEarningsSummary = (period: 'all' | 'week' | 'month' | 'year' = 'all') => {
  const { data: session } = useSession();
  
  return useQuery<EarningsSummary>({
    queryKey: ['earnings-summary', period],
    queryFn: async () => {
      const token = (session as any)?.accessToken || 
                   (typeof window !== 'undefined' && localStorage.getItem('authToken'));
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${API_URL}/earnings/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch earnings summary');
      }

      return response.json();
    },
    enabled: !!session || !!(typeof window !== 'undefined' && localStorage.getItem('authToken')),
  });
};

// Get transaction details
export const useTransactionDetails = (transactionId: string) => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const token = (session as any)?.accessToken || 
                   (typeof window !== 'undefined' && localStorage.getItem('authToken'));
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${API_URL}/payouts/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transaction details');
      }

      return response.json();
    },
    enabled: !!transactionId && (!!session || !!(typeof window !== 'undefined' && localStorage.getItem('authToken'))),
  });
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper function to format date
export const formatTransactionDate = (date: string | Date): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};