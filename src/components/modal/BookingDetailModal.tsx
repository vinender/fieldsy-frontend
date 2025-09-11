import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Star,
  Shield,
  Droplets,
  Home,
  Trash2,
  CheckCircle,
  Clock,
  Trees,
  Fence,
  Dog
} from 'lucide-react';
import { AddReviewModal } from './AddReviewModal';
import { getUserImage, getUserInitials } from '@/utils/getUserImage';
import { useBookingDetails } from '@/hooks/queries/useBookingQueries';
import { deslugify } from '@/utils/formatters';

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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Fetch detailed booking data
  const { data: bookingDetails, isLoading } = useBookingDetails(
    booking?._id || booking?.id, 
    { enabled: isOpen && !!(booking?._id || booking?.id) }
  );
  
  // Use fetched data if available, otherwise fall back to passed booking
  const fullBooking = bookingDetails?.data || bookingDetails?.booking || booking;
  console.log('fullBooking', bookingDetails);
  // Calculate if booking can be cancelled (24 hours before booking time)
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
    
    return hoursUntilBooking >= 24;
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

  // Format date
  const formatDate = (date: any) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format time slot
  const formatTimeSlot = () => {
    if (fullBooking?.timeSlot) return fullBooking.timeSlot;
    if (fullBooking?.startTime && fullBooking?.endTime) {
      return `${fullBooking.startTime} - ${fullBooking.endTime}`;
    }
    return '';
  };

  // Get amenities icons
  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'Secure fencing': Shield,
      'Fencing': Fence,
      'Water': Droplets,
      'Water Access': Droplets,
      'Shelter': Home,
      'Waste Disposal': Trash2,
      'Agility Equipment': Dog,
      'Trees': Trees,
      'Parking': Home
    };
    return iconMap[amenity] || Shield;
  };

  // Format amenities
  const formatAmenities = () => {
    const field = fullBooking?.field;
    if (!field) return [];
    
    const amenities = [];
    if (field.amenities) {
      // If amenities is a string, split it
      const amenityList = typeof field.amenities === 'string' 
        ? field.amenities.split(',').map((a: string) => a.trim())
        : field.amenities;
      
      amenityList.forEach((amenity: string) => {
        amenities.push({
          icon: getAmenityIcon(amenity),
          label: amenity
        });
      });
    }
    
    // Add basic amenities if not already present
    if (field.fencing && !amenities.some(a => a.label.includes('fencing'))) {
      amenities.push({ icon: Shield, label: 'Secure fencing' });
    }
    if (field.waterAccess && !amenities.some(a => a.label.includes('Water'))) {
      amenities.push({ icon: Droplets, label: 'Water Access' });
    }
    
    return amenities.slice(0, 4); // Limit to 4 for UI
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-700 border-green-200',
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

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-[32px] max-w-[800px] w-full max-h-[90vh] overflow-y-auto overflow-x-hidden relative animate-in fade-in zoom-in duration-300">
          {/* Close Button and Status Badge */}
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8 lg:top-8 z-10 flex items-center gap-2 sm:gap-3">
            {fullBooking?.status && (
              <div>{getStatusBadge(fullBooking.status)}</div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-[#19221519] hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-10">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3a6b22]"></div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-4 sm:mb-6 pr-16 sm:pr-20">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-xl sm:text-2xl lg:text-[29px] font-semibold text-[#192215]">
                      {field?.name || 'Field'}
                    </h2>
                    <span className="text-sm sm:text-[16px] font-semibold text-[#192215]">
                      • {field?.bookingDuration === '30min' ? '30min' : '1hr'}
                    </span>
                    <span className="text-sm sm:text-[16px] font-semibold text-[#3a6b22]">
                      • ${price}
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
                          {formatDate(fullBooking?.date)}
                        </span>
                      </div>
                    </div>
                    
                    {field?.averageRating > 0 ? (
                      <div className="flex items-center gap-1 bg-[#192215] px-1.5 py-1 rounded w-fit">
                        <Star className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-yellow fill-yellow" />
                        <span className="text-xs sm:text-[14px] font-semibold text-white">
                          {field.averageRating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-gray-200 px-1.5 py-1 rounded w-fit">
                        <Star className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400" />
                        <span className="text-xs sm:text-[14px] font-semibold text-gray-600">No ratings</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                {formatAmenities().length > 0 && (
                  <div className="grid grid-cols-2 sm:flex gap-1.5 mb-4 sm:mb-6">
                    {formatAmenities().map((amenity: any, index: number) => {
                      const Icon = amenity.icon;
                      return (
                        <div key={index} className="flex-1 bg-white border border-black/6 rounded-lg sm:rounded-[14px] px-2 py-1.5 sm:px-3.5 sm:py-2 flex items-center justify-center gap-1 sm:gap-2">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-green fill-green" />
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
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#3a6b22] fill-[#3a6b22]" />
                            )}
                          </div>
                          <span className="text-xs sm:text-[14px] text-[#545662b3]">
                            Joined on {new Date(owner?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      <button className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 bg-white border border-[#8fb36666] rounded-[10px] hover:bg-gray-50 transition-colors">
                        <img src='/msg.svg' className="w-5 h-5 text-[#192215]" />
                        <span className="text-[12px] font-semibold text-[#192215]">Send a Message</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Images Gallery */}
                {field?.images && field.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="col-span-2 row-span-2">
                      <img 
                        src={field.images[0]} 
                        alt="Field view 1"
                        className="w-full h-[120px] sm:h-[180px] lg:h-[248px] rounded-[10px] object-cover"
                      />
                    </div>
                    {field.images.slice(1, 5).map((image: string, index: number) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Field view ${index + 2}`}
                        className="w-full h-[58px] sm:h-[86px] lg:h-[118px] rounded-[10px] object-cover"
                      />
                      {index === 3 && field?.images?.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 rounded-[10px] flex items-center justify-center">
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
                        title={!isCancellable ? `Cannot reschedule within 24 hours of booking (${getTimeUntilBooking()} hours remaining)` : 'Reschedule booking'}
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
                        title={!isCancellable ? `Cannot cancel within 24 hours of booking (${getTimeUntilBooking()} hours remaining)` : 'Cancel booking'}
                      >
                        Cancel Booking
                      </button>
                    </div>
                    
                    {/* Warning message if within cancellation window */}
                    {!isCancellable && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                        <p className="text-xs sm:text-sm text-yellow-800 text-center">
                          <Clock className="inline w-4 h-4 mr-1" />
                          Cancellation and rescheduling are not available within 24 hours of your booking.
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
    </>
  );
};