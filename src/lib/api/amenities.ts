import { apiClient } from './client';

export interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  isActive: boolean;
  order: number;
}

export interface AmenitiesResponse {
  success: boolean;
  message: string;
  data: Amenity[];
}

export const amenitiesApi = {
  // Get all active amenities
  getActiveAmenities: async (): Promise<AmenitiesResponse> => {
    const { data } = await apiClient.get<AmenitiesResponse>('/amenities', {
      params: { activeOnly: 'true' }
    });
    return data;
  },

  // Get all amenities (including inactive)
  getAllAmenities: async (): Promise<AmenitiesResponse> => {
    const { data } = await apiClient.get<AmenitiesResponse>('/amenities');
    return data;
  },
};
