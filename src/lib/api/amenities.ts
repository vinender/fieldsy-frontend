import axios from 'axios';

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


// Get backend URL from environment or use default
const getBackendUrl = () => {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (env) {
    return env.endsWith('/api') ? env : `${env}/api`;
  }
  return 'http://localhost:5000/api';
};

export const amenitiesApi = {
  // Get all active amenities
  getActiveAmenities: async (): Promise<AmenitiesResponse> => {
    const url = `${getBackendUrl()}/amenities`;
    try {
      console.log('🌐 amenitiesApi: Making GET request to:', url, 'with activeOnly=true');
      const response = await axios.get<AmenitiesResponse>(url, {
        params: { activeOnly: true }
      });
      console.log('📡 amenitiesApi: Raw axios response:', response);
      console.log('📦 amenitiesApi: Extracted data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ amenitiesApi: Error fetching active amenities from:', url);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  },

  // Get all amenities (including inactive)
  getAllAmenities: async (): Promise<AmenitiesResponse> => {
    const url = `${getBackendUrl()}/amenities`;
    try {
      console.log('🌐 amenitiesApi: Making GET request to:', url);
      const response = await axios.get<AmenitiesResponse>(url);
      console.log('📡 amenitiesApi: Raw axios response:', response);
      console.log('📦 amenitiesApi: Extracted data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ amenitiesApi: Error fetching all amenities from:', url);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  },
};
