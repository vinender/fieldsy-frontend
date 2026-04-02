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

  // Extract platform-related settings with defaults
  const platformSettings: PlatformSettings = {
    platformTitle: query.data?.data?.platformTitle || "One Platform, Two Tail-Wagging Experiences",
    platformDogOwnersImage: query.data?.data?.platformDogOwnersImage || "https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/platform-section/img1.webp",
    platformDogOwnersSubtitle: query.data?.data?.platformDogOwnersSubtitle || "For Dog Owners",
    platformDogOwnersTitle: query.data?.data?.platformDogOwnersTitle || "Find & Book Private Dog Walking Fields in Seconds",
    platformDogOwnersBullets: query.data?.data?.platformDogOwnersBullets || [
      "Stress-free walks for reactive or energetic dogs",
      "Fully fenced, secure spaces -- yours alone during your booking",
      "GPS-powered search to find fields near you",
      "Instant hourly bookings with no back-and-forth"
    ],
    platformFieldOwnersImage: query.data?.data?.platformFieldOwnersImage || "https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/platform-section/img2.webp",
    platformFieldOwnersSubtitle: query.data?.data?.platformFieldOwnersSubtitle || "For Field Owners",
    platformFieldOwnersTitle: query.data?.data?.platformFieldOwnersTitle || "Turn Your Land into a Dog's Favourite Place -- and Earn",
    platformFieldOwnersBullets: query.data?.data?.platformFieldOwnersBullets || [
      "Earn recurring income while helping dogs and their owners",
      "Host on your terms with full control over availability",
      "Set your own pricing -- adjust any time",
      "List your field for free, no upfront costs"
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