import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const bookingQueryKeys = {
  userBookings: () => ['bookings', 'my-bookings'] as const,
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

// Hook to fetch booking details
export function useBookingDetails(
  bookingId: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery({
    queryKey: bookingQueryKeys.bookingDetails(bookingId),
    queryFn: async () => {
      const response = await axiosClient.get(`/bookings/${bookingId}`);
      console.log(' fullBooking response', response.data);
      return response.data;
    },
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
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