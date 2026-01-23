import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const bookingQueryKeys = {
  userBookings: () => ['bookings', 'my-bookings'] as const,
  userBookingsByStatus: (status: string, page: number, filters?: any) =>
    ['bookings', 'my-bookings', status, page, JSON.stringify(filters)] as const,
  bookingDetails: (id: string) => ['booking', id] as const,
  cancelledBookings: (page: number) => ['bookings', 'cancelled', page] as const,
  hasCompletedBooking: (fieldId: string) => ['bookings', 'has-completed', fieldId] as const,
};

// Types
export interface Booking {
  id: string;
  fieldId: string;
  fieldName?: string;
  userId: string;
  userName?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  field?: any;
  user?: any;
}

export interface UserBookingsResponse {
  success: boolean;
  bookings: Booking[];
  total?: number;
}

// Hook to fetch user's bookings
export function useUserBookings(options?: Omit<UseQueryOptions<UserBookingsResponse, Error>, 'queryKey' | 'queryFn'>) {
  const query = useQuery({
    queryKey: bookingQueryKeys.userBookings(),
    queryFn: async () => {
      const response = await axiosClient.get('/bookings/my-bookings');
      return response.data as UserBookingsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  return {
    data: query.data?.bookings || [],
    total: query.data?.total || 0,
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}

// Interface for booking status query params
export interface BookingStatusParams {
  status: 'upcoming' | 'completed' | 'cancelled';
  page?: number;
  limit?: number;
  filters?: {
    dateRange?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export interface BookingsByStatusResponse {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Hook to fetch user bookings by status with proper caching
// Shows cached data immediately on tab change, refetches in background
export function useUserBookingsByStatus(
  params: BookingStatusParams,
  options?: Omit<UseQueryOptions<BookingsByStatusResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const { status, page = 1, limit = 10, filters } = params;

  // Map tab status to API status
  const getApiStatus = () => {
    switch (status) {
      case 'upcoming':
        return 'CONFIRMED';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  };

  const query = useQuery({
    queryKey: bookingQueryKeys.userBookingsByStatus(status, page, filters),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      queryParams.append('status', getApiStatus());

      // Add status-specific params
      if (status === 'completed' || status === 'cancelled') {
        queryParams.append('includeExpired', 'true');
      }
      if (status === 'upcoming') {
        queryParams.append('includeFuture', 'true');
      }

      // Add date range filters if applied
      if (filters) {
        if (filters.dateRange === 'customDate' && filters.startDate && filters.endDate) {
          queryParams.append('startDate', filters.startDate.toISOString());
          queryParams.append('endDate', filters.endDate.toISOString());
        } else if (filters.dateRange && filters.dateRange !== 'customDate') {
          queryParams.append('dateRange', filters.dateRange);
        }
      }

      const response = await axiosClient.get(`/bookings/my-bookings?${queryParams.toString()}`);
      return response.data as BookingsByStatusResponse;
    },
    // Caching configuration for smooth tab switching
    staleTime: 30 * 1000, // Data is fresh for 30 seconds (short so refetch happens often)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: 'always', // Always refetch when window regains focus (browser tab switch)
    refetchOnReconnect: 'always', // Always refetch when coming back online
    refetchOnMount: false, // Don't refetch if data exists in cache (for tab switching within app)
    placeholderData: (previousData) => previousData, // Show previous data while fetching
    ...options,
  });

  return {
    data: query.data?.data || [],
    pagination: query.data?.pagination,
    loading: query.isLoading,
    isLoading: query.isLoading,
    isFetching: query.isFetching, // True when background refetch is happening
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    isPlaceholderData: query.isPlaceholderData,
  };
}

// Hook to fetch booking details
export function useBookingDetails(
  bookingId: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery({
    queryKey: bookingQueryKeys.bookingDetails(bookingId),
    queryFn: async () => {
      const response = await axiosClient.get(`/bookings/${bookingId}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      console.log(' fullBooking response', response.data);
      return response.data;
    },
    enabled: !!bookingId,
    staleTime: 0, // Always consider data stale
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnMount: 'always', // Always refetch when modal opens
    ...options,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}


// Hook to fetch cancelled bookings for field owners
export interface CancelledBookingsParams {
  page?: number;
  limit?: number;
}

export interface CancelledBookingsResponse {
  success: boolean;
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function useCancelledBookings(
  params: CancelledBookingsParams = { page: 1, limit: 10 },
  options?: Omit<UseQueryOptions<CancelledBookingsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const { page = 1, limit = 10 } = params;

  const query = useQuery({
    queryKey: bookingQueryKeys.cancelledBookings(page),
    queryFn: async () => {
      const response = await axiosClient.get('/bookings/cancelled', {
        params: { page, limit },
      });
      return response.data as CancelledBookingsResponse;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
    ...options,
  });

  return {
    data: query.data?.data || [],
    pagination: query.data?.pagination,
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}

// Hook to check if user has completed bookings for a specific field
export interface HasCompletedBookingResponse {
  success: boolean;
  hasCompletedBooking: boolean;
  data: {
    canReview: boolean;
  };
}

export function useHasCompletedBooking(
  fieldId: string,
  options?: Omit<UseQueryOptions<HasCompletedBookingResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery({
    queryKey: bookingQueryKeys.hasCompletedBooking(fieldId),
    queryFn: async () => {
      const response = await axiosClient.get(`/bookings/fields/${fieldId}/has-completed`);
      return response.data as HasCompletedBookingResponse;
    },
    enabled: !!fieldId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  return {
    hasCompletedBooking: query.data?.hasCompletedBooking || false,
    canReview: query.data?.data?.canReview || false,
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}