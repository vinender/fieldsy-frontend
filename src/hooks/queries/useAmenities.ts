import { useQuery } from '@tanstack/react-query';
import { amenitiesApi, type Amenity } from '@/lib/api/amenities';

export const useAmenities = (activeOnly = true) => {
  return useQuery({
    queryKey: ['amenities', activeOnly],
    queryFn: () => activeOnly ? amenitiesApi.getActiveAmenities() : amenitiesApi.getAllAmenities(),
    select: (data) => data.data, // Extract just the amenities array
    staleTime: 1000 * 60 * 5, // 5 minutes - amenities don't change often
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};

export type { Amenity };
