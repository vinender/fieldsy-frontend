import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Review {
  id: string;
  fieldId: string;
  userId: string;
  userName?: string;
  userImage?: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  helpfulCount: number;
  verified: boolean;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
  field?: {
    id: string;
    name: string;
    images: string[];
    city: string;
    state: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: ReviewStats;
  };
}

export interface CreateReviewData {
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

class ReviewsAPI {
  // Get all reviews for a field
  async getFieldReviews(
    fieldId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
      rating?: number;
    }
  ): Promise<ReviewsResponse> {
    const { data } = await axios.get(`${API_URL}/reviews/field/${fieldId}`, {
      params,
    });
    return data;
  }

  // Create a new review
  async createReview(
    fieldId: string,
    reviewData: CreateReviewData,
    token: string
  ): Promise<{ success: boolean; data: Review }> {
    const { data } = await axios.post(
      `${API_URL}/reviews/field/${fieldId}`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  }

  // Update a review
  async updateReview(
    reviewId: string,
    reviewData: UpdateReviewData,
    token: string
  ): Promise<{ success: boolean; data: Review }> {
    const { data } = await axios.put(
      `${API_URL}/reviews/${reviewId}`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  }

  // Delete a review
  async deleteReview(
    reviewId: string,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const { data } = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  }

  // Mark review as helpful
  async markHelpful(
    reviewId: string,
    token?: string
  ): Promise<{ success: boolean; data: Review }> {
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
    const { data } = await axios.post(
      `${API_URL}/reviews/${reviewId}/helpful`,
      {},
      config
    );
    return data;
  }

  // Field owner response to review
  async respondToReview(
    reviewId: string,
    response: string,
    token: string
  ): Promise<{ success: boolean; data: Review }> {
    const { data } = await axios.post(
      `${API_URL}/reviews/${reviewId}/response`,
      { response },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  }

  // Get user's reviews
  async getUserReviews(
    userId?: string,
    params?: {
      page?: number;
      limit?: number;
    },
    token?: string
  ): Promise<{
    success: boolean;
    data: {
      reviews: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const url = userId
      ? `${API_URL}/reviews/user/${userId}`
      : `${API_URL}/reviews/user`;
    
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      : { params };

    const { data } = await axios.get(url, config);
    return data;
  }
}

export const reviewsAPI = new ReviewsAPI();