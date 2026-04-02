import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';

// Query keys
export const platformSettingsKeys = {
  all: ['platformSettings'] as const,
  public: () => ['platformSettings', 'public'] as const,
};

// Types
export interface PlatformSettings {
  platformTitle: string;
  platformDogOwnersImage: string;
  platformDogOwnersSubtitle: string;
  platformDogOwnersTitle: string;
  platformDogOwnersBullets: string[];
  platformFieldOwnersImage: string;
  platformFieldOwnersSubtitle: string;
  platformFieldOwnersTitle: string;
  platformFieldOwnersBullets: string[];
}

export interface PlatformSettingsResponse {
  success: boolean;
  data: {
    platformTitle?: string;
    platformDogOwnersImage?: string;
    platformDogOwnersSubtitle?: string;
    platformDogOwnersTitle?: string;
    platformDogOwnersBullets?: string[];
    platformFieldOwnersImage?: string;
    platformFieldOwnersSubtitle?: string;
    platformFieldOwnersTitle?: string;
    platformFieldOwnersBullets?: string[];
    [key: string]: any; // Allow other fields from public settings
  };
}

// Hook to fetch platform settings
export function usePlatformSettings() {
  // Use the same query key as usePublicSettings to avoid duplicate API calls
  const query = useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const response = await axiosClient.get('/settings/public');
      return response.data as PlatformSettingsResponse;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (reduced from 10 for faster updates)
    gcTime: 10 * 60 * 1000,   // 10 minutes (reduced from 30)
  });

  // Extract platform-related settings without any fallbacks - only use API data
  const platformSettings: PlatformSettings = {
    platformTitle: query.data?.data?.platformTitle || "",
    platformDogOwnersImage: query.data?.data?.platformDogOwnersImage || "",
    platformDogOwnersSubtitle: query.data?.data?.platformDogOwnersSubtitle || "",
    platformDogOwnersTitle: query.data?.data?.platformDogOwnersTitle || "",
    platformDogOwnersBullets: query.data?.data?.platformDogOwnersBullets || [],
    platformFieldOwnersImage: query.data?.data?.platformFieldOwnersImage || "",
    platformFieldOwnersSubtitle: query.data?.data?.platformFieldOwnersSubtitle || "",
    platformFieldOwnersTitle: query.data?.data?.platformFieldOwnersTitle || "",
    platformFieldOwnersBullets: query.data?.data?.platformFieldOwnersBullets || [],
  };

  return {
    settings: platformSettings,
    loading: query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    data: query.data,
  };
}