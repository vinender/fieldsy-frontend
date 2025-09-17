import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const faqQueryKeys = {
  all: ['faqs'] as const,
  public: () => ['faqs', 'public'] as const,
  grouped: () => ['faqs', 'grouped'] as const,
};

// Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQResponse {
  success: boolean;
  data: {
    faqs: FAQ[];
    grouped: Record<string, FAQ[]>;
  };
}

// Hook to fetch public FAQs
export function useFAQs(
  options?: Omit<UseQueryOptions<FAQResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery({
    queryKey: faqQueryKeys.public(),
    queryFn: async () => {
      const response = await axiosClient.get('/faqs/public');
      return response.data as FAQResponse;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - FAQs don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    ...options,
  });

  return {
    faqs: query.data?.data?.faqs || [],
    groupedFAQs: query.data?.data?.grouped || {},
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}

// Hook to fetch grouped FAQs by category
export function useGroupedFAQs(
  options?: Omit<UseQueryOptions<FAQResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery({
    queryKey: faqQueryKeys.grouped(),
    queryFn: async () => {
      const response = await axiosClient.get('/faqs/public');
      return response.data as FAQResponse;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });

  // Transform data to return only grouped FAQs
  return {
    data: query.data?.data?.grouped || {},
    faqs: query.data?.data?.faqs || [],
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}