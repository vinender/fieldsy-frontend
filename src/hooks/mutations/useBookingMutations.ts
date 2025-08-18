import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';
import { bookingQueryKeys } from '../queries/useBookingQueries';
import { fieldQueryKeys } from '../queries/useFieldQueries';

// Types for mutations
export interface CreateBookingData {
  fieldId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration?: number;
  totalPrice?: number;
  notes?: string;
}

export interface UpdateBookingData {
  id: string;
  data: Partial<CreateBookingData>;
}

export interface CancelBookingData {
  bookingId: string;
  reason?: string;
}

// Hook to create a booking
export function useCreateBooking(
  options?: Omit<UseMutationOptions<any, Error, CreateBookingData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const response = await axiosClient.post('/bookings', data);
      return response.data;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.userBookings() });
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerBookings() });
      toast.success('Booking created successfully!');
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Create booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking. Please try again.');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook to update a booking
export function useUpdateBooking(
  options?: Omit<UseMutationOptions<any, Error, UpdateBookingData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: UpdateBookingData) => {
      const response = await axiosClient.put(`/bookings/${id}`, data);
      return response.data;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.userBookings() });
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.bookingDetails(variables.id) });
      toast.success('Booking updated successfully!');
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Update booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking. Please try again.');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook to cancel a booking
export function useCancelBooking(
  options?: Omit<UseMutationOptions<any, Error, CancelBookingData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ bookingId, reason }: CancelBookingData) => {
      const response = await axiosClient.post(`/bookings/${bookingId}/cancel`, { reason });
      return response.data;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.userBookings() });
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.bookingDetails(variables.bookingId) });
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerBookings() });
      toast.success('Booking cancelled successfully!');
      
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Cancel booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking. Please try again.');
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}