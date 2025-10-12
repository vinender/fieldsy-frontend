import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactQueriesApi, ContactQueryFormData, ContactQueriesFilters } from '@/lib/api/contact-queries';
import { toast } from 'sonner';

// Query key factory
export const contactQueriesKeys = {
  all: ['contact-queries'] as const,
  lists: () => [...contactQueriesKeys.all, 'list'] as const,
  list: (filters?: ContactQueriesFilters) => [...contactQueriesKeys.lists(), filters] as const,
  details: () => [...contactQueriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactQueriesKeys.details(), id] as const,
};

// Get all contact queries (admin only)
export const useContactQueries = (filters?: ContactQueriesFilters) => {
  return useQuery({
    queryKey: contactQueriesKeys.list(filters),
    queryFn: () => contactQueriesApi.getAll(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get single contact query by ID (admin only)
export const useContactQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: contactQueriesKeys.detail(id),
    queryFn: () => contactQueriesApi.getById(id),
    enabled: enabled && !!id,
  });
};

// Create contact query mutation (public)
export const useCreateContactQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: ContactQueryFormData) => contactQueriesApi.create(formData),
    onSuccess: (data) => {
      toast.success(data.message || 'Your query has been submitted successfully!');
      // Invalidate queries list for admin
      queryClient.invalidateQueries({ queryKey: contactQueriesKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit query. Please try again.';
      toast.error(message);
    },
  });
};

// Update contact query mutation (admin only)
export const useUpdateContactQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: { status?: string; adminNotes?: string } }) =>
      contactQueriesApi.update(id, updateData),
    onSuccess: (data, variables) => {
      toast.success('Query updated successfully');
      // Invalidate queries list and detail
      queryClient.invalidateQueries({ queryKey: contactQueriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactQueriesKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update query';
      toast.error(message);
    },
  });
};

// Delete contact query mutation (admin only)
export const useDeleteContactQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactQueriesApi.delete(id),
    onSuccess: () => {
      toast.success('Query deleted successfully');
      // Invalidate queries list
      queryClient.invalidateQueries({ queryKey: contactQueriesKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete query';
      toast.error(message);
    },
  });
};
