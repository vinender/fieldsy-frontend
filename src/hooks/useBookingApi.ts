import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Types
interface RefundEligibilityResponse {
  success: boolean;
  data: {
    isRefundEligible: boolean;
    hoursGap?: number;
    message: string;
  };
}

interface CancelBookingResponse {
  success: boolean;
  message: string;
  data: {
    isRefundEligible: boolean;
    refundMessage: string;
    [key: string]: any;
  };
}

// API functions
const checkRefundEligibility = async (bookingId: string): Promise<RefundEligibilityResponse> => {
  const response = await axiosClient.get(`/bookings/${bookingId}/refund-eligibility`);
  return response.data;
};

const cancelBooking = async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
  const response = await axiosClient.patch<CancelBookingResponse>(
    `/bookings/${bookingId}/cancel`,
    { reason }
  );
  return response.data;
};

// React Query Hooks

// Hook to check refund eligibility
export const useCheckRefundEligibility = (bookingId: string, enabled = true) => {
  return useQuery({
    queryKey: ['refund-eligibility', bookingId],
    queryFn: () => checkRefundEligibility(bookingId),
    enabled: enabled && !!bookingId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2,
  });
};

// Hook to cancel booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: (data) => {
      // Invalidate bookings queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      
      // Show success message
      const message = data.data.isRefundEligible 
        ? 'Booking cancelled successfully. Your refund will be processed within 5-7 business days.'
        : 'Booking cancelled successfully. This booking was not eligible for a refund.';
      
      // You can dispatch a toast notification here if you have a toast system
      console.log('Success:', message);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
      console.error('Error cancelling booking:', errorMessage);
      // You can dispatch a toast notification here if you have a toast system
    },
  });
};

// Hook to fetch bookings
export const useMyBookings = (status?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['my-bookings', status, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) {
        params.append('status', status);
      }
      
      const response = await axiosClient.get(`/bookings/my-bookings?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
  });
};