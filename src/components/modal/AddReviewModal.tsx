//add review modal
import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCreateReview } from '@/hooks/useReviews';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getUserImage, getUserInitials } from '@/utils/getUserImage';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldId: string;
  fieldName?: string;
  bookingId: string; // Now required
  onReviewAdded?: () => void;
}

export const AddReviewModal = ({
  isOpen,
  onClose,
  fieldId,
  fieldName = "Field",
  bookingId,
  onReviewAdded
}: AddReviewModalProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const createReviewMutation = useCreateReview(fieldId, bookingId);

  // User data from auth context
  const userData = {
    name: user?.name || session?.user?.name || 'User',
    avatar: getUserImage(user || session?.user),
    initials: getUserInitials(user || session?.user),
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review');
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        rating,
        title: reviewTitle.trim() || undefined,
        comment: reviewText.trim(),
        images,
        bookingId,
      });

      // Only reset and close on success
      setRating(0);
      setReviewText('');
      setReviewTitle('');
      setImages([]);

      // Call callback if provided
      if (onReviewAdded) {
        onReviewAdded();
      }

      onClose();

      // Redirect to fields page after successful review submission
      // Note: Toast notification is handled by NotificationContext via socket
      router.push('/fields');

    } catch (error: any) {
      // Error is handled by the mutation's onError callback
      // Just log it and keep the modal open
      console.error('Error submitting review:', error);
      // Don't close the modal or reset the form on error
    }
  };

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[32px] max-w-[800px] w-full relative overflow-visible animate-in fade-in zoom-in duration-300">
          {/* Close Button - Half inside, half outside */}
          <button
            onClick={onClose}
            className="absolute -right-4 -top-4 sm:-right-3 sm:-top-3 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215]" />
          </button>

          {/* Content */}
          <div className="p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-[29px] font-semibold text-[#192215] mb-2">
                Share Your Experiences
              </h2>
              <p className="text-[15px] text-[#8d8d8d] leading-[22px]">
                Leave a review to help other dog owners choose the perfect field and support trusted hosts.
              </p>
            </div>

            {/* User Info and Rating */}
            <div className="mb-8">
              <div className="flex items-center gap-[13px] mb-4">
                {userData.avatar ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={userData.avatar}
                      alt={userData.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center">
                    <span className="text-green font-semibold text-lg">
                      {userData.initials}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-[15px] font-semibold text-[#192215] capitalize">
                    {userData.name}
                  </h3>
                  <p className="text-[13px] text-[#6b6d6b]">
                    {userData.date}
                  </p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <button
                    key={starIndex}
                    onClick={() => handleStarClick(starIndex)}
                    className="transition-transform hover:scale-110"
                    type="button"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        starIndex <= rating
                          ? 'fill-none text-gray-300'
                          : 'fill-none text-gray-300'
                      }`}
                      style={{
                        fill: starIndex <= rating ? '#FFBD00' : 'none',
                        color: starIndex <= rating ? '#FFBD00' : undefined
                      }}
                    />
                  </button>
                ))}
              </div>
              
              {/* Rating Text */}
              {rating > 0 && (
                <p className="mt-2 text-[14px] text-[#3a6b22] font-medium">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Review Title (Optional) */}
            {/* <div className="mb-6">
              <label className="block text-[15px] font-medium text-[#192215] mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full p-4 bg-white border border-[#e3e3e3] rounded-[20px] text-[15px] text-[#192215] placeholder:text-[#8d8d8d] focus:outline-none focus:border-[#3a6b22] transition-colors"
                maxLength={100}
              />
            </div> */}

            {/* Review Text Area */}
            <div className="mb-8">
              <label className="block text-[15px] font-medium text-[#192215] mb-2">
                Write Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write about your experience...."
                className="w-full h-[122px] p-4 bg-white border border-[#e3e3e3] rounded-[20px] text-[15px] text-[#192215] placeholder:text-[#8d8d8d] leading-[24px] resize-none focus:outline-none focus:border-[#3a6b22] transition-colors"
                maxLength={1000}
              />
              <div className="flex justify-between mt-2">
                <p className="text-[13px] text-[#8d8d8d]">
                  {reviewText.length < 10 && reviewText.length > 0 
                    ? `Minimum 10 characters required` 
                    : ''}
                </p>
                <p className="text-[13px] text-[#8d8d8d]">
                  {reviewText.length}/1000
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleSubmit}
              disabled={createReviewMutation.isPending || rating === 0 || reviewText.trim().length < 10}
              className={`w-full h-14 rounded-full text-white text-[16px] font-semibold transition-all flex items-center justify-center gap-2 ${
                createReviewMutation.isPending || rating === 0 || reviewText.trim().length < 10
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#3a6b22] hover:bg-[#2d5319]'
              }`}
            >
              {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

 