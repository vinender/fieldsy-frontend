import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
      const token = (session as any)?.accessToken;
      if (!token || !session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'}/users/${session.user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data.data as UserProfile;
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
      const token = (session as any)?.accessToken;
      if (!token || !session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'}/users/${session.user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

// Change password
export function useChangePassword() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (passwordData: ChangePasswordData) => {
      const token = (session as any)?.accessToken;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'}/users/change-password`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passwordData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
}

// Delete profile image
export function useDeleteProfileImage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = (session as any)?.accessToken;
      if (!token || !session?.user?.id) {
        throw new Error('Not authenticated');
      }

      // Update profile to remove image URL
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'}/users/${session.user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: null }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete profile image');
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile image deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete image');
    },
  });
}

// Upload profile image
export function useUploadProfileImage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const token = (session as any)?.accessToken;
      if (!token) {
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

      // Update profile with new image URL
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'}/users/${session?.user?.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: fileUrl }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile image');
      }

      return fileUrl;
    },
    onSuccess: (imageUrl) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile image updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
}