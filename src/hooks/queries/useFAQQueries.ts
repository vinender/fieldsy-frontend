import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
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
  // Track if we're on the client to avoid hydration mismatches
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const query = useQuery({
    queryKey: faqQueryKeys.public(),
    queryFn: async () => {
      const response = await axiosClient.get('/faqs/public');
      return response.data as FAQResponse;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - FAQs don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    enabled: isClient, // Only fetch after hydration
    ...options,
  });

  // During SSR and initial hydration, always return loading false with default FAQs
  // to prevent hydration mismatches
  const isHydrating = !isClient;
  
  return {
    faqs: query.data?.data?.faqs || [],
    groupedFAQs: query.data?.data?.grouped || {},
    loading: isHydrating ? false : query.isLoading,
    isLoading: isHydrating ? false : query.isLoading,
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
  // Track if we're on the client to avoid hydration mismatches
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const query = useQuery({
    queryKey: faqQueryKeys.grouped(),
    queryFn: async () => {
      const response = await axiosClient.get('/faqs/public');
      return response.data as FAQResponse;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: isClient, // Only fetch after hydration
    ...options,
  });

  const isHydrating = !isClient;
  
  // Transform data to return only grouped FAQs
  return {
    data: query.data?.data?.grouped || {},
    faqs: query.data?.data?.faqs || [],
    loading: isHydrating ? false : query.isLoading,
    isLoading: isHydrating ? false : query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}