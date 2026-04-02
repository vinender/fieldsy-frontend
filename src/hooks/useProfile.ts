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
  googleImage?: string;
  profileImage?: string;
  avatar?: string;
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
  const { data: session, status: sessionStatus } = useSession();
  const isSessionLoading = sessionStatus === 'loading';
  const isEnabled = !!session?.user?.id;

  const query = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const response = await axiosClient.get(`/users/${session.user.id}`);
      return response.data.data as UserProfile;
    },
    enabled: isEnabled,
  });

  return {
    ...query,
    // isLoading should be true while session is loading OR while query is loading
    isLoading: isSessionLoading || query.isLoading,
    // Include session loading state for more granular control
    isSessionLoading,
    isEnabled,
  };
}

// Update user profile
export function useUpdateProfile() {
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateProfileData) => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const response = await axiosClient.patch(`/users/${session.user.id}`, updateData);
      return response.data.data;
    },
    onSuccess: async (data) => {
      // Invalidate both profile and auth queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      // Update the NextAuth session so it reflects the new name/data
      // This prevents the old Google name from flashing in the UI
      try {
        await updateSession({
          user: {
            ...session?.user,
            name: data.name || session?.user?.name,
          }
        });
      } catch (e) {
        console.error('Failed to update session:', e);
      }

      // Also update auth context if needed
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          // Merge data carefully - preserve existing image/googleImage if not explicitly set in response
          // This prevents accidentally clearing the uploaded image when updating other fields
          const updatedUser = { ...user };

          Object.keys(data).forEach(key => {
            // For image fields, only update if the new value is truthy
            // This prevents overwriting uploaded image with null when only updating name/bio/phone
            if (key === 'image' || key === 'googleImage') {
              if (data[key]) {
                updatedUser[key] = data[key];
              }
              // If data[key] is null/undefined, keep the existing value
            } else if (data[key] !== undefined) {
              updatedUser[key] = data[key];
            }
          });

          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          // Dispatch custom event to notify AuthContext in the same tab
          window.dispatchEvent(new Event('authTokenChanged'));
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
      const response = await axiosClient.patch('/users/change-password', passwordData);
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
          // Dispatch custom event to notify AuthContext in the same tab
          window.dispatchEvent(new Event('authTokenChanged'));
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

      // No need to reload - AuthContext will update via custom event
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
          // Dispatch custom event to notify AuthContext in the same tab
          window.dispatchEvent(new Event('authTokenChanged'));
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

      // Reload page to ensure all components show the new image
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Wait 1 second to show the toast message
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to upload image';
      toast.error(message);
    },
  });
}
