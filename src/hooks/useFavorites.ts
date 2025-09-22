import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface FavoriteField {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  pricePerHour?: number;
  pricePerDay?: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  bookingCount: number;
  isFavorited: boolean;
  owner?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

// Toggle favorite (save/unsave)
export function useToggleFavorite(fieldId: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = (session as any)?.accessToken;
      if (!token) {
        throw new Error('Please login to save fields');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/favorites/toggle/${fieldId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update favorite');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['favorite-status', fieldId] });
      queryClient.invalidateQueries({ queryKey: ['saved-fields'] });
      queryClient.invalidateQueries({ queryKey: ['field', fieldId] });
      
      toast.success(data.isFavorited ? 'Field saved successfully' : 'Field removed from saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update favorite');
    },
  });
}

// Check if field is favorited
export function useFavoriteStatus(fieldId: string | undefined) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['favorite-status', fieldId],
    queryFn: async () => {
      if (!fieldId) return false;
      
      const token = (session as any)?.accessToken;
      if (!token) return false;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/favorites/check/${fieldId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.isFavorited;
    },
    enabled: !!session && !!fieldId,
  });
}

// Get user's saved fields
export function useSavedFields(page: number = 1, limit: number = 10) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['saved-fields', page, limit],
    queryFn: async () => {
      const token = (session as any)?.accessToken;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/favorites/my-saved-fields?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch saved fields');
      }

      const data = await response.json();
      return {
        fields: data.data as FavoriteField[],
        pagination: data.pagination
      };
    },
    enabled: !!session,
  });
}

// Remove from favorites
export function useRemoveFavorite() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      const token = (session as any)?.accessToken;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/favorites/${fieldId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove from favorites');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-fields'] });
      toast.success('Field removed from saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove from favorites');
    },
  });
}