import { apiClient } from './client';

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactQueryFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactQueryResponse {
  success: boolean;
  message?: string;
  data: ContactQuery;
}

export interface ContactQueriesListResponse {
  success: boolean;
  data: ContactQuery[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: {
    all: number;
    new: number;
    'in-progress': number;
    resolved: number;
  };
}

export interface ContactQueriesFilters {
  page?: number;
  limit?: number;
  status?: 'all' | 'new' | 'in-progress' | 'resolved';
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const contactQueriesApi = {
  // Create a new contact query (public endpoint)
  create: async (formData: ContactQueryFormData): Promise<ContactQueryResponse> => {
    const { data } = await apiClient.post<ContactQueryResponse>('/contact-queries', formData);
    return data;
  },

  // Get all contact queries with filters (admin only)
  getAll: async (filters?: ContactQueriesFilters): Promise<ContactQueriesListResponse> => {
    const { data } = await apiClient.get<ContactQueriesListResponse>('/contact-queries', {
      params: filters,
    });
    return data;
  },

  // Get single contact query by ID (admin only)
  getById: async (id: string): Promise<ContactQueryResponse> => {
    const { data } = await apiClient.get<ContactQueryResponse>(`/contact-queries/${id}`);
    return data;
  },

  // Update contact query (admin only)
  update: async (id: string, updateData: { status?: string; adminNotes?: string }): Promise<ContactQueryResponse> => {
    const { data } = await apiClient.put<ContactQueryResponse>(`/contact-queries/${id}`, updateData);
    return data;
  },

  // Delete contact query (admin only)
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(`/contact-queries/${id}`);
    return data;
  },
};
