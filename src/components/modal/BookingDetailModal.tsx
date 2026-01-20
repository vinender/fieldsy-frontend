import React, { useState, useMemo } from 'react';
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
import { getUserInitials } from '@/utils/getUserImage';
import { useBookingDetails } from '@/hooks/queries/useBookingQueries';
import { deslugify, formatDateDDMMYYYY, formatRating } from '@/utils/formatters';
import { useCancellationWindow } from '@/hooks/usePublicSettings';
import Spinner from '@/components/ui/Spinner';
import { AMENITIES_CONFIG, getAmenityIcon, getAmenityLabel } from '@/config/amenities.config';
import { AmenityIcon, ICON_COLORS } from '@/components/ui/AmenityIcon';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onReview?: () => void;
  onReviewAdded?: () => void;
  onCancel?: (booking: any) => void;
  onReschedule?: (booking: any) => void;
  onCancelSubscription?: (booking: any) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  onReview,
  onReviewAdded,
  onCancel,
  onReschedule,
  onCancelSubscription
}) => {
  const router = useRouter();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const cancellationWindowHours = useCancellationWindow();

  // Fetch detailed booking data (in background to get latest info)
  const { data: bookingDetails, isLoading: isLoadingDetails, refetch: refetchBookingDetails } = useBookingDetails(
    booking?._id || booking?.id,
    { enabled: isOpen && !!(booking?._id || booking?.id) }
  );

  // Use fetched data if available, otherwise fall back to passed booking
  // API returns { success: true, data: {...booking...} }
  // Show modal content immediately with passed booking data, update when API data arrives
  const fullBooking = bookingDetails?.data || booking;
  console.log(';; fullBooking', fullBooking);
  // Only show loading spinner if we don't have any booking data at all
  const isLoading = isLoadingDetails && !booking;

  // Use backend-provided cancellation eligibility values for consistency
  // The backend properly calculates these based on the booking date/time and cancellation window
  // Fallback to false if not provided (e.g., cancelled/completed bookings)
  const isCancellable = fullBooking?.isCancellable ?? false;
  const isReschedulable = fullBooking?.isReschedulable ?? false;
  const hoursUntilBooking = fullBooking?.hoursUntilBooking ?? 0;
  const hasCompletedBookingInSubscription = fullBooking?.hasCompletedBookingInSubscription ?? false;
  const rescheduleCount = fullBooking?.rescheduleCount ?? 0;

  // Check if booking is a recurring booking (has subscription OR repeatBooking is not "None"/null/undefined)
  const isRecurringBooking = !!(
    fullBooking?.subscription ||
    (fullBooking?.repeatBooking && fullBooking.repeatBooking.toLowerCase() !== 'none')
  );

  // Format date helper (removed - using utility function)

  // Format time slot
  const formatTimeSlot = () => {
    if (fullBooking?.timeSlot) return fullBooking.timeSlot;
    if (fullBooking?.startTime && fullBooking?.endTime) {
      return `${fullBooking.startTime} - ${fullBooking.endTime}`;
    }
    return '';
  };

  const amenities = useMemo(() => {
    const fieldAmenities = fullBooking?.field?.amenities;
    if (!Array.isArray(fieldAmenities) || fieldAmenities.length === 0) {
      return [];
    }

    const defaultIcon = '/field-details/shield.svg';

    const slugifyAmenity = (value?: string) => {
      if (!value) return '';
      return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const findConfig = (slug?: string, label?: string) => {
      if (slug) {
        const bySlug = AMENITIES_CONFIG.find(config => config.slug === slug);
        if (bySlug) return bySlug;
      }

      if (label) {
        const normalizedLabel = label.trim().toLowerCase();
        return AMENITIES_CONFIG.find(
          config => config.label.toLowerCase() === normalizedLabel
        );
      }
      return undefined;
    };

    const seenLabels = new Set<string>();

    return fieldAmenities
      .map((amenity: any) => {
        if (!amenity) return null;

        let labelFromData = '';
        let slugFromData = '';
        let iconFromData = '';

        if (typeof amenity === 'string') {
          labelFromData = amenity;
          slugFromData = slugifyAmenity(amenity);
        } else if (typeof amenity === 'object') {
          labelFromData =
            amenity.label ||
            amenity.name ||
            amenity.title ||
            amenity.slug ||
            amenity.id ||
            '';

          const slugSource =
            amenity.slug ||
            amenity.value ||
            amenity.id ||
            labelFromData;

          slugFromData = slugifyAmenity(slugSource);
          iconFromData = amenity.iconUrl || amenity.icon || amenity.iconPath || '';
        }

        const amenityConfig = findConfig(slugFromData, labelFromData);
        const normalizedSlug = slugFromData || amenityConfig?.slug || slugifyAmenity(labelFromData);

        const iconPath =
          iconFromData ||
          (normalizedSlug ? getAmenityIcon(normalizedSlug, defaultIcon) : amenityConfig?.iconPath) ||
          defaultIcon;

        const label =
          labelFromData ||
          (normalizedSlug ? getAmenityLabel(normalizedSlug) : amenityConfig?.label) ||
          'Amenity';

        const normalizedLabelKey = label.toLowerCase();
        if (seenLabels.has(normalizedLabelKey)) {
          return null;
        }
        seenLabels.add(normalizedLabelKey);

        return {
          iconPath,
          label,
        };
      })
      .filter((amenity): amenity is { iconPath: string; label: string } => Boolean(amenity));
  }, [fullBooking]);

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

  return (
    <>
      {/* Overlay with fade-in animation */}
      <div
        className="fixed inset-0 bg-black/80 z-50 "
        onClick={onClose}
      />

      {/* Modal with slide-up and scale animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        {/* Wrapper for positioning close button outside overflow */}
        <div className="relative max-w-[800px] w-full" onClick={(e) => e.stopPropagation()}>
          {/* Close Button - Half inside, half outside (outside overflow container) */}
          <button
            onClick={onClose}
            className="absolute -right-4 -top-4 sm:-right-3 sm:-top-3 z-[60] w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors shadow-lg"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215]" />
          </button>

          {/* Modal Container */}
          <div
            className="bg-white rounded-xl sm:rounded-2xl lg:rounded-[32px] w-full max-h-[90vh] min-h-[300px] flex flex-col overflow-hidden animate-[modalSlideIn_100ms_ease-out_forwards]"
          >
            {/* Loading State */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Spinner size="md" />
                  <p className="text-sm text-gray-500 mt-3">Loading booking details...</p>
                </div>
              </div>
            ) : (
              /* Scrollable Content Wrapper - Only rendered when not loading */
              <div className="overflow-y-auto scrollbar-hide max-h-[90vh]">
                {/* Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                  <>
                    {/* Status Badge - Scrollable */}
                    <div className="flex justify-end mb-2 sm:mb-3 pr-10 sm:pr-12">
                      <div className="flex items-center gap-2">
                        {/* Small loading indicator when fetching updated data */}
                        {isLoadingDetails && booking && (
                          <Spinner size="sm" inline className="opacity-50" />
                        )}
                        {fullBooking?.status && getStatusBadge(fullBooking.status)}
                      </div>
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

                            <span className="text-xs sm:text-[14px] text-gray-800">
                              {fullBooking?.rawDate ? formatDateDDMMYYYY(new Date(fullBooking.rawDate)) : fullBooking?.date ? formatDateDDMMYYYY(new Date(fullBooking.date)) : ''}
                            </span>
                          </div>
                        </div>

                        {field?.averageRating > 0 ? (
                          <div className="flex items-center gap-1 bg-[#192215] px-1.5 py-1 rounded w-fit">
                            <img src='/star.svg' className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-yellow fill-yellow" />
                            <span className="text-xs sm:text-[14px] font-semibold text-white">
                              {formatRating(field.averageRating).toFixed(1)}
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
                    {amenities.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 sm:mb-6">
                        {amenities.map((amenity, index) => (
                          <div
                            key={`${amenity.label}-${index}`}
                            className="bg-white border border-black/6 rounded-lg sm:rounded-[14px] px-2 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-1 sm:gap-2"
                          >
                            <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                              <AmenityIcon
                                src={amenity.iconPath}
                                alt={amenity.label}
                                color={ICON_COLORS.green}
                                size={20}
                              />
                            </div>
                            <span className="text-[11px] sm:text-[14px] font-medium text-[#192215] truncate">
                              {amenity.label}
                            </span>
                          </div>
                        ))}
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
                            {/* Show uploaded image or Google image if exists, otherwise show dummy placeholder */}
                            <img
                              src={owner?.image || owner?.googleImage || owner?.profileImage || `https://ui-avatars.com/api/?name=${getUserInitials(owner)}&background=3A6B22&color=fff&size=200`}
                              alt={owner?.name || 'Owner'}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                              onError={(e) => {
                                // Fallback to ui-avatars if image fails to load
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
                                {field.customFieldSize || field.size} acres
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

                          {/* Booking ID */}
                          <div className="flex items-center justify-between py-2 sm:py-3 ">
                            <span className="text-xs sm:text-[16px] text-[#192215] opacity-70">Booking ID</span>
                            <span className="text-xs sm:text-[16px] font-medium text-[#192215]">
                              #{fullBooking?.bookingId || (fullBooking?._id || fullBooking?.id)?.slice(-8).toUpperCase() || 'N/A'}
                            </span>
                          </div>

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
                              if (isReschedulable && onReschedule) {
                                onClose();
                                // Map API response fields to expected format for RescheduleBookingModal
                                const mappedBooking = {
                                  ...fullBooking,
                                  time: fullBooking.timeSlot || `${fullBooking.startTime} - ${fullBooking.endTime}`,
                                  dogs: fullBooking.numberOfDogs || fullBooking.dogs,
                                  price: fullBooking.totalPrice || fullBooking.price,
                                  recurring: fullBooking.repeatBooking || fullBooking.recurring || 'None'
                                };
                                onReschedule(mappedBooking);
                              }
                            }}
                            disabled={!isReschedulable}
                            className={`w-full sm:flex-1 h-12 sm:h-14 rounded-full text-sm sm:text-[16px] font-semibold transition-colors ${isReschedulable
                              ? 'bg-[#e8f5ff] border-2 border-[#0066cc] text-[#0066cc] hover:bg-[#d4ecff] cursor-pointer'
                              : 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                              }`}
                            title={!isReschedulable ? (
                              hasCompletedBookingInSubscription
                                ? 'Cannot reschedule - a booking in this subscription has already been completed'
                                : hoursUntilBooking < cancellationWindowHours
                                  ? `Cannot reschedule within ${cancellationWindowHours} hours of booking (${hoursUntilBooking.toFixed(1)} hours remaining)`
                                  : rescheduleCount >= 3
                                    ? 'Maximum reschedule limit (3) reached for this booking'
                                    : `Cannot reschedule within ${cancellationWindowHours} hours of booking`
                            ) : 'Reschedule booking'}
                          >
                            Reschedule Booking
                          </button>
                          {/* Show Cancel Subscription for recurring bookings, Cancel Booking for regular */}
                          {isRecurringBooking ? (
                            <button
                              onClick={() => {
                                if (onCancelSubscription) {
                                  onClose();
                                  onCancelSubscription(fullBooking);
                                }
                              }}
                              disabled={fullBooking?.subscription?.status === 'canceled' || fullBooking?.subscription?.cancelAtPeriodEnd}
                              className={`w-full sm:flex-1 h-12 sm:h-14 rounded-full text-sm sm:text-[16px] font-semibold transition-colors ${fullBooking?.subscription?.status === 'canceled' || fullBooking?.subscription?.cancelAtPeriodEnd
                                ? 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                                : 'bg-white border-2 border-blood-red text-blood-red hover:bg-blood-red-50 cursor-pointer'
                                }`}
                              title={
                                fullBooking?.subscription?.status === 'canceled' || fullBooking?.subscription?.cancelAtPeriodEnd
                                  ? 'Subscription is already cancelled or scheduled to cancel'
                                  : 'Cancel recurring subscription'
                              }
                            >
                              {fullBooking?.subscription?.status === 'canceled' || fullBooking?.subscription?.cancelAtPeriodEnd
                                ? 'Subscription Cancelled'
                                : 'Cancel Subscription'}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (isCancellable && onCancel) {
                                  onClose();
                                  onCancel(fullBooking);
                                }
                              }}
                              disabled={!isCancellable}
                              className={`w-full sm:flex-1 h-12 sm:h-14 rounded-full text-sm sm:text-[16px] font-semibold transition-colors ${isCancellable
                                ? 'bg-white border-2 border-blood-red text-blood-red hover:bg-blood-red-50 cursor-pointer'
                                : 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                                }`}
                              title={!isCancellable ? `Cannot cancel within ${cancellationWindowHours} hours of booking (${hoursUntilBooking} hours remaining)` : 'Cancel booking'}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>

                        {/* Warning message if within cancellation window (only for non-recurring bookings) */}
                        {!isRecurringBooking && (!isCancellable || !isReschedulable) && hoursUntilBooking > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                            <p className="text-xs sm:text-sm text-yellow-800 text-center">
                              <Clock className="inline w-4 h-4 mr-1" />
                              Cancellation and rescheduling are not available within {cancellationWindowHours} hours of your booking.
                              <br />
                              <span className="font-semibold">{hoursUntilBooking} hours remaining until booking.</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : fullBooking?.status === 'COMPLETED' ? (
                      <button
                        onClick={() => {
                          if (!fullBooking?.hasReview) {
                            if (onReview) {
                              onReview();
                            } else {
                              setIsReviewModalOpen(true);
                            }
                          }
                        }}
                        disabled={fullBooking?.hasReview}
                        className={`w-full h-12 sm:h-14 rounded-full text-sm sm:text-[16px] font-semibold transition-colors ${fullBooking?.hasReview
                          ? 'bg-gray-100 border-2 border-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#3a6b22] text-white hover:bg-[#2d5319] cursor-pointer'
                          }`}
                      >
                        {fullBooking?.hasReview ? 'Reviewed' : 'Write a Review'}
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
                </div>
              </div>
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
          // Refetch booking details to get updated hasReview status
          refetchBookingDetails();
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
