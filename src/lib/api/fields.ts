import axiosClient from './axios-client';

export interface NearbyFieldsParams {
  lat: number;
  lng: number;
  radius?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface PopularFieldsParams {
  page?: number;
  limit?: number;
}

export interface FieldsApiResponse {
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

export type NearbyFieldsResponse = FieldsApiResponse;
export type PopularFieldsResponse = FieldsApiResponse;

/**
 * Fetch nearby fields based on latitude and longitude
 * @param params - Location and pagination parameters
 * @returns Promise with nearby fields and pagination
 */
export async function getNearbyFields(params: NearbyFieldsParams): Promise<NearbyFieldsResponse> {
  const { lat, lng, radius = 10, page = 1, limit = 9, sortBy, sortOrder } = params;

  const queryParams = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    page: String(page),
    limit: String(limit),
  });

  // Add sort parameters if provided
  if (sortBy) {
    queryParams.append('sortBy', sortBy);
  }
  if (sortOrder) {
    queryParams.append('sortOrder', sortOrder);
  }

  const response = await axiosClient.get(`/fields/nearby?${queryParams.toString()}`);
  return response.data;
}

/**
 * Fetch popular fields sorted by rating and booking count
 * @param params - Pagination parameters
 * @returns Promise with popular fields and pagination
 */
export async function getPopularFields(params: PopularFieldsParams = {}): Promise<PopularFieldsResponse> {
  const { page = 1, limit = 9 } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await axiosClient.get(`/fields/popular?${queryParams.toString()}`);
  return response.data;
}
