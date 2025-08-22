import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const fieldOwnerBookingKeys = {
  all: ['field-owner-bookings'] as const,
  today: (page: number = 1) => ['field-owner-bookings', 'today', page] as const,
  upcoming: (page: number = 1) => ['field-owner-bookings', 'upcoming', page] as const,
  previous: (page: number = 1) => ['field-owner-bookings', 'previous', page] as const,
};

// Types
export interface Booking {
  id: string;
  userName: string;
  userAvatar?: string;
  userEmail?: string;
  userPhone?: string;
  time: string;
  orderId: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  frequency?: string;
  dogs: number;
  amount: number;
  date: string;
  fieldName?: string;
  fieldAddress?: string;
  notes?: string;
}

export interface BookingStats {
  todayBookings: number;
  totalBookings: number;
  totalEarnings: number;
}

export interface BookingResponse {
  success: boolean;
  bookings: Booking[];
  stats: BookingStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Hook for today's bookings
export function useTodayBookings(
  page: number = 1,
  options?: Omit<UseQueryOptions<BookingResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldOwnerBookingKeys.today(page),
    queryFn: async () => {
      const response = await axiosClient.get(`/fields/owner/bookings/today?page=${page}&limit=12`);
      return response.data as BookingResponse;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    ...options,
  });
}

// Hook for upcoming bookings
export function useUpcomingBookings(
  page: number = 1,
  options?: Omit<UseQueryOptions<BookingResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldOwnerBookingKeys.upcoming(page),
    queryFn: async () => {
      const response = await axiosClient.get(`/fields/owner/bookings/upcoming?page=${page}&limit=12`);
      return response.data as BookingResponse;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    ...options,
  });
}

// Hook for previous bookings
export function usePreviousBookings(
  page: number = 1,
  options?: Omit<UseQueryOptions<BookingResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldOwnerBookingKeys.previous(page),
    queryFn: async () => {
      const response = await axiosClient.get(`/fields/owner/bookings/previous?page=${page}&limit=12`);
      return response.data as BookingResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false, // Previous bookings don't change as often
    ...options,
  });
}

// Hook to get the appropriate booking query based on tab
export function useFieldOwnerBookings(
  tab: 'today' | 'upcoming' | 'previous',
  page: number = 1,
  options?: Omit<UseQueryOptions<BookingResponse, Error>, 'queryKey' | 'queryFn'>
) {
  switch (tab) {
    case 'today':
      return useTodayBookings(page, options);
    case 'upcoming':
      return useUpcomingBookings(page, options);
    case 'previous':
      return usePreviousBookings(page, options);
    default:
      return useTodayBookings(page, options);
  }
}