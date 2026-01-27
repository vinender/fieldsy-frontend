import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Dog,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { BookingDetailsModal } from '@/components/modal/BookingDetailModal';
import { CancelBookingModal } from '@/components/modal/CancelBookingModal';
import { RescheduleBookingModal } from '@/components/modal/RescheduleBookingModal';
import { AddReviewModal } from '@/components/modal/AddReviewModal';
import BookingFilter from '@/components/bookings/booking-filter';
import { UserLayout } from '@/components/layout/UserLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useCancelBooking, useRescheduleBooking } from '@/hooks/useBookingApi';
import { formatAmenities, formatDateDDMMYYYY } from '@/utils/formatters';
import { toast } from 'sonner';
import { getAmenityBySlug } from '@/config/amenities.config';
import { useCancellationWindow } from '@/hooks/usePublicSettings';
import { BookingCardSkeleton } from '@/components/skeletons/SkeletonComponents';
import { useUserBookingsByStatus } from '@/hooks/queries/useBookingQueries';


// Subscription data for recurring bookings
interface SubscriptionData {
  id: string;
  status: string;
  interval: string;
  dayOfWeek?: string;
  dayOfMonth?: number;
  nextBillingDate?: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  totalPrice: number;
  stripeSubscriptionId: string;
}

// MongoDB Document Structure for Bookings
interface Booking {
  _id: string;
  fieldId: string;
  userId: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  image: string;
  features: string;
  location: string;
  distance: string | null;
  time: string;
  date: string;
  rawDate?: string; // Raw ISO date for calculations
  startTime?: string; // Raw start time
  endTime?: string; // Raw end time
  dogs: number;
  recurring: string | null;
  status: 'upcoming' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
  updatedAt: string;
  field?: any; // Full field data
  averageRating?: number; // Field's average rating
  rescheduleCount?: number; // Number of times this booking has been rescheduled
  hasReview?: boolean; // Whether booking has been reviewed
  fieldReview?: {
    id: string;
    rating: number;
    createdAt: string;
  } | null;
  // Calculated fields from backend for mobile app compatibility
  isCancellable?: boolean;
  isReschedulable?: boolean;
  hasCompletedBookingInSubscription?: boolean; // True if any booking in subscription is completed
  hoursUntilBooking?: number;
  cancellationWindow?: number;
  canCancelSubscriptionImmediately?: boolean;
  subscription?: SubscriptionData | null; // Subscription data for recurring bookings
}



const BookingHistoryPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const cancelBookingMutation = useCancelBooking();
  const rescheduleBookingMutation = useRescheduleBooking();
  const cancellationWindow = useCancellationWindow();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Update active tab based on query params
  useEffect(() => {
    if (!router.isReady) return;

    const { status, tab } = router.query;
    type TabType = 'upcoming' | 'completed' | 'cancelled';
    const validTabs: TabType[] = ['upcoming', 'completed', 'cancelled'];

    if (status) {
      const statusStr = status as string;
      if (validTabs.includes(statusStr as TabType)) {
        setActiveTab(statusStr as TabType);
      } else if (statusStr === 'confirmed') {
        setActiveTab('upcoming');
      } else if (statusStr === 'previous') {
        // Support old 'previous' status for backwards compatibility
        setActiveTab('completed');
      } else if (statusStr === 'recurring') {
        // Redirect recurring to upcoming since recurring tab is removed
        setActiveTab('upcoming');
      }
    } else if (tab) {
      const tabStr = tab as string;
      if (validTabs.includes(tabStr as TabType)) {
        setActiveTab(tabStr as TabType);
      } else if (tabStr === 'previous') {
        // Support old 'previous' tab for backwards compatibility
        setActiveTab('completed');
      } else if (tabStr === 'recurring') {
        // Redirect recurring to upcoming since recurring tab is removed
        setActiveTab('upcoming');
      }
    }
  }, [router.isReady, router.query]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCancelSubModalOpen, setIsCancelSubModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
  const [bookingToCancelSub, setBookingToCancelSub] = useState<Booking | null>(null);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  const [page, setPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);

  // Use React Query for bookings - caches data per tab, refetches in background
  const {
    data: rawBookings,
    pagination,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useUserBookingsByStatus({
    status: activeTab,
    page,
    limit: 10,
    filters: appliedFilters,
  });

  // Track if any modal is open or about to open (used to prevent showing loading state during modal operations)
  const isAnyModalOpenOrPending = isCancelModalOpen || isRescheduleModalOpen || isReviewModalOpen || isModalOpen ||
    bookingToCancel !== null || bookingToReschedule !== null || bookingToReview !== null;

  // Derived values from pagination
  const totalPages = pagination?.totalPages || 1;
  const totalBookings = pagination?.total || 0;
  const loading = isLoading && !isAnyModalOpenOrPending;
  const error = queryError ? 'Failed to fetch bookings' : null;
  // const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [amenitiesModalOpen, setAmenitiesModalOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Helper function to convert time string to minutes
  const timeToMinutes = (time: string): number => {
    // Handle different time formats
    if (time.includes(':')) {
      // Format like "14:00" or "2:00PM"
      let [hourStr, rest] = time.split(':');
      let hour = parseInt(hourStr);
      let minutes = 0;

      if (rest) {
        // Extract minutes and check for AM/PM
        const match = rest.match(/(\d+)([AP]M)?/i);
        if (match) {
          minutes = parseInt(match[1]);
          if (match[2]) {
            const period = match[2].toUpperCase();
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
          }
        }
      }

      return hour * 60 + minutes;
    } else {
      // Format like "8:00AM" or "12:00PM"
      const match = time.match(/(\d+):?(\d*)([AP]M)/i);
      if (match) {
        let hour = parseInt(match[1]);
        const minutes = parseInt(match[2] || '0');
        const period = match[3].toUpperCase();

        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        return hour * 60 + minutes;
      }
    }

    return 0;
  };

  // Reset page when tab changes
  useEffect(() => {
    if (activeTab) {
      setPage(1);
    }
  }, [activeTab]);

  // Transform raw bookings data to match frontend interface
  const bookings = useMemo(() => {
    if (!rawBookings || rawBookings.length === 0) return [];

    return rawBookings.map((booking: any) => {
      // Calculate the actual price if totalPrice is missing or 0
      let calculatedPrice = booking.totalPrice || 0;

      if ((!calculatedPrice || calculatedPrice === 0) && booking.field?.pricePerHour) {
        const startMinutes = timeToMinutes(booking.startTime);
        const endMinutes = timeToMinutes(booking.endTime);
        const durationHours = (endMinutes - startMinutes) / 60;
        const numberOfDogs = booking.numberOfDogs || 1;

        if (booking.field?.bookingDuration === '30min') {
          const duration30MinBlocks = durationHours * 2;
          calculatedPrice = booking.field.pricePerHour * duration30MinBlocks * numberOfDogs;
        } else {
          calculatedPrice = booking.field.pricePerHour * durationHours * numberOfDogs;
        }
      }

      return {
        _id: booking.id,
        fieldId: booking.field?.fieldId || booking.fieldId,
        userId: booking.userId,
        name: booking.field?.name || 'Field',
        duration: booking.field?.bookingDuration === '30min' ? '30min' : '1hr',
        price: calculatedPrice || booking.totalPrice || 0,
        currency: '£',
        image: booking.field?.images?.[0] || '/fields/field-placeholder.jpg',
        features: booking.field?.amenities ? formatAmenities(booking.field.amenities).join(' • ') : booking.field?.description || 'Field description',
        location: booking.field?.address ? `${booking.field.address}, ${booking.field.city}, ${booking.field.state}` : 'Location',
        distance: null,
        time: booking.timeSlot || `${booking.startTime} – ${booking.endTime}`,
        date: formatDateDDMMYYYY(new Date(booking.date)),
        rawDate: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        dogs: booking.numberOfDogs || 1,
        recurring: booking.repeatBooking && booking.repeatBooking.toLowerCase() !== 'none' ? `Recurring ${booking.repeatBooking}` : null,
        status: booking.status.toLowerCase() === 'confirmed' ? 'upcoming' : booking.status.toLowerCase() as any,
        paymentStatus: booking.paymentStatus?.toLowerCase() || 'paid',
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        rescheduleCount: booking.rescheduleCount || 0,
        hasReview: booking.hasReview || false,
        fieldReview: booking.fieldReview || null,
        field: booking.field,
        averageRating: booking.field?.averageRating || 0,
        subscription: booking.subscription || null,
        isCancellable: booking.isCancellable ?? false,
        isReschedulable: booking.isReschedulable ?? false,
        hasCompletedBookingInSubscription: booking.hasCompletedBookingInSubscription ?? false,
        hoursUntilBooking: booking.hoursUntilBooking ?? 0,
        cancellationWindow: booking.cancellationWindow ?? 24,
        canCancelSubscriptionImmediately: booking.canCancelSubscriptionImmediately ?? false
      };
    });
  }, [rawBookings]);

  // Effect to handle deep linking to a specific booking via query param
  useEffect(() => {
    const { bookingId } = router.query;

    if (bookingId && bookings.length > 0 && !isModalOpen) {
      const bookingToOpen = bookings.find(b => b._id === bookingId);

      if (bookingToOpen) {
        setSelectedBooking(bookingToOpen);
        setIsModalOpen(true);

        // Clean up the URL without reloading the page
        const { pathname, query } = router;
        const params = new URLSearchParams(query as any);
        params.delete('bookingId');
        router.replace(
          { pathname, query: params.toString() },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [router.query, bookings, isModalOpen]);


  // Use actual bookings from API only
  const displayBookings = bookings;

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleRescheduleClick = (booking: Booking) => {
    setBookingToReschedule(booking);
    setIsRescheduleModalOpen(true);
  };

  const handleCancelSubscriptionClick = (booking: Booking) => {
    setBookingToCancelSub(booking);
    setIsCancelSubModalOpen(true);
  };

  // Page-level cancel subscription handler
  const handleCancelSubscriptionFromModal = async (immediately: boolean = false) => {
    if (!bookingToCancelSub?.subscription) return;

    setIsCancellingSubscription(true);

    try {
      let token = (session as any)?.accessToken;

      if (!token) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/${bookingToCancelSub._id}/cancel-recurring`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cancelImmediately: immediately })
        }
      );

      if (response.ok) {
        setIsCancelSubModalOpen(false);
        setBookingToCancelSub(null);
        // Refresh bookings in background
        refetch();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to cancel recurring booking', {
          position: 'top-center',
        });
      }
    } catch (err) {
      toast.error('Failed to cancel recurring booking', {
        position: 'top-center',
      });
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  const handleApplyFilter = (filters: any) => {
    setAppliedFilters(filters);
    setShowFilter(false);
    setPage(1); // Reset to first page when applying filters
    // The useEffect will automatically refetch bookings when appliedFilters changes
  };


  const handleCancelBooking = async (bookingId: string, reason: string) => {
    cancelBookingMutation.mutate(
      { bookingId, reason },
      {
        onSuccess: (data) => {
          // Show success message with refund status
          const refundResult = data.data.refundResult;
          let message = 'Booking cancelled successfully.';

          if (refundResult && refundResult.success) {
            message = `Booking cancelled successfully. Refund of £${refundResult.refundAmount?.toFixed(2) || '0.00'} has been initiated and will be credited to your account within 5-7 business days.`;
          } else if (data.data.isRefundEligible) {
            message = 'Booking cancelled successfully. Your refund will be processed within 5-7 business days.'
          } else {
            message = `Booking cancelled successfully. This booking was not eligible for a refund as it was cancelled less than ${cancellationWindow} hours before the scheduled time.`;
          }

          toast.success(message, {
            duration: 7000,
            position: 'top-center',
          });

          setIsCancelModalOpen(false);
          setBookingToCancel(null);

          // Refresh from server in background
          refetch();
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
          toast.error(errorMessage, {
            position: 'top-center',
          });
        }
      }
    );
  };

  const handleRescheduleBooking = async (bookingId: string, date: string, startTime: string, endTime: string) => {
    rescheduleBookingMutation.mutate(
      { bookingId, date, startTime, endTime },
      {
        onSuccess: () => {
          toast.success('Booking rescheduled successfully!', {
            position: 'top-center',
          });

          setIsRescheduleModalOpen(false);
          setBookingToReschedule(null);

          // Refresh bookings in background
          refetch();
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || 'Failed to reschedule booking';
          toast.error(errorMessage, {
            position: 'top-center',
          });
        }
      }
    );
  };


  const BookingCard = ({ booking, onRefresh }: { booking: Booking; onRefresh: () => void }) => {
    const [showCancelSubModal, setShowCancelSubModal] = useState(false);
    const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
    console.log(';; fullBooking', booking);
    // Use backend-provided calculated values (for mobile app compatibility)
    const isCancellable = booking.isCancellable ?? false;
    const isReschedulable = booking.isReschedulable ?? false;
    const hasCompletedBookingInSubscription = booking.hasCompletedBookingInSubscription ?? false;
    const hoursUntilBooking = booking.hoursUntilBooking ?? 0;
    const bookingCancellationWindow = booking.cancellationWindow ?? cancellationWindow;
    const isImmediateCancellationAllowed = booking.canCancelSubscriptionImmediately ?? false;

    // Handle cancel subscription
    const handleCancelSubscription = async (immediately: boolean = false) => {
      if (!booking.subscription) return;

      setIsCancellingSubscription(true);

      try {
        let token = (session as any)?.accessToken;

        if (!token) {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            token = user.token;
          }
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/${booking._id}/cancel-recurring`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cancelImmediately: immediately })
          }
        );

        if (response.ok) {
          // Note: Success toast is handled by NotificationContext via socket notification
          // Don't show a duplicate toast here
          setShowCancelSubModal(false);
          // Refresh bookings in background
          onRefresh();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to cancel recurring booking', {
            position: 'top-center',
          });
        }
      } catch (err) {
        toast.error('Failed to cancel recurring booking', {
          position: 'top-center',
        });
      } finally {
        setIsCancellingSubscription(false);
      }
    };

    return (
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center bg-light py-4 sm:py-6 border-b border-gray-200 last:border-0">
        {/* Image - Clickable */}
        <div
          onClick={() => router.push(`/fields/${booking.fieldId}`)}
          className="relative w-full sm:w-[174px] h-[200px] sm:h-[140px] rounded-[20px] flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
        >
          <Image
            src={booking.image}
            alt={booking.name}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 174px"
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 pb-10 w-full">
          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2.5">
            <h3
              onClick={() => router.push(`/fields/${booking.fieldId}`)}
              className="text-[18px] sm:text-[20px] font-semibold text-[#192215] cursor-pointer hover:text-[#3a6b22] transition-colors"
            >
              {booking.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[14px] sm:text-[16px] font-semibold text-[#192215]">• {booking.duration}</span>
              <span className="text-[14px] sm:text-[16px] font-semibold text-[#3a6b22]">• {booking.currency}{booking.price}</span>
            </div>
          </div>

          {/* Amenities - Hidden on mobile, shown on larger screens */}
          {booking.field?.amenities && booking.field.amenities.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-2 mb-4">
              {booking.field.amenities.slice(0, 4).map((amenity: any, index: number) => {
                // Handle both string and object formats
                const amenitySlug = typeof amenity === 'string' ? amenity : amenity.label;
                const amenityConfig = getAmenityBySlug(amenitySlug);
                const iconPath = typeof amenity === 'object' && amenity.iconUrl
                  ? amenity.iconUrl
                  : amenityConfig?.iconPath;
                const label = amenityConfig?.label || (typeof amenity === 'object' ? amenity.label : amenity);

                return (
                  <div key={index} className="flex items-center gap-1.5">
                    {iconPath && (
                      <img
                        src={iconPath}
                        alt={label}
                        className="w-4 h-4 flex-shrink-0"
                        style={{ filter: 'brightness(0)' }}
                      />
                    )}
                    <span className="text-[14px] font-medium text-[#192215]">
                      {label}
                    </span>
                  </div>
                );
              })}
              {booking.field.amenities.length > 4 && (
                <button
                  onClick={() => {
                    setSelectedAmenities(booking.field.amenities);
                    setAmenitiesModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-[#3a6b22] hover:text-[#2d5319] transition-colors"
                >
                  <span className="text-[14px] font-bold">+{booking.field.amenities.length - 4} more</span>
                </button>
              )}
            </div>
          )}

          {/* Details */}
          <div className="flex flex-wrap gap-3 sm:gap-6 text-[12px] sm:text-[14px] text-[#8d8d8d] mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-[16px] sm:w-[18px] fill-black text-black h-[16px] sm:h-[18px]" />
              <span className="line-clamp-1">
                {booking.location}
                {booking.distance && ` • ${booking.distance}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <img src="/bookings/clock.svg" className="w-[16px] sm:w-[18px] fill text-black h-[16px] sm:h-[18px]" />
              <span>{booking.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <img src="/bookings/availability.svg" className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" />
              <span>{booking.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <img src="/bookings/pet.svg" className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" />
              <span>{booking.dogs} Dog{booking.dogs > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Recurring Badge */}
            {booking.recurring && (
              <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 bg-[#f4ffef] border border-[#3a6b221a] rounded-full">
                <RefreshCw className="w-3 h-3 mr-1.5 text-[#3a6b22]" />
                <span className="text-[11px] sm:text-[13px] font-bold text-[#3a6b22]">{booking.recurring}</span>
              </div>
            )}

            {/* Subscription Info - Inline with recurring badge */}
            {booking.subscription && booking.subscription.status === 'active' && (
              <>
                {/* Next Billing Date */}
                {booking.subscription.nextBillingDate && !booking.subscription.cancelAtPeriodEnd && (
                  <span className="text-[11px] sm:text-[13px] text-gray-600">
                    Next billing: <span className="font-semibold text-[#192215]">{formatDateDDMMYYYY(new Date(booking.subscription.nextBillingDate))}</span>
                  </span>
                )}

                {/* Cancellation Scheduled */}
                {booking.subscription.cancelAtPeriodEnd && (
                  <span className="text-[11px] sm:text-[13px] text-amber-600 font-medium">
                    Ends {formatDateDDMMYYYY(new Date(booking.subscription.currentPeriodEnd))}
                  </span>
                )}
              </>
            )}

            {/* Rescheduled Badge */}
            {booking.rescheduleCount && booking.rescheduleCount > 0 ? (
              <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 bg-[#fff4e6] border border-[#ff9800]/20 rounded-full">
                <span className="text-[11px] sm:text-[13px] font-bold text-[#ff9800]">
                  Rescheduled {booking.rescheduleCount > 1 ? `(${booking.rescheduleCount}x)` : ''}
                </span>
              </div>
            ) : ''}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full sm:w-[180px] flex-shrink-0">
          {booking.status === 'upcoming' ? (
            <>
              {booking.subscription ? (
                /* Recurring booking: show buttons stacked vertically */
                <>
                  {(() => {
                    const rescheduleCount = booking.rescheduleCount || 0;
                    // Determine the appropriate reschedule message for recurring bookings
                    let rescheduleTitle: string;
                    if (!isReschedulable) {
                      if (hasCompletedBookingInSubscription) {
                        rescheduleTitle = 'Cannot reschedule - a booking in this subscription has already been completed';
                      } else if (hoursUntilBooking < bookingCancellationWindow) {
                        rescheduleTitle = `Cannot reschedule within ${bookingCancellationWindow} hours of booking (${hoursUntilBooking} hours remaining)`;
                      } else if (rescheduleCount >= 3) {
                        rescheduleTitle = 'Maximum reschedule limit (3) reached for this booking';
                      } else {
                        rescheduleTitle = 'Cannot reschedule this booking';
                      }
                    } else {
                      rescheduleTitle = `Reschedule booking (${rescheduleCount}/3 used)`;
                    }

                    return (
                      <button
                        onClick={() => isReschedulable ? handleRescheduleClick(booking) : null}
                        disabled={!isReschedulable}
                        className={`w-full py-2 px-2 border rounded-full text-[11px] sm:text-[13px] font-bold transition-colors ${isReschedulable
                          ? 'bg-[#e8f5ff] border-[#0066cc] text-[#0066cc] hover:bg-[#d4ecff] cursor-pointer'
                          : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                          }`}
                        title={rescheduleTitle}>
                        Reschedule
                      </button>
                    );
                  })()}
                  {(() => {
                    const isSubCancelled = booking.subscription?.status === 'canceled' || booking.subscription?.cancelAtPeriodEnd;
                    return (
                      <button
                        onClick={() => !isSubCancelled && setShowCancelSubModal(true)}
                        disabled={!!isSubCancelled}
                        className={`w-full py-2 px-2 border-2 rounded-full text-[11px] sm:text-[13px] font-bold transition-colors ${
                          isSubCancelled
                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-red-500 text-red-500 hover:bg-red-50 cursor-pointer'
                        }`}
                        title={isSubCancelled ? 'Subscription cancellation already scheduled' : 'Cancel recurring subscription'}>
                        {isSubCancelled ? 'Cancellation Scheduled' : 'Cancel Subscription'}
                      </button>
                    );
                  })()}
                </>
              ) : (
                /* Regular booking: show reschedule and cancel side by side */
                <div className="flex flex-row gap-2">
                  {(() => {
                    const rescheduleCount = booking.rescheduleCount || 0;
                    const rescheduleTitle = !isReschedulable
                      ? !isCancellable
                        ? `Cannot reschedule within ${bookingCancellationWindow} hours of booking (${hoursUntilBooking} hours remaining)`
                        : 'Maximum reschedule limit (3) reached for this booking'
                      : `Reschedule booking (${rescheduleCount}/3 used)`;

                    return (
                      <button
                        onClick={() => isReschedulable ? handleRescheduleClick(booking) : null}
                        disabled={!isReschedulable}
                        className={`flex-1 py-2 px-2 border rounded-full text-[11px] sm:text-[13px] font-bold transition-colors ${isReschedulable
                          ? 'bg-[#e8f5ff] border-[#0066cc] text-[#0066cc] hover:bg-[#d4ecff] cursor-pointer'
                          : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                          }`}
                        title={rescheduleTitle}>
                        Reschedule
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => isCancellable ? handleCancelClick(booking) : null}
                    disabled={!isCancellable}
                    className={`flex-1 py-2 px-2 border-2 rounded-full text-[11px] sm:text-[13px] font-bold transition-colors ${isCancellable
                      ? 'bg-white border-red-500 text-red-500 hover:bg-red-50 cursor-pointer'
                      : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                      }`}
                    title={!isCancellable ? `Cannot cancel within ${bookingCancellationWindow} hours of booking (${hoursUntilBooking} hours remaining)` : 'Cancel booking'}>
                    Cancel
                  </button>
                </div>
              )}
              <button
                onClick={() => handleViewDetails(booking)}
                className="w-full py-2 px-2.5 bg-[#3a6b22] rounded-full text-[12px] sm:text-[14px] font-bold text-white hover:bg-[#2d5319] transition-colors">
                View Details
              </button>
            </>
          ) : booking.status === 'cancelled' ? (
            <>
              <div className="flex-1 sm:w-full py-2 px-2.5 bg-white border  border-red-600 rounded-full text-[12px] sm:text-[14px] font-bold outline-red text-red-400 flex items-center justify-center cursor-not-allowed">
                Cancelled
              </div>
              <button
                onClick={() => handleViewDetails(booking)}
                className="flex-1 sm:w-full py-2 px-2.5 bg-[#3a6b22] rounded-full text-[12px] sm:text-[14px] font-bold text-white hover:bg-[#2d5319] transition-colors">
                View Details
              </button>
            </>
          ) : (
            <>
              <div className={`flex-1 sm:w-full py-2 px-2.5 rounded-full text-[12px] sm:text-[14px] font-bold flex items-center justify-center ${booking.status === 'completed'
                ? 'bg-white border border-green text-green'
                : 'bg-gray-100 text-gray-600'
                }`}>
                <Check className="w-[18px] h-[18px] mr-2 bg-green text-white rounded-sm p-0.5" />
                {booking.status === 'completed' ? 'Completed' :
                  booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </div>
              {booking.status === 'completed' && (
                <button
                  onClick={() => {
                    if (!booking.hasReview) {
                      setBookingToReview(booking);
                      setIsReviewModalOpen(true);
                    }
                  }}
                  disabled={booking.hasReview}
                  className={`flex-1 sm:w-full py-2 px-2.5 rounded-full text-[12px] sm:text-[14px] font-bold transition-colors ${booking.hasReview
                    ? 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#8fb366] text-white hover:bg-[#7a9d57] cursor-pointer'
                    }`}>
                  {booking.hasReview ? 'Reviewed' : 'Write a Review'}
                </button>
              )}
              <button
                onClick={() => handleViewDetails(booking)}
                className="flex-1 sm:w-full py-2 px-2.5 bg-[#3a6b22] rounded-full text-[12px] sm:text-[14px] font-bold text-white hover:bg-[#2d5319] transition-colors">
                View Details
              </button>
            </>
          )}
        </div>

        {/* Cancel Subscription Modal */}
        {showCancelSubModal && booking.subscription && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelSubModal(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-2xl animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-3">
                Cancel Recurring Booking
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Choose how you want to cancel your recurring booking for{" "}
                <span className="font-medium text-gray-800">{booking.name}</span>.
              </p>

              <div className="space-y-3">
                {/* Cancel at End of Period */}
                <button
                  onClick={() => handleCancelSubscription(false)}
                  disabled={isCancellingSubscription}
                  className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow transition-all disabled:opacity-50"
                >
                  {isCancellingSubscription ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    <>
                      Cancel at Next Billing Date
                      <span className="block text-xs mt-1 text-red-100">
                        Keep access until{" "}
                        {booking.subscription.nextBillingDate
                          ? formatDateDDMMYYYY(new Date(booking.subscription.nextBillingDate))
                          : formatDateDDMMYYYY(new Date(booking.subscription.currentPeriodEnd))}
                      </span>
                    </>
                  )}
                </button>

                {/* Cancel Immediately */}
                <button
                  onClick={() => handleCancelSubscription(true)}
                  disabled={!isImmediateCancellationAllowed || isCancellingSubscription}
                  className={`w-full px-4 py-3 font-medium rounded-xl shadow transition-all ${isImmediateCancellationAllowed && !isCancellingSubscription
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                    : "bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed"
                    }`}
                  title={
                    !isImmediateCancellationAllowed
                      ? `Cannot cancel immediately — booking is within ${bookingCancellationWindow}h cancellation window`
                      : ""
                  }
                >
                  {isCancellingSubscription ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    <>
                      Cancel Immediately
                      <span
                        className={`block text-xs mt-1 ${isImmediateCancellationAllowed ? "text-red-100" : "text-gray-500"
                          }`}
                      >
                        {isImmediateCancellationAllowed
                          ? "Stop all future bookings now"
                          : `Booking is within ${bookingCancellationWindow}h cancellation window`}
                      </span>
                    </>
                  )}
                </button>

                {/* Keep Subscription */}
                <button
                  onClick={() => setShowCancelSubModal(false)}
                  disabled={isCancellingSubscription}
                  className="w-full px-4 py-2 bg-gray-100 text-[#3a6b22] font-medium rounded-xl hover:bg-gray-200 transition-all border border-[#3a6b22] disabled:opacity-50"
                >
                  Keep My Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <UserLayout requireRole="DOG_OWNER">
      <div className="min-h-screen bg-light xl:mt-24 mt-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-6 sm:py-10">
          {/* Page Title with Back Button */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f8f1d7] rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215]" />
            </button>
            <h1 className="text-[24px] sm:text-[29px] font-semibold text-[#192215]">Booking History</h1>
            {/* Subtle indicator when refreshing in background */}
            {isFetching && !isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-[#3a6b22]/30 border-t-[#3a6b22] rounded-full animate-spin" />
                <span className="hidden sm:inline">Updating...</span>
              </div>
            )}
          </div>

          {/* Tabs and Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            {/* Tab Switcher */}
            <div className="inline-flex p-1 sm:p-1.5 bg-[#f8f1d7] rounded-full border border-black/3 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] font-bold transition-all whitespace-nowrap ${activeTab === 'upcoming'
                  ? 'bg-[#8fb366] text-white'
                  : 'bg-transparent text-[#192215] hover:bg-white/50'
                  }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] font-bold transition-all whitespace-nowrap ${activeTab === 'completed'
                  ? 'bg-[#8fb366] text-white'
                  : 'bg-transparent text-[#192215] hover:bg-white/50'
                  }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] font-bold transition-all whitespace-nowrap ${activeTab === 'cancelled'
                  ? 'bg-[#8fb366] text-white'
                  : 'bg-transparent text-[#192215] hover:bg-white/50'
                  }`}
              >
                Cancelled
              </button>
            </div>

            {/* Filter Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white border border-black/6 rounded-full hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-[#192215]" />
                <span className="text-[12px] sm:text-[14px] font-medium text-[#192215]">Filter</span>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-[#192215] transition-transform ${showFilter ? 'rotate-180' : ''}`} />
              </button>

              {/* Booking Filter Dropdown */}
              <BookingFilter
                isOpen={showFilter}
                onClose={() => setShowFilter(false)}
                onApplyFilter={handleApplyFilter}
              />
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-light rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
            {loading && !isAnyModalOpenOrPending ? (
              <div className="space-y-4">
                {/* Show skeleton cards while loading API data */}
                {[1, 2, 3, 4].map((index) => (
                  <BookingCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-500 font-medium mb-2">{error}</p>
                <button
                  onClick={() => refetch()}
                  className="text-[#3A6B22] font-medium hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : displayBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#0B0B0B] mb-2">
                  No {activeTab} bookings
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'upcoming'
                    ? "You don't have any upcoming bookings."
                    : activeTab === 'cancelled'
                      ? "You haven't cancelled any bookings yet."
                      : "You don't have any completed bookings."}
                </p>
                <button
                  onClick={() => router.push('/fields')}
                  className="bg-[#3A6B22] text-white px-6 py-2 rounded-full font-medium hover:bg-[#2e5519] transition"
                >
                  Browse Fields
                </button>
              </div>
            ) : (
              displayBookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} onRefresh={refetch} />
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && displayBookings.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[12px] sm:text-[14px] font-semibold italic text-[#192215] text-center sm:text-left">
                Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, totalBookings)} of {totalBookings}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5 text-[#192215]" />
                </button>

                {(() => {
                  const maxVisible = 5;
                  let startPage = 1;
                  let endPage = Math.min(totalPages, maxVisible);

                  // Adjust window to keep current page visible
                  if (totalPages > maxVisible) {
                    if (page <= 3) {
                      // Near the start
                      startPage = 1;
                      endPage = maxVisible;
                    } else if (page >= totalPages - 2) {
                      // Near the end
                      startPage = totalPages - maxVisible + 1;
                      endPage = totalPages;
                    } else {
                      // In the middle - center around current page
                      startPage = page - 2;
                      endPage = page + 2;
                    }
                  }

                  const pages = [];

                  // Show first page and ellipsis if needed
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setPage(1)}
                        className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors hover:bg-white/50 text-[#192215]"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(<span key="start-ellipsis" className="text-[#192215]">...</span>);
                    }
                  }

                  // Show page numbers in window
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${i === page
                          ? 'bg-[#3a6b22] text-white'
                          : 'hover:bg-white/50 text-[#192215]'
                          }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Show ellipsis and last page if needed
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(<span key="end-ellipsis" className="text-[#192215]">...</span>);
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setPage(totalPages)}
                        className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors hover:bg-white/50 text-[#192215]"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5 text-[#192215]" />
                </button>

              </div>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        <BookingDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onCancel={handleCancelClick}
          onReschedule={handleRescheduleClick}
          onCancelSubscription={handleCancelSubscriptionClick}
        />

        {/* Cancel Booking Modal */}
        {bookingToCancel && (
          <CancelBookingModal
            isOpen={isCancelModalOpen}
            onClose={() => {
              setIsCancelModalOpen(false);
              setBookingToCancel(null);
            }}
            booking={bookingToCancel}
            onSuccess={() => {
              setIsCancelModalOpen(false);
              setBookingToCancel(null);

              // Refresh bookings from server
              refetch();
            }}
          />
        )}

        {/* Reschedule Booking Modal */}
        {bookingToReschedule && (
          <RescheduleBookingModal
            isOpen={isRescheduleModalOpen}
            onClose={() => {
              setIsRescheduleModalOpen(false);
              setBookingToReschedule(null);
            }}
            booking={bookingToReschedule}
            onConfirm={handleRescheduleBooking}
          />
        )}

        {/* Add Review Modal */}
        {bookingToReview && (
          <AddReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => {
              setIsReviewModalOpen(false);
              setBookingToReview(null);
            }}
            fieldId={bookingToReview.fieldId}
            fieldName={bookingToReview.name}
            bookingId={bookingToReview._id}
            onReviewAdded={async () => {
              setIsReviewModalOpen(false);
              setBookingToReview(null);
              // Refresh bookings from server to get the actual review data
              refetch();
            }}
          />
        )}

        {/* Cancel Subscription Modal (Page Level) */}
        {isCancelSubModalOpen && bookingToCancelSub?.subscription && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setIsCancelSubModalOpen(false);
              setBookingToCancelSub(null);
            }}
          >
            <div
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-2xl animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-3">
                Cancel Recurring Booking
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Choose how you want to cancel your recurring booking for{" "}
                <span className="font-medium text-gray-800">{bookingToCancelSub.name}</span>.
              </p>

              <div className="space-y-3">
                {/* Cancel at End of Period */}
                <button
                  onClick={() => handleCancelSubscriptionFromModal(false)}
                  disabled={isCancellingSubscription}
                  className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow transition-all disabled:opacity-50"
                >
                  {isCancellingSubscription ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    <>
                      Cancel at Next Billing Date
                      <span className="block text-xs mt-1 text-red-100">
                        Keep access until{" "}
                        {bookingToCancelSub.subscription.nextBillingDate
                          ? formatDateDDMMYYYY(new Date(bookingToCancelSub.subscription.nextBillingDate))
                          : formatDateDDMMYYYY(new Date(bookingToCancelSub.subscription.currentPeriodEnd))}
                      </span>
                    </>
                  )}
                </button>

                {/* Cancel Immediately */}
                <button
                  onClick={() => handleCancelSubscriptionFromModal(true)}
                  disabled={!(bookingToCancelSub.canCancelSubscriptionImmediately ?? false) || isCancellingSubscription}
                  className={`w-full px-4 py-3 font-medium rounded-xl shadow transition-all ${(bookingToCancelSub.canCancelSubscriptionImmediately ?? false) && !isCancellingSubscription
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                    : "bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed"
                    }`}
                  title={
                    !(bookingToCancelSub.canCancelSubscriptionImmediately ?? false)
                      ? `Cannot cancel immediately — booking is within ${cancellationWindow}h cancellation window`
                      : ""
                  }
                >
                  {isCancellingSubscription ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    <>
                      Cancel Immediately
                      <span
                        className={`block text-xs mt-1 ${(bookingToCancelSub.canCancelSubscriptionImmediately ?? false) ? "text-red-100" : "text-gray-500"
                          }`}
                      >
                        {(bookingToCancelSub.canCancelSubscriptionImmediately ?? false)
                          ? "Stop all future bookings now"
                          : `Booking is within ${cancellationWindow}h cancellation window`}
                      </span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsCancelSubModalOpen(false);
                    setBookingToCancelSub(null);
                  }}
                  disabled={isCancellingSubscription}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Amenities Modal */}
        {amenitiesModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setAmenitiesModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">All Amenities</h3>
                <button
                  onClick={() => setAmenitiesModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedAmenities.map((amenity: any, index: number) => {
                    // Handle both string and object formats
                    const amenitySlug = typeof amenity === 'string' ? amenity : amenity.label;
                    const amenityConfig = getAmenityBySlug(amenitySlug);
                    const iconPath = typeof amenity === 'object' && amenity.iconUrl
                      ? amenity.iconUrl
                      : amenityConfig?.iconPath;
                    const label = amenityConfig?.label || (typeof amenity === 'object' ? amenity.label : amenity);

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-[#f4ffef] border border-[#3a6b221a] rounded-xl hover:bg-[#e8f5df] transition-colors"
                      >
                        {iconPath && (
                          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-[#3a6b221a]">
                            <img
                              src={iconPath}
                              alt={label}
                              className="w-6 h-6"
                              style={{ filter: 'brightness(0)' }}
                            />
                          </div>
                        )}
                        <span className="text-[14px] font-medium text-[#192215]">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setAmenitiesModalOpen(false)}
                  className="w-full py-3 px-4 bg-[#3a6b22] text-white font-semibold rounded-xl hover:bg-[#2d5319] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default BookingHistoryPage;
// Force SSR for this authenticated page - prevents _next/data routing issues
export async function getServerSideProps() {
  return {
    props: {},
  };
}
