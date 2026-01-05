import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import {
  getNearbyFields,
  NearbyFieldsParams,
  NearbyFieldsResponse,
  getPopularFields,
  PopularFieldsParams,
  PopularFieldsResponse
} from '@/lib/api/fields';

// Query keys
export const fieldQueryKeys = {
  all: ['fields'] as const,
  list: (params: any) => ['fields', 'list', params] as const,
  nearby: (params: NearbyFieldsParams) => ['fields', 'nearby', params] as const,
  popular: (params: PopularFieldsParams) => ['fields', 'popular', params] as const,
  ownerField: () => ['owner-field'] as const,
  ownerFields: () => ['owner-fields'] as const,
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
  customFieldSize?: string;
  terrainType: string;
  fenceType: string;
  fenceSize: string;
  surfaceType: string;
  price: number;
  pricePerDay: number;
  bookingDuration?: string;
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
  // Status fields
  isSubmitted: boolean;   // True when field form is submitted (not a draft)
  isActive: boolean;      // Field owner can enable/disable their field
  isApproved?: boolean;   // Admin approval status
  isClaimed?: boolean;    // Whether the field is claimed by owner
  entryCode?: string;
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

export interface OwnerFieldsResponse {
  success: boolean;
  data: FieldData[];
  total: number;
}

export interface FieldsParams {
  page?: number;
  limit?: number;
  search?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  minRating?: number;
  maxDistance?: number;
  date?: Date | string;
  startTime?: string;
  endTime?: string;
  numberOfDogs?: number;
  size?: string;
  customSize?: string;
  terrainType?: string;
  fenceType?: string;
  instantBooking?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Hook to fetch active fields with pagination and filters (public)
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

      const url = `/fields/active?${queryParams.toString()}`;
      console.log('Fetching fields with URL:', url);
      console.log('Params:', params);

      // Use /fields/active to get only active and submitted fields
      const response = await axiosClient.get(url);
      console.log('Fields API Response:', response.data);
      return response.data as FieldsResponse;
    },
    staleTime: 0, // Always consider data stale so refetch happens on focus
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: 'always', // Always refetch when user returns to the tab
    refetchOnReconnect: true, // Refetch when network reconnects
    ...options,
  });
}

// Hook to fetch owner's field (legacy - returns single field)
export function useOwnerField(options?: Omit<UseQueryOptions<OwnerFieldResponse, Error>, 'queryKey' | 'queryFn'>) {
  const query = useQuery({
    queryKey: fieldQueryKeys.ownerField(),
    queryFn: async () => {
      const response = await axiosClient.get('/fields/owner/field');
      return response.data as OwnerFieldResponse;
    },
    staleTime: 30 * 1000, // 30 seconds - prevent constant refetching
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
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

// Hook to fetch all owner's fields
export function useOwnerFields(options?: Omit<UseQueryOptions<OwnerFieldsResponse, Error>, 'queryKey' | 'queryFn'>) {
  const query = useQuery({
    queryKey: fieldQueryKeys.ownerFields(),
    queryFn: async () => {
      const response = await axiosClient.get('/fields/my-fields');
      return response.data as OwnerFieldsResponse;
    },
    staleTime: 30 * 1000, // 30 seconds - prevent constant refetching
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    ...options,
  });

  return {
    data: query.data?.data || [],
    total: query.data?.total || 0,
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
export function useFieldDetails(
  fieldId: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'> & { userLocation?: { lat: number; lng: number } | null }
) {
  const { userLocation, ...queryOptions } = options || {};

  const query = useQuery({
    queryKey: userLocation
      ? [...fieldQueryKeys.fieldDetails(fieldId), userLocation]
      : fieldQueryKeys.fieldDetails(fieldId),
    queryFn: async () => {
      // Build URL with lat/lng params if user location is available
      let url = `/fields/${fieldId}`;
      if (userLocation) {
        const params = new URLSearchParams({
          lat: String(userLocation.lat),
          lng: String(userLocation.lng)
        });
        url = `/fields/${fieldId}?${params.toString()}`;
      }

      const response = await axiosClient.get(url);
      return response.data;
    },
    enabled: !!fieldId,
    staleTime: 0, // Always consider data stale so refetch happens on focus
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: 'always', // Always refetch when user returns to the tab
    refetchOnReconnect: true, // Refetch when network reconnects
    ...queryOptions,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    isFetching: query.isFetching,
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

// Hook to fetch nearby fields based on location
export function useNearbyFields(
  params: NearbyFieldsParams | null,
  options?: Omit<UseQueryOptions<NearbyFieldsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: params ? fieldQueryKeys.nearby(params) : ['fields', 'nearby', 'disabled'],
    queryFn: () => getNearbyFields(params!),
    enabled: !!params && !!params.lat && !!params.lng,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Hook to fetch popular fields
export function usePopularFields(
  params: PopularFieldsParams = {},
  options?: Omit<UseQueryOptions<PopularFieldsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fieldQueryKeys.popular(params),
    queryFn: () => getPopularFields(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// Price range query
export interface PriceRangeResponse {
  success: boolean;
  status: string;
  data: {
    minPrice: number;
    maxPrice: number;
  };
}

export function usePriceRange(
  options?: Omit<UseQueryOptions<PriceRangeResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['fields', 'price-range'],
    queryFn: async () => {
      const { data } = await axiosClient.get<PriceRangeResponse>('/fields/price-range');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - prices don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}