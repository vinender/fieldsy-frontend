import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: string;
  brand: string | null;
  last4: string;
  expiryMonth: number | null;
  expiryYear: number | null;
  cardholderName: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all payment methods
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const response = await axiosClient.get('/payment-methods');
      return response.data.paymentMethods as PaymentMethod[];
    },
  });
};

// Set default payment method with optimistic update
export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await axiosClient.put(`/payment-methods/${paymentMethodId}/set-default`);
      return response.data;
    },
    // Optimistic update - immediately update UI before API call completes
    onMutate: async (paymentMethodId: string) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['payment-methods'] });

      // Snapshot the previous value
      const previousMethods = queryClient.getQueryData<PaymentMethod[]>(['payment-methods']);

      // Optimistically update: set new default, unset others
      if (previousMethods) {
        queryClient.setQueryData<PaymentMethod[]>(['payment-methods'],
          previousMethods.map(method => ({
            ...method,
            isDefault: method.id === paymentMethodId
          }))
        );
      }

      // Return context with previous value for rollback
      return { previousMethods };
    },
    onSuccess: () => {
      // Use toast ID to prevent duplicate toasts
      toast.success('Default payment method updated', { id: 'set-default-card' });
    },
    onError: (error: any, _paymentMethodId, context) => {
      // Rollback to previous state on error
      if (context?.previousMethods) {
        queryClient.setQueryData(['payment-methods'], context.previousMethods);
      }
      toast.error(error.response?.data?.error || 'Failed to update default payment method', { id: 'set-default-card-error' });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

// Delete payment method
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await axiosClient.delete(`/payment-methods/${paymentMethodId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Payment method deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete payment method');
    },
  });
};