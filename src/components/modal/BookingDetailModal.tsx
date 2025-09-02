import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Star,
  Shield,
  Droplets,
  Home,
  Trash2,
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import { AddReviewModal } from './AddReviewModal';
import { getUserImage, getUserInitials } from '@/utils/getUserImage';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onReview?: () => void;
  onReviewAdded?: () => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, booking, onReview, onReviewAdded }) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Default images if not provided
  const defaultImages = [
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1494947665470-20322015e3a8?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'
  ];

  // Merge booking data with defaults - use field's averageRating
  const bookingData = {
    name: booking?.name || 'Green Meadows Field',
    duration: booking?.duration || '30min',
    price: booking?.price || '$18',
    location: booking?.location || 'Kent TN25, UK • 3km away',
    date: booking?.date || '10 Jul, 2025',
    rating: booking?.field?.averageRating || booking?.averageRating || 0,
    images: booking?.images || (booking?.image ? [booking.image, ...defaultImages.slice(1)] : defaultImages),
    amenities: booking?.amenities || [
      { icon: Shield, label: 'Secure fencing' },
      { icon: Droplets, label: 'Water Access' },
      { icon: Home, label: 'Shelter' },
      { icon: Trash2, label: 'Waste Disposal' }
    ],
    owner: booking?.owner || {
      name: 'Alex Smith',
      avatar: 'https://i.pravatar.cc/150?img=12',
      joinDate: 'March 2025',
      verified: true
    },
    specifications: booking?.specifications || {
      'Field Size': booking?.features || '1.5 acres',
      'Fence type & size': '6 ft steel mesh, fully enclosed',
      'Terrain Type': 'Soft grass + walking path',
      'Surface type': 'Flat with gentle slopes',
      'Number of Dogs': booking?.dogs || '1 Dogs',
      'Booking Slot': booking?.time || 'Wednesday, 5:00 PM – 6:00 PM',
      'Recurring': booking?.recurring || 'Monthly on 10 Aug, 2025'
    },
    status: booking?.status || 'upcoming'
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      refunded: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusStyles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
        <div className="bg-white rounded-[32px] max-w-[800px] w-full max-h-[90vh] overflow-y-auto overflow-x-hidden relative animate-in fade-in zoom-in duration-300">
          {/* Close Button and Status Badge */}
          <div className="absolute right-8 top-8 z-10 flex items-center gap-3">
            {bookingData.status !== 'upcoming' && (
              <div>{getStatusBadge(bookingData.status)}</div>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#19221519] hover:bg-gray-50 transition-colors"
            >
              <X className="w-6 h-6 text-[#192215]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-10">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-[29px] font-semibold text-[#192215]">{bookingData?.name}</h2>
                <span className="text-[16px] font-semibold text-[#192215]">• {bookingData?.duration}</span>
                <span className="text-[16px] font-semibold text-[#3a6b22]">• {bookingData?.price}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-5 h-5 text-[#192215]" />
                    <span className="text-[16px] text-[#192215]">{bookingData?.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-[18px] h-[18px] text-[#8d8d8d]" />
                    <span className="text-[14px] text-[#8d8d8d]">{bookingData?.date}</span>
                  </div>
                </div>
                
                {bookingData?.rating > 0 ? (
                  <div className="flex items-center gap-1 bg-[#192215] px-1.5 py-1 rounded">
                    <Star className="w-[18px] h-[18px] text-yellow fill-yellow" />
                    <span className="text-[14px] font-semibold text-white">{bookingData?.rating.toFixed(1)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-gray-200 px-1.5 py-1 rounded">
                    <Star className="w-[18px] h-[18px] text-gray-400" />
                    <span className="text-[14px] font-semibold text-gray-600">No ratings</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="flex gap-1.5 mb-6">
              {bookingData?.amenities?.map((amenity: any, index: number) => {
                const Icon = amenity.icon;
                return (
                  <div key={index} className="flex-1 bg-white border border-black/6 rounded-[14px] px-3.5 py-2 flex items-center justify-center gap-2">
                    <Icon className="w-5 h-5 text-[#192215]" />
                    <span className="text-[14px] font-medium text-[#192215]">{amenity.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Owner Information */}
            <div className="mb-6">
              <h3 className="text-[18px] font-bold text-[#192215] mb-2.5">Owner Information</h3>
              <div className="bg-[#f8f1d7] rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={getUserImage(bookingData?.owner)} 
                    alt={bookingData?.owner?.name || 'Owner'}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${getUserInitials(bookingData?.owner)}&background=3A6B22&color=fff&size=200`;
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[16px] font-medium text-[#090f1f]">{bookingData?.owner?.name}</span>
                      {bookingData?.owner?.verified && (
                        <CheckCircle className="w-4 h-4 text-[#3a6b22] fill-[#3a6b22]" />
                      )}
                    </div>
                    <span className="text-[14px] text-[#545662b3]">Joined on {bookingData?.owner?.joinDate}</span>
                  </div>
                </div>
                
                <button className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-[#8fb36666] rounded-[10px] hover:bg-gray-50 transition-colors">
                  <img src='/msg.svg' className="w-5 h-5 text-[#192215]" />
                  <span className="text-[12px] font-semibold text-[#192215]">Send a Message</span>
                </button>
              </div>
            </div>

            {/* Images Gallery */}
            {bookingData?.images && bookingData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="col-span-2 row-span-2">
                  <img 
                    src={bookingData.images[0]} 
                    alt="Field view 1"
                    className="w-full h-[248px] rounded-[10px] object-cover"
                  />
                </div>
                {bookingData.images.slice(1, 5).map((image: string, index: number) => (
                <div key={index} className="relative">
                  <img 
                    src={image} 
                    alt={`Field view ${index + 2}`}
                    className="w-full h-[118px] rounded-[10px] object-cover"
                  />
                  {index === 3 && bookingData?.images?.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 rounded-[10px] flex items-center justify-center">
                      <span className="text-white text-[16px] font-bold">+{bookingData?.images?.length - 5} more</span>
                    </div>
                  )}
                </div>
                ))}
              </div>
            )}

            {/* Field Specifications */}
            <div className="mb-8">
              <h3 className="text-[18px] font-bold text-[#192215] mb-2.5">Field Specifications</h3>
              <div className="bg-white border border-black/6 rounded-[14px] p-4">
                {bookingData?.specifications && Object.entries(bookingData.specifications).map(([key, value]: [string, any], index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-[16px] text-[#192215] opacity-70">{key}</span>
                    {key === 'Recurring' ? (
                      <div className="bg-[#f4ffef] border border-[#3a6b221a] rounded-full px-4 py-1.5">
                        <span className="text-[13px] font-bold text-[#3a6b22]">{value}</span>
                      </div>
                    ) : (
                      <span className="text-[16px] font-medium text-[#192215]">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button based on booking status */}
            {bookingData.status === 'upcoming' ? (
              <button 
                onClick={() => {
                  // Handle cancel booking
                  console.log('Cancel booking');
                  alert('Booking cancellation initiated');
                }}
                className="w-full h-14 bg-[#3a6b22] rounded-full text-white text-[16px] font-semibold hover:bg-[#2d5319] transition-colors"
              >
                Cancel Booking
              </button>
            ) : bookingData.status === 'completed' ? (
              <button 
                onClick={() => {
                  // Handle write review
                  if (onReview) {
                    onReview();
                  } else {
                    setIsReviewModalOpen(true);
                  }
                }}
                className="w-full h-14 bg-[#3a6b22] rounded-full text-white text-[16px] font-semibold hover:bg-[#2d5319] transition-colors"
              >
                Write a Review
              </button>
            ) : bookingData.status === 'cancelled' ? (
              <button 
                disabled
                className="w-full h-14 bg-gray-300 rounded-full text-gray-500 text-[16px] font-semibold cursor-not-allowed opacity-60"
              >
                Booking Cancelled - Review Not Available
              </button>
            ) : (
              <button 
                disabled
                className="w-full h-14 bg-gray-300 rounded-full text-gray-500 text-[16px] font-semibold cursor-not-allowed opacity-60"
              >
                Review Available After Completion
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Review Modal */}
      <AddReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        fieldId={booking?.fieldId || ''}
        fieldName={bookingData.name}
        bookingId={booking?._id || booking?.id}
        onReviewAdded={() => {
          // Refresh data if needed
          if (onReviewAdded) {
            onReviewAdded();
          }
          // You can also show a success message here if needed
        }}
      />
    </>
  );
};

 