import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { reviewsAPI, CreateReviewData, UpdateReviewData } from '@/lib/api/reviews';

// Query keys
export const reviewKeys = {
  all: ['reviews'] as const,
  field: (fieldId: string) => [...reviewKeys.all, 'field', fieldId] as const,
  user: (userId?: string) => [...reviewKeys.all, 'user', userId] as const,
};

// Hook to get field reviews
export function useFieldReviews(
  fieldId: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
    rating?: number;
  }
) {
  return useQuery({
    queryKey: [...reviewKeys.field(fieldId), params],
    queryFn: () => reviewsAPI.getFieldReviews(fieldId, params),
    enabled: !!fieldId,
  });
}

// Hook to create a review
export function useCreateReview(fieldId: string, bookingId?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewData & { bookingId?: string }) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }
      // Include bookingId if provided
      const dataToSend = bookingId ? { ...reviewData, bookingId } : reviewData;
      return reviewsAPI.createReview(fieldId, dataToSend, session.accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.field(fieldId) });
      toast.success('Review created successfully!');
    },
    onError: (error: any) => {
      console.log('Review creation error:', error);
      
      // Get error details from axios error structure
      const apiMessage = error?.response?.data?.message || error?.message || '';
      const status = error?.response?.status;
      
      // Handle specific error cases
      if (status === 409 || apiMessage.toLowerCase().includes('already reviewed')) {
        toast.error('You have already reviewed this field. You can edit your existing review from the reviews section.');
      } else if (status === 401) {
        toast.error('Please login to submit a review.');
      } else if (status === 400) {
        if (apiMessage.toLowerCase().includes('rating')) {
          toast.error('Please select a rating.');
        } else if (apiMessage.toLowerCase().includes('comment')) {
          toast.error('Please write a comment for your review.');
        } else {
          toast.error(apiMessage || 'Invalid review data. Please check your input.');
        }
      } else if (status === 404) {
        toast.error('Field not found. Please refresh the page.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(apiMessage || 'Failed to create review. Please try again.');
      }
      
      // Prevent the error from bubbling up as unhandled
      return;
    },
  });
}

// Hook to update a review
export function useUpdateReview(fieldId: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      reviewData,
    }: {
      reviewId: string;
      reviewData: UpdateReviewData;
    }) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }
      return reviewsAPI.updateReview(reviewId, reviewData, session.accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.field(fieldId) });
      toast.success('Review updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update review';
      toast.error(message);
    },
  });
}

// Hook to delete a review
export function useDeleteReview(fieldId: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }
      return reviewsAPI.deleteReview(reviewId, session.accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.field(fieldId) });
      toast.success('Review deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete review';
      toast.error(message);
    },
  });
}

// Hook to mark review as helpful
export function useMarkHelpful() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, fieldId }: { reviewId: string; fieldId: string }) => {
      return reviewsAPI.markHelpful(reviewId, session?.accessToken);
    },
    onSuccess: (_, { fieldId }) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.field(fieldId) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to mark as helpful';
      toast.error(message);
    },
  });
}

// Hook to respond to a review (for field owners)
export function useRespondToReview(fieldId: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      response,
    }: {
      reviewId: string;
      response: string;
    }) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }
      return reviewsAPI.respondToReview(reviewId, response, session.accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.field(fieldId) });
      toast.success('Response added successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add response';
      toast.error(message);
    },
  });
}

// Hook to get user's reviews
export function useUserReviews(
  userId?: string,
  params?: {
    page?: number;
    limit?: number;
  }
) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: [...reviewKeys.user(userId), params],
    queryFn: () => reviewsAPI.getUserReviews(userId, params, session?.accessToken),
    enabled: !!session?.accessToken || !!userId,
  });
}