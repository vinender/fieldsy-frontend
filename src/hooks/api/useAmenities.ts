import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  isActive: boolean;
  order: number;
}

// Get all active amenities (for field creation form)
export const useAmenities = () => {
  return useQuery<Amenity[], Error>({
    queryKey: ['amenities'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/amenities?activeOnly=true`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
