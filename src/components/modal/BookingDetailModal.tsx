import React, { useState } from 'react';
import {
  X,
  MapPin,
  Star,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/router';
import { AddReviewModal } from './AddReviewModal';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { getUserImage, getUserInitials } from '@/utils/getUserImage';
import { useBookingDetails } from '@/hooks/queries/useBookingQueries';
import { deslugify, formatDateDDMMYYYY } from '@/utils/formatters';
import { useCancellationWindow } from '@/hooks/usePublicSettings';
import { getAmenityIcon, getAmenityLabel } from '@/config/amenities.config';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onReview?: () => void;
  onReviewAdded?: () => void;
  onCancel?: (booking: any) => void;
  onReschedule?: (booking: any) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  onReview,
  onReviewAdded,
  onCancel,
  onReschedule
}) => {
  const router = useRouter();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const cancellationWindowHours = useCancellationWindow();
  
  // Fetch detailed booking data
  const { data: bookingDetails, isLoading } = useBookingDetails(
    booking?._id || booking?.id,
    { enabled: isOpen && !!(booking?._id || booking?.id) }
  );


  // Use fetched data if available, otherwise fall back to passed booking
  // API returns { success: true, data: {...booking...} }
  const fullBooking = bookingDetails?.data || booking;
  console.log('fullBooking from API:', fullBooking);
  // Calculate if booking can be cancelled (using dynamic cancellation window from settings)
  const canCancelBooking = () => {
    if (!fullBooking || fullBooking.status !== 'CONFIRMED') return false;
    
    const now = new Date();
    const bookingDateTime = new Date(fullBooking.date);
    
    // Parse the start time and add it to the booking date
    if (fullBooking.startTime) {
      const timeMatch = fullBooking.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        bookingDateTime.setHours(hours, minutes, 0, 0);
      }
    }
    
    // Calculate hours until booking
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilBooking >= cancellationWindowHours;
  };
  
  const getTimeUntilBooking = () => {
    if (!fullBooking) return 0;
    
    const now = new Date();
    const bookingDateTime = new Date(fullBooking.date);
    
    if (fullBooking.startTime) {
      const timeMatch = fullBooking.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        bookingDateTime.setHours(hours, minutes, 0, 0);
      }
    }
    
    const hoursUntilBooking = Math.floor((bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));
    return hoursUntilBooking;
  };
  
  const isCancellable = canCancelBooking();

  // Format date helper (removed - using utility function)

  // Format time slot
  const formatTimeSlot = () => {
    if (fullBooking?.timeSlot) return fullBooking.timeSlot;
    if (fullBooking?.startTime && fullBooking?.endTime) {
      return `${fullBooking.startTime} - ${fullBooking.endTime}`;
    }
    return '';
  };

  // Format amenities - directly map over the amenities array
  const formatAmenities = () => {
    const field = fullBooking?.field;

    console.log('formatAmenities - field:', field);
    console.log('formatAmenities - amenities:', field?.amenities);

    // Return empty array if no field or amenities
    if (!field?.amenities || !Array.isArray(field.amenities) || field.amenities.length === 0) {
      console.log('formatAmenities - returning empty array');
      return [];
    }

    // If amenities have iconUrl and label (from database), use them directly
    const firstAmenity = field.amenities[0];
    console.log('formatAmenities - firstAmenity:', firstAmenity);

    if (typeof firstAmenity === 'object' && firstAmenity !== null && 'iconUrl' in firstAmenity && 'label' in firstAmenity) {
      console.log('formatAmenities - using database format with iconUrl');
      const formatted = field.amenities
        .filter((amenity: any) => amenity.label && amenity.iconUrl)
        .map((amenity: any) => ({
          iconPath: amenity.iconUrl,
          label: amenity.label
        }))
        .slice(0, 4);
      console.log('formatAmenities - formatted:', formatted);
      return formatted;
    }

    // Legacy fallback: if amenities are strings, use config
    console.log('formatAmenities - using legacy format');
    return field.amenities
      .slice(0, 4)
      .map((amenity: any) => ({
        iconPath: getAmenityIcon(amenity),
        label: getAmenityLabel(amenity)
      }));
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      COMPLETED: 'bg-green/20 text-green font-[700] text-[14px] border-green',
      CANCELLED: 'bg-blood-red-100 text-blood-red border-blood-red',
      REFUNDED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
      PENDING: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    
    return (
      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full border ${statusStyles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
  };

  if (!isOpen) return null;

  // Calculate price
  const price = fullBooking?.totalPrice || fullBooking?.price || 0;
  const field = fullBooking?.field || {};
  const owner = field?.owner || fullBooking?.owner || {};

  console.log(';;amenites',field)

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-[32px] max-w-[800px] w-full max-h-[90vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in duration-300">
          {/* Close Button - Fixed Position */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8 lg:top-8 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-[#19221519] hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215]" />
          </button>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto scrollbar-hide flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3a6b22]"></div>
              </div>
            ) : (
              <>
                {/* Status Badge - Scrollable */}
                <div className="flex justify-end mb-2 sm:mb-3 pr-10 sm:pr-12">
                  {fullBooking?.status && (
                    <div>{getStatusBadge(fullBooking.status)}</div>
                  )}
                </div>

                {/* Header */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-xl sm:text-2xl lg:text-[29px] font-semibold text-[#192215]">
                      {field?.name || 'Field'}
                    </h2>
                    <span className="text-sm sm:text-[16px] font-semibold text-[#192215]">
                      • {field?.bookingDuration === '30min' ? '30min' : '1hr'}
                    </span>
                    <span className="text-sm sm:text-[16px] font-semibold text-[#3a6b22]">
                      • £{price}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1">
                      <MapPin className="w-[16px] sm:w-[18px] fill-black text-black h-[16px] sm:h-[18px]" />

                        <span className="text-xs sm:text-[16px] text-[#192215]">
                          {field?.city && field?.postalCode ? `${field.city} ${field.postalCode}` : field?.address || 'Location'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                      <img src="/bookings/availability.svg" className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" />

                        <span className="text-xs sm:text-[14px] text-[#8d8d8d]">
                          {fullBooking?.rawDate ? formatDateDDMMYYYY(new Date(fullBooking.rawDate)) : fullBooking?.date ? formatDateDDMMYYYY(new Date(fullBooking.date)) : ''}
                        </span>
                      </div>
                    </div>
                    
                    {field?.averageRating > 0 ? (
                      <div className="flex items-center gap-1 bg-[#192215] px-1.5 py-1 rounded w-fit">
                        <img src='/star.svg' className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-yellow fill-yellow" />
                        <span className="text-xs sm:text-[14px] font-semibold text-white">
                          {field.averageRating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-gray-200 px-1.5 py-1 rounded w-fit">
                        <img src='/star.svg' className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400" />
                        <span className="text-xs sm:text-[14px] font-semibold text-gray-600">No ratings</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                {formatAmenities().length > 0 && (
                  <div className="grid grid-cols-2 sm:flex gap-1.5 mb-4 sm:mb-6">
                    {formatAmenities().map((amenity: any, index: number) => {
                      return (
                        <div key={index} className="flex-1 bg-white border border-black/6 rounded-lg sm:rounded-[14px] px-2 py-1.5 sm:px-3.5 sm:py-2 flex items-center justify-center gap-1 sm:gap-2">
                          <img
                            src={amenity.iconPath}
                            alt={amenity.label}
                            className="w-4 h-4 sm:w-5 sm:h-5  object-contain"
                            onError={(e) => {
                              // Fallback to default icon if S3 image fails to load
                              e.currentTarget.src = '/field-details/shield.svg';
                            }}
                          />
                          <span className="text-[11px] sm:text-[14px] font-medium text-[#192215] truncate">
                            {amenity.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Owner Information */}
                {owner && owner.id && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-sm sm:text-[18px] font-bold text-[#192215] mb-2 sm:mb-2.5">
                      Owner Information
                    </h3>
                    <div className="bg-[#f8f1d7] rounded-lg p-2.5 sm:p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img 
                          src={getUserImage(owner)} 
                          alt={owner?.name || 'Owner'}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${getUserInitials(owner)}&background=3A6B22&color=fff&size=200`;
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm sm:text-[16px] font-medium text-[#090f1f]">
                              {owner?.name || 'Field Owner'}
                            </span>
                            {owner?.emailVerified && (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#3a6b22] " />
                            )}
                          </div>
                          <span className="text-xs sm:text-[14px] text-[#545662b3]">
                            Joined on {owner?.createdAt ? formatDateDDMMYYYY(new Date(owner.createdAt)) : formatDateDDMMYYYY(new Date())}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          onClose();
                          router.push(`/user/messages?userId=${owner?.id}`);
                        }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 bg-white border border-[#8fb36666] rounded-[10px] hover:bg-gray-50 transition-colors"
                      >
                        <img src='/msg.svg' className="w-5 h-5 text-[#192215]" />
                        <span className="text-[12px] font-semibold text-[#192215]">Send a Message</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Images Gallery */}
                {field?.images && field.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div
                      className="col-span-2 row-span-2 cursor-pointer"
                      onClick={() => {
                        setLightboxIndex(0);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={field.images[0]}
                        alt="Field view 1"
                        className="w-full h-[120px] sm:h-[180px] lg:h-[248px] rounded-[10px] object-cover hover:opacity-90 transition-opacity"
                      />
                    </div>
                    {field.images.slice(1, 5).map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative cursor-pointer"
                      onClick={() => {
                        setLightboxIndex(index + 1);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={image}
                        alt={`Field view ${index + 2}`}
                        className="w-full h-[58px] sm:h-[86px] lg:h-[118px] rounded-[10px] object-cover hover:opacity-90 transition-opacity"
                      />
                      {index === 3 && field?.images?.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 rounded-[10px] flex items-center justify-center hover:bg-black/50 transition-colors">
                          <span className="text-white text-xs sm:text-[16px] font-bold">
                            +{field?.images?.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                    ))}
                  </div>
                )}

                {/* Field Specifications */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-sm sm:text-[18px] font-bold text-[#192215] mb-2 sm:mb-2.5">
                    Field Specifications
                  </h3>
                  <div className="bg-white border border-black/6 rounded-lg sm:rounded-[14px] p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Field Size */}
                      {field?.size && (
                        <div className="flex items-center justify-between py-2 sm:py-3 ">
                          <span className="text-xs sm:text-[16px] text-[#192215] opacity-70">Field Size</span>
                          <span className="text-xs sm:text-[16px] font-medium text-[#192215]">
                            {field.size} acres
                          </span>
                        </div>
                      )}
                      
                      {/* Fence type & size */}
                      {(field?.fenceType || field?.fencing) && (
                        <div className="flex items-center justify-between py-2 sm:py-3 ">
                          <span className="text-xs sm:text-[16px] text-[#192215] opacity-70">Fence type & size</span>
                          <span className="text-xs sm:text-[16px] font-medium text-[#192215]">
                            {deslugify(field.fenceType || field.fencing)}
                            {field.fenceSize ? `, ${field.fenceSize}` : ''}
                          </span>
                        </div>
                      )}
                      
                      {/* Terrain Type */}
                      {field?.terrainType && (
                        <div className="flex items-center justify-between py-2 sm:py-3 ">
                          <span className="text-xs sm:text-[16px] text-[#192215] opacity-70">Terrain Type</span>
                          <span className="text-xs sm:text-[16px] font-medium text-[#192215]">
                            {deslugify(field.terrainType)}
                          </span>
                        </div>
                      )}
                      
                      {/* Surface Type */}
                      {field?.surfaceType && (
                        <div className="flex items-center justify-between py-2 sm:py-3 ">
                          <span className="text-xs sm:text-[16px] text-[#192215] opacity-70">Surface type</span>
                          <span className="text-xs sm:text-[16px] font-medium text-[#192215]">
                            {deslugify(field.surfaceType)}
                          </span>
                        </div>
                      )}
                      
                      {/* Number of Dogs */}
                      <div className="flex items-center justify-between py-2 sm:py-3 ">
                        <span className="text-xs sm:text-[16px] text-[#192215] opacity-70">Number of Dogs</span>
                        <span className="text-xs sm:text-[16px] font-medium text-[#192215]">
                          {fullBooking?.numberOfDogs || 1} {fullBooking?.numberOfDogs === 1 ? 'Dog' : 'Dogs'}
                        </span>
                      </div>
                      
                      {/* Booking Slot */}
                      <div className="flex items-center justify-between py-2 sm:py-3 ">
                        <span className="text-xs sm:text-[16px] text-[#192215] opacity-70">Booking Slot</span>
                        <span className="text-xs sm:text-[16px] font-medium text-[#192215]">
                          {formatTimeSlot()}
                        </span>
                      </div>
                      
                      {/* Recurring */}
                      {fullBooking?.repeatBooking && fullBooking.repeatBooking !== null && (
                        <div className="flex items-center justify-between py-2 sm:py-3">
                          <span className="text-xs sm:text-[16px] text-[#192215] opacity-70">Recurring</span>
                          <div className="bg-[#f4ffef] border border-[#3a6b221a] rounded-full px-3 py-1 sm:px-4 sm:py-1.5">
                            <span className="text-[11px] sm:text-[13px] font-bold text-[#3a6b22] capitalize">
                              {fullBooking.repeatBooking === 'weekly' ? 'Weekly' : 
                               fullBooking.repeatBooking === 'monthly' ? 'Monthly' : 
                               fullBooking.repeatBooking.charAt(0).toUpperCase() + fullBooking.repeatBooking.slice(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons based on booking status */}
                {fullBooking?.status === 'CONFIRMED' ? (
                  <div className="space-y-3">
                    {/* Reschedule and Cancel buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => {
                          if (isCancellable && onReschedule) {
                            onClose();
                            onReschedule(fullBooking);
                          }
                        }}
                        disabled={!isCancellable}
                        className={`w-full sm:flex-1 h-12 sm:h-14 rounded-full text-sm sm:text-[16px] font-semibold transition-colors ${
                          isCancellable
                            ? 'bg-[#e8f5ff] border-2 border-[#0066cc] text-[#0066cc] hover:bg-[#d4ecff] cursor-pointer'
                            : 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                        title={!isCancellable ? `Cannot reschedule within ${cancellationWindowHours} hours of booking (${getTimeUntilBooking()} hours remaining)` : 'Reschedule booking'}
                      >
                        Reschedule Booking
                      </button>
                      <button 
                        onClick={() => {
                          if (isCancellable && onCancel) {
                            onClose();
                            onCancel(fullBooking);
                          }
                        }}
                        disabled={!isCancellable}
                        className={`w-full sm:flex-1 h-12 sm:h-14 rounded-full text-sm sm:text-[16px] font-semibold transition-colors ${
                          isCancellable
                            ? 'bg-white border-2 border-blood-red text-blood-red hover:bg-blood-red-50 cursor-pointer'
                            : 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                        title={!isCancellable ? `Cannot cancel within ${cancellationWindowHours} hours of booking (${getTimeUntilBooking()} hours remaining)` : 'Cancel booking'}
                      >
                        Cancel Booking
                      </button>
                    </div>
                    
                    {/* Warning message if within cancellation window */}
                    {!isCancellable && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                        <p className="text-xs sm:text-sm text-yellow-800 text-center">
                          <Clock className="inline w-4 h-4 mr-1" />
                          Cancellation and rescheduling are not available within {cancellationWindowHours} hours of your booking.
                          <br />
                          <span className="font-semibold">{getTimeUntilBooking()} hours remaining until booking.</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : fullBooking?.status === 'COMPLETED' ? (
                  <button 
                    onClick={() => {
                      if (onReview) {
                        onReview();
                      } else {
                        setIsReviewModalOpen(true);
                      }
                    }}
                    className="w-full h-12 sm:h-14 bg-[#3a6b22] rounded-full text-white text-sm sm:text-[16px] font-semibold hover:bg-[#2d5319] transition-colors"
                  >
                    Write a Review
                  </button>
                ) : fullBooking?.status === 'CANCELLED' ? (
                  <button 
                    disabled
                    className="w-full h-12 sm:h-14 bg-gray-300 rounded-full text-gray-500 text-sm sm:text-[16px] font-semibold cursor-not-allowed opacity-60"
                  >
                    Booking Cancelled - Review Not Available
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full h-12 sm:h-14 bg-gray-300 rounded-full text-gray-500 text-sm sm:text-[16px] font-semibold cursor-not-allowed opacity-60"
                  >
                    Review Available After Completion
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Review Modal */}
      <AddReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        fieldId={fullBooking?.fieldId || field?.id || ''}
        fieldName={field?.name || 'Field'}
        bookingId={fullBooking?._id || fullBooking?.id}
        onReviewAdded={() => {
          if (onReviewAdded) {
            onReviewAdded();
          }
        }}
      />

      {/* Image Lightbox */}
      {field?.images && field.images.length > 0 && (
        <ImageLightbox
          images={field.images}
          open={lightboxOpen}
          initialIndex={lightboxIndex}
          onOpenChange={setLightboxOpen}
        />
      )}
    </>
  );
};