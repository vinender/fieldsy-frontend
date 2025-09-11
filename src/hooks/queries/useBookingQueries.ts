import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const bookingQueryKeys = {
  userBookings: () => ['bookings', 'my-bookings'] as const,
  bookingDetails: (id: string) => ['booking', id] as const,
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