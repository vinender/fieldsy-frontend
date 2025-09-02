import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosClient from '@/lib/api/axios-client';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  bio?: string;
  image?: string;
  role: string;
  provider?: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  image?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Fetch user profile
export function useProfile() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const response = await axiosClient.get(`/users/${session.user.id}`);
      return response.data.data as UserProfile;
    },
    enabled: !!session?.user?.id,
  });
}

// Update user profile
export function useUpdateProfile() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateProfileData) => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const response = await axiosClient.patch(`/users/${session.user.id}`, updateData);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Also update auth context if needed
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          localStorage.setItem('currentUser', JSON.stringify({ ...user, ...data }));
        } catch (e) {
          console.error('Failed to update stored user:', e);
        }
      }
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(message);
    },
  });
}

// Change password
export function useChangePassword() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (passwordData: ChangePasswordData) => {
      const response = await axiosClient.post('/users/change-password', passwordData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to change password';
      toast.error(message);
    },
  });
}

// Delete profile image
export function useDeleteProfileImage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      // Update profile to remove image URL using axios
      const response = await axiosClient.patch(`/users/${session.user.id}`, { image: null });
      
      // Update local storage as well
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          delete user.image;
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch (e) {
          console.error('Failed to update stored user:', e);
        }
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile image deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete image';
      toast.error(message);
    },
  });
}

// Upload profile image
export function useUploadProfileImage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      // Upload to S3
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'profile-images');

      const uploadResponse = await fetch('/api/upload/direct', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to S3');
      }

      const { fileUrl } = await uploadResponse.json();

      // Update profile with new image URL using axios
      const response = await axiosClient.patch(`/users/${session.user.id}`, { image: fileUrl });
      
      // Update local storage as well
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          localStorage.setItem('currentUser', JSON.stringify({ ...user, image: fileUrl }));
        } catch (e) {
          console.error('Failed to update stored user image:', e);
        }
      }

      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Invalidate any other queries that might use user data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile image updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to upload image';
      toast.error(message);
    },
  });
}