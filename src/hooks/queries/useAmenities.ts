import { useQuery } from '@tanstack/react-query';
import { amenitiesApi, type Amenity } from '@/lib/api/amenities';

export const useAmenities = (activeOnly = true) => {
  return useQuery({
    queryKey: ['amenities', activeOnly],
    queryFn: async () => {
      try {
        console.log('🔍 useAmenities: Fetching amenities, activeOnly:', activeOnly);
        const response = await (activeOnly ? amenitiesApi.getActiveAmenities() : amenitiesApi.getAllAmenities());
        console.log('✅ useAmenities: API response:', response);
        return response;
      } catch (error) {
        console.error('❌ useAmenities: Error fetching amenities:', error);
        throw error;
      }
    },
    select: (data) => {
      console.log('🎯 useAmenities: Selecting data.data from:', data);
      const amenities = data.data;
      console.log('📦 useAmenities: Extracted amenities array:', amenities);
      return amenities;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - amenities don't change often
    gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime in React Query v5)
    retry: false, // Don't retry on error for debugging
  });
};

export type { Amenity };
