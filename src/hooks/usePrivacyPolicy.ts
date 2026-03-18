
import { useQuery } from '@tanstack/react-query';
import { getPrivacyPolicy, PrivacySection } from '@/lib/api/privacy-policy';

export const usePrivacyPolicy = () => {
    return useQuery({
        queryKey: ['privacy-policy'],
        queryFn: getPrivacyPolicy,
        staleTime: 5 * 60 * 1000,
    });
};
