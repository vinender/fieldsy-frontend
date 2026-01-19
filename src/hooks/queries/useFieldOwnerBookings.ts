import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const fieldOwnerBookingKeys = {
  all: ['field-owner-bookings'] as const,
  today: (page: number = 1) => ['field-owner-bookings', 'today', page] as const,
  upcoming: (page: number = 1) => ['field-owner-bookings', 'upcoming', page] as const,
  completed: (page: number = 1) => ['field-owner-bookings', 'completed', page] as const,
  recent: () => ['field-owner-bookings', 'recent'] as const,
};

// Types
export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userEmail?: string;
  userPhone?: string;
  time: string;
  orderId: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'refunded' | 'pending';
  frequency?: string;
  dogs: number;
  amount: number;
  date: string;
  fieldName?: string;
  fieldId?: string;
  fieldAddress?: string;
  notes?: string;
  rescheduleCount?: number; // Number of times booking has been rescheduled
  // Fee breakdown
  platformCommissionRate?: number; // Platform fee percentage (what Fieldsy takes)
  isCustomCommission?: boolean; // Whether admin has set a custom commission for this field owner
  defaultCommissionRate?: number; // The default platform commission rate
  stripeFee?: number;
  amountAfterStripeFee?: number;
  fieldOwnerEarnings?: number; // What field owner receives
  platformFee?: number; // What Fieldsy keeps
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

// Hook for completed bookings (only COMPLETED status)
export function useCompletedBookings(
  page: number = 1,
  options?: Omit<UseQueryOptions<BookingResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldOwnerBookingKeys.completed(page),
    queryFn: async () => {
      const response = await axiosClient.get(`/fields/owner/bookings/completed?page=${page}&limit=12`);
      return response.data as BookingResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false, // Completed bookings don't change as often
    ...options,
  });
}

// Hook for recent bookings (last 5)
export function useRecentBookings(
  options?: Omit<UseQueryOptions<BookingResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldOwnerBookingKeys.recent(),
    queryFn: async () => {
      const response = await axiosClient.get(`/fields/owner/bookings/recent?limit=5`);
      return response.data as BookingResponse;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    ...options,
  });
}

// Hook to get the appropriate booking query based on tab
export function useFieldOwnerBookings(
  tab: 'today' | 'upcoming' | 'previous' | 'completed',
  page: number = 1,
  options?: Omit<UseQueryOptions<BookingResponse, Error>, 'queryKey' | 'queryFn'>
) {
  switch (tab) {
    case 'today':
      return useTodayBookings(page, options);
    case 'upcoming':
      return useUpcomingBookings(page, options);
    case 'previous':
    case 'completed':
      return useCompletedBookings(page, options);
    default:
      return useTodayBookings(page, options);
  }
}