import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star, ThumbsUp, Camera, X } from 'lucide-react';
import { 
  useFieldReviews, 
  useCreateReview, 
  useUpdateReview, 
  useDeleteReview,
  useMarkHelpful,
  useRespondToReview
} from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface FieldReviewsProps {
  fieldId: string;
  fieldOwnerId?: string;
}

export default function FieldReviews({ fieldId, fieldOwnerId }: FieldReviewsProps) {
  const { data: session } = useSession();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Hooks
  const { data: reviewsData, isLoading, error } = useFieldReviews(fieldId, {
    page,
    limit: 10,
    sortBy,
    rating: filterRating,
  });
  const createReviewMutation = useCreateReview(fieldId);
  const updateReviewMutation = useUpdateReview(fieldId);
  const deleteReviewMutation = useDeleteReview(fieldId);
  const markHelpfulMutation = useMarkHelpful();
  const respondToReviewMutation = useRespondToReview(fieldId);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] as string[],
  });

  // Response form state
  const [responseForm, setResponseForm] = useState({
    reviewId: '',
    response: '',
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await updateReviewMutation.mutateAsync({
          reviewId: editingReview,
          reviewData: reviewForm,
        });
        setEditingReview(null);
      } else {
        await createReviewMutation.mutateAsync(reviewForm);
      }
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '', images: [] });
    } catch (error) {
      // Error is already handled by the mutation's onError callback with toast
      // Just keep the form open so user can see the error message
      console.error('Review submission error:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await deleteReviewMutation.mutateAsync(reviewId);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    await markHelpfulMutation.mutateAsync({ reviewId, fieldId });
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    await respondToReviewMutation.mutateAsync({
      reviewId: responseForm.reviewId,
      response: responseForm.response,
    });
    setResponseForm({ reviewId: '', response: '' });
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={`${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading reviews...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Failed to load reviews</div>;
  }

  const { reviews, stats, pagination } = reviewsData?.data || { 
    reviews: [], 
    stats: { averageRating: 0, totalReviews: 0, ratingDistribution: {} },
    pagination: { page: 1, totalPages: 1, total: 0, limit: 10 }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Header and Stats */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Overall Rating */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <div className="flex justify-center my-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <div className="text-sm text-gray-600">{stats.totalReviews} reviews</div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = stats.totalReviews > 0 
                ? (count / stats.totalReviews) * 100 
                : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterRating(filterRating === rating ? undefined : rating)}
                    className={`flex items-center gap-1 min-w-[40px] ${
                      filterRating === rating ? 'text-blue-600' : ''
                    }`}
                  >
                    <span>{rating}</span>
                    <Star size={14} className="fill-current" />
                  </button>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 min-w-[40px] text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>
          </div>

          {session && (
            <Button onClick={() => setShowReviewForm(true)}>
              Write a Review
            </Button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                {review.user?.image ? (
                  <img
                    src={review.user.image}
                    alt={review.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.user?.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <div className="font-semibold">
                    {review.user?.name || 'Anonymous'}
                    {review.verified && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {renderStars(review.rating)}
                {session?.user?.id === review.userId && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingReview(review.id);
                        setReviewForm({
                          rating: review.rating,
                          title: review.title || '',
                          comment: review.comment,
                          images: review.images,
                        });
                        setShowReviewForm(true);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {review.title && (
              <h4 className="font-semibold mb-2">{review.title}</h4>
            )}
            
            <p className="text-gray-700 mb-3">{review.comment}</p>

            {review.images.length > 0 && (
              <div className="flex gap-2 mb-3">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            )}

            {/* Field Owner Response */}
            {review.response && (
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <div className="font-semibold text-sm mb-1">Response from owner</div>
                <p className="text-sm text-gray-700">{review.response}</p>
                {review.respondedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    {format(new Date(review.respondedAt), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => handleMarkHelpful(review.id)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <ThumbsUp size={16} />
                Helpful ({review.helpfulCount})
              </button>

              {session?.user?.id === fieldOwnerId && !review.response && (
                <button
                  onClick={() => setResponseForm({ reviewId: review.id, response: '' })}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Respond
                </button>
              )}
            </div>

            {/* Response Form */}
            {responseForm.reviewId === review.id && (
              <form onSubmit={handleSubmitResponse} className="mt-3">
                <textarea
                  value={responseForm.response}
                  onChange={(e) => setResponseForm({ ...responseForm, response: e.target.value })}
                  placeholder="Write your response..."
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  required
                />
                <div className="flex gap-2 mt-2">
                  <Button type="submit" size="sm">
                    Submit Response
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setResponseForm({ reviewId: '', response: '' })}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Review Form Dialog */}
      {showReviewForm && (
        <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </h3>
              
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  {renderStars(reviewForm.rating, true, (rating) => 
                    setReviewForm({ ...reviewForm, rating })
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Title (optional)</label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Summarize your experience"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    rows={5}
                    placeholder="Share your experience..."
                    required
                    minLength={10}
                    maxLength={1000}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingReview ? 'Update Review' : 'Submit Review'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReview(null);
                      setReviewForm({ rating: 5, title: '', comment: '', images: [] });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}