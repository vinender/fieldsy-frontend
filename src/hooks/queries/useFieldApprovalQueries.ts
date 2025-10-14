import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
export interface PendingField {
  id: string;
  name: string;
  description?: string;
  address?: string;
  location?: any;
  price: number;
  images: string[];
  isApproved: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PendingFieldsResponse {
  success: boolean;
  data: {
    fields: PendingField[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface ApproveFieldResponse {
  success: boolean;
  message: string;
  data: PendingField;
}

export interface RejectFieldResponse {
  success: boolean;
  message: string;
  data: PendingField;
}

// Query keys
export const fieldApprovalKeys = {
  all: ['field-approvals'] as const,
  pending: (page?: number, limit?: number) => [...fieldApprovalKeys.all, 'pending', { page, limit }] as const,
};

// Hook to fetch pending fields (Admin only)
export function usePendingFields(page: number = 1, limit: number = 10) {
  const { data: session } = useSession();

  return useQuery<PendingFieldsResponse>({
    queryKey: fieldApprovalKeys.pending(page, limit),
    queryFn: async () => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get<PendingFieldsResponse>(
        `${API_URL}/fields/admin/pending-approval`,
        {
          params: { page, limit },
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      return response.data;
    },
    enabled: !!session?.accessToken && session?.user?.role === 'ADMIN',
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
}

// Hook to approve a field (Admin only)
export function useApproveField() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await axios.patch<ApproveFieldResponse>(
        `${API_URL}/fields/${fieldId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate pending fields query to refresh the list
      queryClient.invalidateQueries({ queryKey: fieldApprovalKeys.all });

      // Also invalidate the fields list to show updated approval status
      queryClient.invalidateQueries({ queryKey: ['fields'] });

      toast.success(data.message || 'Field approved successfully! Owner has been notified via email.');
    },
    onError: (error: any) => {
      console.error('Field approval error:', error);

      const apiMessage = error?.response?.data?.message || error?.message || '';
      const status = error?.response?.status;

      if (status === 403) {
        toast.error('You do not have permission to approve fields. Admin access required.');
      } else if (status === 404) {
        toast.error('Field not found. It may have been deleted.');
      } else if (status === 400) {
        if (apiMessage.toLowerCase().includes('already approved')) {
          toast.error('This field has already been approved.');
        } else {
          toast.error(apiMessage || 'Invalid request. Please try again.');
        }
      } else if (status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(apiMessage || 'Failed to approve field. Please try again.');
      }
    },
  });
}

// Hook to reject a field (Admin only)
export function useRejectField() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fieldId, reason }: { fieldId: string; reason: string }) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      if (!reason || reason.trim().length === 0) {
        throw new Error('Rejection reason is required');
      }

      const response = await axios.patch<RejectFieldResponse>(
        `${API_URL}/fields/${fieldId}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate pending fields query to refresh the list
      queryClient.invalidateQueries({ queryKey: fieldApprovalKeys.all });

      // Also invalidate the fields list to show updated approval status
      queryClient.invalidateQueries({ queryKey: ['fields'] });

      toast.success(data.message || 'Field rejected. Owner has been notified.');
    },
    onError: (error: any) => {
      console.error('Field rejection error:', error);

      const apiMessage = error?.response?.data?.message || error?.message || '';
      const status = error?.response?.status;

      if (status === 403) {
        toast.error('You do not have permission to reject fields. Admin access required.');
      } else if (status === 404) {
        toast.error('Field not found. It may have been deleted.');
      } else if (status === 400) {
        if (apiMessage.toLowerCase().includes('reason')) {
          toast.error('Please provide a reason for rejecting this field.');
        } else {
          toast.error(apiMessage || 'Invalid request. Please try again.');
        }
      } else if (status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(apiMessage || 'Failed to reject field. Please try again.');
      }
    },
  });
}
