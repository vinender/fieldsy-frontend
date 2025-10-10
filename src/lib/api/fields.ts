import axiosClient from './axios-client';

export interface NearbyFieldsParams {
  lat: number;
  lng: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface NearbyFieldsResponse {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Fetch nearby fields based on latitude and longitude
 * @param params - Location and pagination parameters
 * @returns Promise with nearby fields and pagination
 */
export async function getNearbyFields(params: NearbyFieldsParams): Promise<NearbyFieldsResponse> {
  const { lat, lng, radius = 10, page = 1, limit = 12 } = params;

  const queryParams = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    page: String(page),
    limit: String(limit),
  });

  const response = await axiosClient.get(`/fields/nearby?${queryParams.toString()}`);
  return response.data;
}
