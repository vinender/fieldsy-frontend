import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface PublicSettings {
  cancellationWindowHours: number;
  maxBookingsPerUser: number;
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  maintenanceMode: boolean;
}

// Fetch public settings (no auth required)
export const usePublicSettings = () => {
  return useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/public`
      );
      return response.data.data as PublicSettings;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Helper hook to get cancellation window hours
export const useCancellationWindow = () => {
  const { data: settings } = usePublicSettings();
  return settings?.cancellationWindowHours || 24; // Default to 24 hours if not loaded
};