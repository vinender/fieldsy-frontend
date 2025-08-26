import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const fieldQueryKeys = {
  all: ['fields'] as const,
  list: (params: any) => ['fields', 'list', params] as const,
  ownerField: () => ['owner-field'] as const,
  ownerBookings: () => ['owner-bookings'] as const,
  fieldDetails: (id: string) => ['field', id] as const,
  searchFields: (filters: any) => ['fields', 'search', filters] as const,
};

// Types
export interface FieldData {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  size: string;
  terrainType: string;
  fenceType: string;
  fenceSize: string;
  surfaceType: string;
  pricePerHour: number;
  pricePerDay: number;
  amenities: string[];
  rules: string[];
  images: string[];
  maxDogs: number;
  openingTime: string;
  closingTime: string;
  operatingDays: string[];
  instantBooking: boolean;
  cancellationPolicy: string;
  fieldDetailsCompleted: boolean;
  uploadImagesCompleted: boolean;
  pricingAvailabilityCompleted: boolean;
  bookingRulesCompleted: boolean;
  isSubmitted: boolean;
  isActive: boolean;
  [key: string]: any;
}

export interface OwnerFieldResponse {
  success: boolean;
  field: FieldData | null;
  message?: string;
  showAddForm?: boolean;
}

export interface FieldsResponse {
  success: boolean;
  data: FieldData[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FieldsParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Hook to fetch fields with pagination and filters
export function useFields(
  params: FieldsParams = {},
  options?: Omit<UseQueryOptions<FieldsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldQueryKeys.list(params),
    queryFn: async () => {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add all params to query string
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            // For arrays, join with comma
            if (value.length > 0) {
              queryParams.append(key, value.join(','));
            }
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const response = await axiosClient.get(`/fields?${queryParams.toString()}`);
      return response.data as FieldsResponse;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Hook to fetch owner's field
export function useOwnerField(options?: Omit<UseQueryOptions<OwnerFieldResponse, Error>, 'queryKey' | 'queryFn'>) {
  const query = useQuery({
    queryKey: fieldQueryKeys.ownerField(),
    queryFn: async () => {
      const response = await axiosClient.get('/fields/owner/field');
      return response.data as OwnerFieldResponse;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
    ...options,
  });

  return {
    data: query.data?.field,
    showAddForm: query.data?.showAddForm || false,
    message: query.data?.message,
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

// Hook to fetch field owner's bookings
export function useFieldOwnerBookings(options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  const query = useQuery({
    queryKey: fieldQueryKeys.ownerBookings(),
    queryFn: async () => {
      const response = await axiosClient.get('/fields/owner/bookings');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}

// Hook to fetch a specific field by ID
export function useFieldDetails(fieldId: string, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  const query = useQuery({
    queryKey: fieldQueryKeys.fieldDetails(fieldId),
    queryFn: async () => {
      const response = await axiosClient.get(`/fields/${fieldId}`);
      return response.data;
    },
    enabled: !!fieldId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}

// Hook to search fields
export function useSearchFields(filters: any, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  const query = useQuery({
    queryKey: fieldQueryKeys.searchFields(filters),
    queryFn: async () => {
      const response = await axiosClient.get('/fields/search', { params: filters });
      return response.data;
    },
    enabled: !!filters,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  return {
    data: query.data?.fields || [],
    total: query.data?.total || 0,
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}