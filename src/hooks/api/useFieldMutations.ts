import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';

// Types for field data
export interface FieldBasicInfo {
  name: string;
  location: string;
  size: string;
  price: number;
  description: string;
}

export interface FieldFeatures {
  facilities: string[];
  rules: string[];
  openingTime: string;
  closingTime: string;
}

export interface FieldImages {
  images: string[];
  mainImage?: string;
}

export interface FieldAvailability {
  availableDays: string[];
  specialDates?: {
    date: string;
    available: boolean;
    price?: number;
  }[];
}

export interface FieldData {
  id?: string;
  basicInfo?: FieldBasicInfo;
  features?: FieldFeatures;
  images?: FieldImages;
  availability?: FieldAvailability;
  status?: 'DRAFT' | 'PUBLISHED';
  createdAt?: string;
  updatedAt?: string;
}

// Query keys
export const fieldQueryKeys = {
  all: ['fields'] as const,
  lists: () => [...fieldQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...fieldQueryKeys.lists(), filters] as const,
  details: () => [...fieldQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...fieldQueryKeys.details(), id] as const,
  ownerField: () => ['owner-field'] as const,
};

// Hook to fetch owner's field
export function useGetOwnerField() {
  return useQuery({
    queryKey: fieldQueryKeys.ownerField(),
    queryFn: async () => {
      const response = await axiosClient.get('/fields/owner/field');
      return response.data.data as FieldData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Hook to save field basic info
export function useSaveFieldBasicInfo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { fieldId?: string; basicInfo: FieldBasicInfo }) => {
      const endpoint = data.fieldId 
        ? `/fields/${data.fieldId}/basic-info`
        : '/fields/basic-info';
      
      const method = data.fieldId ? 'patch' : 'post';
      const response = await axiosClient[method](endpoint, data.basicInfo);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerField() });
      toast.success('Basic information saved successfully');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save basic information');
      console.error('Error saving basic info:', error);
    },
  });
}

// Hook to save field features
export function useSaveFieldFeatures() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { fieldId: string; features: FieldFeatures }) => {
      const response = await axiosClient.patch(
        `/fields/${data.fieldId}/features`,
        data.features
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerField() });
      toast.success('Features saved successfully');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save features');
      console.error('Error saving features:', error);
    },
  });
}

// Hook to save field images
export function useSaveFieldImages() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { fieldId: string; images: FieldImages }) => {
      const response = await axiosClient.patch(
        `/fields/${data.fieldId}/images`,
        data.images
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerField() });
      toast.success('Images saved successfully');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save images');
      console.error('Error saving images:', error);
    },
  });
}

// Hook to save field availability
export function useSaveFieldAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { fieldId: string; availability: FieldAvailability }) => {
      const response = await axiosClient.patch(
        `/fields/${data.fieldId}/availability`,
        data.availability
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerField() });
      toast.success('Availability saved successfully');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save availability');
      console.error('Error saving availability:', error);
    },
  });
}

// Hook to publish field
export function usePublishField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fieldId: string) => {
      const response = await axiosClient.patch(`/fields/${fieldId}/publish`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerField() });
      toast.success('Field published successfully!');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish field');
      console.error('Error publishing field:', error);
    },
  });
}