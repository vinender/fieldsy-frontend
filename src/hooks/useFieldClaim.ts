import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface FieldClaimData {
  fieldId: string;
  fullName: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  isLegalOwner: boolean;
  documents: string[];
}

export interface ClaimResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    fieldId: string;
    fullName: string;
    email: string;
    phoneCode: string;
    phoneNumber: string;
    isLegalOwner: boolean;
    documents: string[];
    status: string;
    createdAt: string;
    field: {
      id: string;
      name: string;
      address: string;
    };
  };
}

export const useSubmitFieldClaim = () => {
  return useMutation<ClaimResponse, Error, FieldClaimData>({
    mutationFn: async (data: FieldClaimData) => {
      const response = await fetch(`${API_URL}/claims/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(() => null);

      if (!response) {
        // Network error - create a plain object error to avoid Next.js error overlay
        const error: any = { message: 'Network error. Please check your connection.' };
        error.name = 'NetworkError';
        throw error;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit claim' }));
        // Create a plain object error instead of Error instance to avoid Next.js dev overlay
        const error: any = { message: errorData.message || 'Failed to submit claim' };
        error.name = 'ValidationError';
        throw error;
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Claim submitted successfully!');
    },
    onError: (error: any) => {
      // Always show toast notification instead of runtime error
      const message = error?.message || 'Failed to submit claim';
      toast.error(message);
    },
    // Prevent error from propagating to React error boundary
    throwOnError: false,
  });
};