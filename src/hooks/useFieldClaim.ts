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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit claim');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Claim submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit claim');
    },
  });
};