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

// Set default payment method
export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await axiosClient.put(`/payment-methods/${paymentMethodId}/set-default`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Default payment method updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update default payment method');
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