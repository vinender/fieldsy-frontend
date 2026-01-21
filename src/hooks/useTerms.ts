
import { useQuery } from '@tanstack/react-query';
import { getTerms, Term } from '@/lib/api/terms';

export const useTerms = () => {
    return useQuery({
        queryKey: ['terms'],
        queryFn: getTerms,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
