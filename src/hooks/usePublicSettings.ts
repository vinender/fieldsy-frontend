import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface PublicSettings {
  defaultCommissionRate: number;
  cancellationWindowHours: number;
  maxAdvanceBookingDays: number;
  maxBookingsPerUser: number;
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  maintenanceMode: boolean;
  isLive: boolean;
  hasAccess: boolean;
  bannerText?: string;
  highlightedText?: string;
  heroBackgroundImage?: string;
  // How It Works Page
  howItWorksHeroTitle?: string;
  howItWorksHeroHeading?: string;
  howItWorksHeroDescription?: string;
  forDogOwnersSectionTitle?: string;
  forDogOwnersSteps?: Array<{
    icon?: string;
    title: string;
    description: string;
    order?: number;
  }>;
  landownersSectionTitle?: string;
  landownersSectionDescription?: string;
  landownersSectionImage?: string;
  landownersOptionCard1Title?: string;
  landownersOptionCard1Description?: string;
  landownersOptionCard2Title?: string;
  landownersOptionCard2Description?: string;
  // Home Page
  howItWorksTitle?: string;
  howItWorksSteps?: Array<{
    icon: string;
    title: string;
    description: string;
    image: string;
    thumbnail?: string;
    order: number;
  }>;
  // Why Choose Fieldsy Section (Features on homepage)
  whyChooseFieldsyFeatures?: Array<{
    title: string;
    description: string;
  }>;
}

// Fetch public settings (no auth required)
export const usePublicSettings = () => {
  return useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      // Read access token from cookie to send as header
      const tokenMatch = typeof document !== 'undefined'
        ? document.cookie.match(/(?:^|;\s*)fieldsy_access=([^;]*)/)
        : null;
      const accessToken = tokenMatch?.[1] || '';

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/public`,
        {
          headers: accessToken ? { 'x-access-token': accessToken } : {},
        }
      );
      return response.data.data as PublicSettings;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (reduced for faster updates when admin changes settings)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Helper hook to get cancellation window hours
export const useCancellationWindow = () => {
  const { data: settings } = usePublicSettings();
  return settings?.cancellationWindowHours || 24; // Default to 24 hours if not loaded
};

// Helper hook to get max advance booking days
export const useMaxAdvanceBookingDays = () => {
  const { data: settings } = usePublicSettings();
  return settings?.maxAdvanceBookingDays || 30; // Default to 30 days if not loaded
};

// Helper hook to get platform commission rate (as decimal, e.g., 20 -> 0.20)
export const usePlatformCommissionRate = () => {
  const { data: settings } = usePublicSettings();
  const commissionPercentage = settings?.defaultCommissionRate || 20; // Default to 20% if not loaded
  return commissionPercentage / 100; // Convert to decimal (e.g., 20 -> 0.20)
};