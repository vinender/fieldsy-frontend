import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';
import { fieldQueryKeys } from '../queries/useFieldQueries';

// Types for mutations
export interface SaveProgressData {
  step: string;
  data: any;
  fieldId?: string | null;
}

export interface SaveProgressResponse {
  success: boolean;
  fieldId?: string;
  allStepsCompleted?: boolean;
  message?: string;
  isNewField?: boolean;
  stepCompleted?: boolean;
  isActive?: boolean;
}

// Hook to save field progress
export function useSaveFieldProgress(
  options?: Omit<UseMutationOptions<SaveProgressResponse, Error, SaveProgressData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ step, data, fieldId }: SaveProgressData) => {
      const response = await axiosClient.post('/fields/save-progress', {
        step,
        data,
        fieldId,
      });
      return response.data as SaveProgressResponse;
    },
    onSuccess: (result) => {
      // Invalidate and refetch owner field data (both single and list queries)
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerField() });
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerFields() });

      // Show appropriate message based on whether field was created or updated
      if (result.isNewField) {
        toast.success('Field created and progress saved successfully!');
      } else {
        toast.success('Progress saved successfully!');
      }

      if (options?.onSuccess) {
        options.onSuccess(result, {} as SaveProgressData, {} as any);
      }
    },
    onError: (error: any) => {
      console.error('Error saving progress:', error);
      toast.error(error.response?.data?.message || 'Failed to save progress. Please try again.');
      
      if (options?.onError) {
        options.onError(error, {} as SaveProgressData, {} as any);
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

// Hook to submit field for review
export function useSubmitFieldForReview(
  options?: Omit<UseMutationOptions<any, Error, { fieldId: string | null }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ fieldId }: { fieldId: string | null }) => {
      if (!fieldId) throw new Error('Field ID is required');

      const response = await axiosClient.post('/fields/submit-for-review', {
        fieldId,
      });

      // Refetch queries immediately after successful mutation
      await Promise.all([
        queryClient.refetchQueries({ queryKey: fieldQueryKeys.ownerField() }),
        queryClient.refetchQueries({ queryKey: fieldQueryKeys.ownerFields() })
      ]);

      return response.data;
    },
    onSuccess: (result) => {
      if (options?.onSuccess) {
        options.onSuccess(result, {} as any, {} as any);
      } else {
        // Only show default toast if no custom onSuccess is provided
        toast.success('Field submitted for review successfully!');
      }
    },
    onError: (error: any) => {
      console.error('Error submitting field:', error);
      toast.error(error.response?.data?.message || 'Failed to submit field. Please try again.');
      
      if (options?.onError) {
        options.onError(error, {} as any, {} as any);
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

// Hook to create a new field
export function useCreateField(
  options?: Omit<UseMutationOptions<any, Error, any>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (fieldData: any) => {
      const response = await axiosClient.post('/fields', fieldData);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.all });
      toast.success('Field created successfully!');
      
      if (options?.onSuccess) {
        options.onSuccess(result, {} as any, {} as any);
      }
    },
    onError: (error: any) => {
      console.error('Error creating field:', error);
      toast.error(error.response?.data?.message || 'Failed to create field. Please try again.');
      
      if (options?.onError) {
        options.onError(error, {} as any, {} as any);
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

// Hook to update a field
export function useUpdateField(
  options?: Omit<UseMutationOptions<any, Error, { id: string; data: any }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axiosClient.put(`/fields/${id}`, data);
      return response.data;
    },
    onSuccess: (result, variables) => {
      // Invalidate specific field and owner field queries
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.fieldDetails(variables.id) });
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerField() });
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerFields() });
      toast.success('Field updated successfully!');

      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Error updating field:', error);
      toast.error(error.response?.data?.message || 'Failed to update field. Please try again.');
      
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


// Hook to delete a field
export function useDeleteField(
  options?: Omit<UseMutationOptions<any, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const response = await axiosClient.delete(`/fields/${fieldId}`);
      return response.data;
    },
    onSuccess: (result, fieldId) => {
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerField() });
      toast.success('Field deleted successfully!');

      if (options?.onSuccess) {
        options.onSuccess(result, fieldId, {} as any);
      }
    },
    onError: (error: any, fieldId) => {
      console.error('Error deleting field:', error);
      toast.error(error.response?.data?.message || 'Failed to delete field. Please try again.');

      if (options?.onError) {
        options.onError(error, fieldId, {} as any);
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

// Hook to toggle field status (enable/disable)
export function useToggleFieldStatus(
  options?: Omit<UseMutationOptions<any, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const response = await axiosClient.patch(`/fields/${fieldId}/toggle-status`);
      return response.data;
    },
    onSuccess: (result, fieldId) => {
      // Invalidate field queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerField() });
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerFields() });
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.fieldDetails(fieldId) });

      // Show success message from backend
      toast.success(result.message || 'Field status updated successfully!');

      if (options?.onSuccess) {
        options.onSuccess(result, fieldId, {} as any);
      }
    },
    onError: (error: any, fieldId) => {
      console.error('Error toggling field status:', error);
      toast.error(error.response?.data?.message || 'Failed to update field status. Please try again.');

      if (options?.onError) {
        options.onError(error, fieldId, {} as any);
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
};
