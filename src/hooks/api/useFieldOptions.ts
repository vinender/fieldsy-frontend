import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';

// Types
export interface FieldOption {
  id: string;
  value: string;
  label: string;
  order: number;
}

export interface FieldOptionsResponse {
  success: boolean;
  data: {
    [category: string]: FieldOption[];
  };
}

export interface FieldOptionsByCategoryResponse {
  success: boolean;
  data: FieldOption[];
}

export interface CreateFieldOptionData {
  category: string;
  value: string;
  label: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateFieldOptionData {
  label?: string;
  isActive?: boolean;
  order?: number;
}

// Query Keys
export const fieldOptionsQueryKeys = {
  all: ['field-options'] as const,
  lists: () => [...fieldOptionsQueryKeys.all, 'list'] as const,
  list: (category?: string) => [...fieldOptionsQueryKeys.lists(), { category }] as const,
  category: (category: string) => [...fieldOptionsQueryKeys.all, 'category', category] as const,
  categories: () => [...fieldOptionsQueryKeys.all, 'categories'] as const,
  properties: () => [...fieldOptionsQueryKeys.all, 'field-properties'] as const,
  property: (propertyId: string) => [...fieldOptionsQueryKeys.all, 'field-property', propertyId] as const,
  admin: () => [...fieldOptionsQueryKeys.all, 'admin'] as const,
};

// Hook to get all field properties (grouped by category) - NEW CONSOLIDATED API
export function useFieldOptions(
  category?: string,
  options?: Omit<UseQueryOptions<FieldOptionsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldOptionsQueryKeys.list(category),
    queryFn: async () => {
      // Use new consolidated /field-properties endpoint
      const response = await axiosClient.get('/field-properties');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Hook to get field options by specific category/property
export function useFieldOptionsByCategory(
  category: string,
  options?: Omit<UseQueryOptions<FieldOptionsByCategoryResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldOptionsQueryKeys.category(category),
    queryFn: async () => {
      const response = await axiosClient.get(`/field-properties/${category}`);
      return response.data;
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Hook to get all field properties (consolidated API)
export function useFieldProperties(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldOptionsQueryKeys.properties(),
    queryFn: async () => {
      const response = await axiosClient.get('/field-properties');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook to get field options by property slug
export function useFieldOptionsByProperty(
  propertySlug: string,
  options?: Omit<UseQueryOptions<FieldOptionsByCategoryResponse & { fieldProperty: string }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldOptionsQueryKeys.property(propertySlug),
    queryFn: async () => {
      const response = await axiosClient.get(`/field-properties/${propertySlug}`);
      return response.data;
    },
    enabled: !!propertySlug,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Admin: Get all field properties (including inactive)
export function useFieldOptionsAdmin(
  category?: string,
  page = 1,
  limit = 50,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...fieldOptionsQueryKeys.admin(), { category, page, limit }],
    queryFn: async () => {
      const params: any = { page, limit };
      if (category) params.category = category;
      const response = await axiosClient.get('/field-properties/admin/all', { params });
      return response.data;
    },
    ...options,
  });
}

// Admin: Create field property
export function useCreateFieldOption(
  options?: Omit<UseMutationOptions<any, Error, CreateFieldOptionData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFieldOptionData) => {
      const response = await axiosClient.post('/field-properties/admin', data);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: fieldOptionsQueryKeys.all });
      toast.success(result.message || 'Field property created successfully');
      if (options?.onSuccess) {
        options.onSuccess(result, {} as any, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create field property');
      if (options?.onError) {
        options.onError(error, {} as any, {} as any);
      }
    },
    ...options,
  });
}

// Admin: Update field property
export function useUpdateFieldOption(
  options?: Omit<UseMutationOptions<any, Error, { id: string; data: UpdateFieldOptionData }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFieldOptionData }) => {
      const response = await axiosClient.put(`/field-properties/admin/${id}`, data);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: fieldOptionsQueryKeys.all });
      toast.success(result.message || 'Field property updated successfully');
      if (options?.onSuccess) {
        options.onSuccess(result, {} as any, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update field property');
      if (options?.onError) {
        options.onError(error, {} as any, {} as any);
      }
    },
    ...options,
  });
}

// Admin: Delete field property
export function useDeleteFieldOption(
  options?: Omit<UseMutationOptions<any, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(`/field-properties/admin/${id}`);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: fieldOptionsQueryKeys.all });
      toast.success(result.message || 'Field property deleted successfully');
      if (options?.onSuccess) {
        options.onSuccess(result, '' as any, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete field property');
      if (options?.onError) {
        options.onError(error, '' as any, {} as any);
      }
    },
    ...options,
  });
}

// Admin: Bulk update order
export function useUpdateFieldOptionsOrder(
  options?: Omit<UseMutationOptions<any, Error, Array<{ id: string; order: number }>>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; order: number }>) => {
      const response = await axiosClient.post('/field-properties/admin/bulk-order', { updates });
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: fieldOptionsQueryKeys.all });
      toast.success(result.message || 'Field properties order updated successfully');
      if (options?.onSuccess) {
        options.onSuccess(result, [] as any, {} as any);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update field properties order');
      if (options?.onError) {
        options.onError(error, [] as any, {} as any);
      }
    },
    ...options,
  });
}
