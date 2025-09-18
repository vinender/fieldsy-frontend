import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const aboutSettingsKeys = {
  all: ['aboutSettings'] as const,
  public: () => ['aboutSettings', 'public'] as const,
};

// Types
export interface AboutSettings {
  aboutTitle: string;
  aboutDogImage: string;
  aboutFamilyImage: string;
  aboutDogIcons: string[];
}

export interface PublicSettingsResponse {
  success: boolean;
  data: {
    cancellationWindowHours: number;
    maxBookingsPerUser: number;
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    maintenanceMode: boolean;
    bannerText: string;
    highlightedText: string;
    aboutTitle: string;
    aboutDogImage: string;
    aboutFamilyImage: string;
    aboutDogIcons: string[];
    platformDogOwnersImage?: string;
    platformFieldOwnersImage?: string;
    platformTitle?: string;
    platformDogOwnersSubtitle?: string;
    platformDogOwnersTitle?: string;
    platformDogOwnersBullets?: string[];
    platformFieldOwnersSubtitle?: string;
    platformFieldOwnersTitle?: string;
    platformFieldOwnersBullets?: string[];
  };
}

// Hook to fetch public about settings
export function usePublicAboutSettings() {
  const query = useQuery({
    queryKey: aboutSettingsKeys.public(),
    queryFn: async () => {
      const response = await axiosClient.get('/settings/public');
      return response.data as PublicSettingsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - settings don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });

  // Extract only about-related settings
  const aboutSettings: AboutSettings = {
    aboutTitle: query.data?.data?.aboutTitle || 'At Fieldsy, we believe every dog deserves the freedom to run, sniff, and play safely.',
    aboutDogImage: query.data?.data?.aboutDogImage || '',
    aboutFamilyImage: query.data?.data?.aboutFamilyImage || '',
    aboutDogIcons: query.data?.data?.aboutDogIcons || [],
  };

  return {
    settings: aboutSettings,
    loading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}

// Hook to get all public settings (including about settings)
export function usePublicSettings() {
  const query = useQuery({
    queryKey: aboutSettingsKeys.public(),
    queryFn: async () => {
      const response = await axiosClient.get('/settings/public');
      return response.data as PublicSettingsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    settings: query.data?.data,
    loading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}