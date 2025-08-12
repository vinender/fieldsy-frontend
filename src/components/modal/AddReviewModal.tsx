import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

export const AddReviewModal = ({ isOpen, onClose, fieldName = "Green Meadows Field" }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User data (would come from auth context in real app)
  const userData = {
    name: 'David Wood',
    avatar: 'https://i.pravatar.cc/150?img=8',
    date: '30 Jun, 2025'
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      alert('Please write at least 10 characters in your review');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Review submitted:', {
        rating,
        reviewText,
        fieldName,
        user: userData.name,
        date: new Date().toISOString()
      });
      
      // Reset form
      setRating(0);
      setReviewText('');
      setIsSubmitting(false);
      onClose();
      
      // Show success message (in real app, use toast notification)
      alert('Thank you for your review!');
    }, 1000);
  };

  const handleStarClick = (starIndex) => {
    setRating(starIndex);
  };

  const handleStarHover = (starIndex) => {
    setHoveredRating(starIndex);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
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
        <div className="bg-white rounded-[32px] max-w-[800px] w-full relative animate-in fade-in zoom-in duration-300">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-8 top-8 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#19221519] hover:bg-gray-50 transition-colors"
          >
            <X className="w-6 h-6 text-[#192215]" />
          </button>

          {/* Content */}
          <div className="p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-[29px] font-semibold text-[#192215] mb-2">
                Share Your Experience
              </h2>
              <p className="text-[15px] text-[#8d8d8d] leading-[22px]">
                Leave a review to help other dog owners choose the perfect field and support trusted hosts.
              </p>
            </div>

            {/* User Info and Rating */}
            <div className="mb-8">
              <div className="flex items-center gap-[13px] mb-4">
                <img 
                  src={userData.avatar} 
                  alt={userData.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
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
                    onMouseEnter={() => handleStarHover(starIndex)}
                    onMouseLeave={handleStarLeave}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 transition-colors ${
                        starIndex <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 fill-none stroke-gray-300'
                      }`}
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

            {/* Review Text Area */}
            <div className="mb-8">
              <label className="block text-[15px] font-medium text-[#192215] mb-2">
                Write Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write about your experience...."
                className="w-full h-[122px] p-4 bg-white border border-[#e3e3e3] rounded-[20px] text-[15px] text-[#192215] placeholder:text-[#8d8d8d] leading-[24px] resize-none focus:outline-none focus:border-[#3a6b22] transition-colors"
                maxLength={500}
              />
              <div className="flex justify-between mt-2">
                <p className="text-[13px] text-[#8d8d8d]">
                  {reviewText.length < 10 && reviewText.length > 0 
                    ? `Minimum 10 characters required` 
                    : ''}
                </p>
                <p className="text-[13px] text-[#8d8d8d]">
                  {reviewText.length}/500
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0 || reviewText.trim().length < 10}
              className={`w-full h-14 rounded-full text-white text-[16px] font-semibold transition-all ${
                isSubmitting || rating === 0 || reviewText.trim().length < 10
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#3a6b22] hover:bg-[#2d5319]'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

 