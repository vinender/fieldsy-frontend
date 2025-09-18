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
  const query = useQuery({
    queryKey: platformSettingsKeys.public(),
    queryFn: async () => {
      const response = await axiosClient.get('/settings/public');
      return response.data as PlatformSettingsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - settings don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });

  // Extract platform-related settings with defaults
  const platformSettings: PlatformSettings = {
    platformTitle: query.data?.data?.platformTitle || "One Platform, Two Tail-Wagging Experiences",
    platformDogOwnersImage: query.data?.data?.platformDogOwnersImage || "/platform-section/img1.png",
    platformDogOwnersSubtitle: query.data?.data?.platformDogOwnersSubtitle || "For Dog Owners:",
    platformDogOwnersTitle: query.data?.data?.platformDogOwnersTitle || "Find & Book Private Dog Walking Fields in Seconds",
    platformDogOwnersBullets: query.data?.data?.platformDogOwnersBullets || [
      "Stress-free walks for reactive or energetic dogs",
      "Fully fenced, secure spaces",
      "GPS-powered search",
      "Instant hourly bookings"
    ],
    platformFieldOwnersImage: query.data?.data?.platformFieldOwnersImage || "/platform-section/img2.png",
    platformFieldOwnersSubtitle: query.data?.data?.platformFieldOwnersSubtitle || "For Field Owners:",
    platformFieldOwnersTitle: query.data?.data?.platformFieldOwnersTitle || "Turn Your Land into a Dog's Dream & Earn",
    platformFieldOwnersBullets: query.data?.data?.platformFieldOwnersBullets || [
      "Earn passive income while helping pets",
      "Host dog owners with full control",
      "Set your availability and pricing",
      "List your field for free"
    ],
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