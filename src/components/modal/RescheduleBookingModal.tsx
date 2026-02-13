import React from 'react';
import { X, AlertCircle, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/router';
import { useCancellationWindow } from '@/hooks/usePublicSettings';

interface RescheduleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    _id?: string;
    id?: string;
    fieldId: string;
    name: string;
    date: string;
    time: string;
    rawDate?: string;
    startTime?: string;
    endTime?: string;
    price: number;
    currency: string;
    dogs: number;
    field?: any;
    rescheduleCount?: number;
    recurring?: string | null;
    isReschedulable?: boolean;
    hoursUntilBooking?: number;
    hasCompletedBookingInSubscription?: boolean;
    cancellationWindow?: number; // From backend - the actual cancellation window hours
  };
  onConfirm: (bookingId: string, newDate: string, newStartTime: string, newEndTime: string) => void;
}

export const RescheduleBookingModal: React.FC<RescheduleBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const router = useRouter();
  const settingsCancellationWindow = useCancellationWindow();
  // Use booking's cancellation window if available (from same API call), otherwise use settings (default 12 hours)
  const cancellationWindowHours = booking.cancellationWindow ?? settingsCancellationWindow ?? 12;
  const rescheduleCount = booking.rescheduleCount || 0;
  const hasCompletedBookingInSubscription = booking.hasCompletedBookingInSubscription ?? false;

  // Calculate hours until booking in real-time (more accurate than backend-provided value)
  const calculateHoursUntilBooking = (): number => {
    const now = new Date();

    // Get the booking date
    const rawDate = booking.rawDate || booking.date;
    if (!rawDate) return 0;

    const bookingDate = new Date(rawDate);

    // Parse start time if available
    const startTime = booking.startTime || booking.time;
    if (startTime) {
      // Handle formats like "7:00AM", "7:00 AM", "07:00", "7:00AM - 7:55AM"
      const timeStr = startTime.split(' - ')[0].trim(); // Take first part if it's a range
      const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2] || '0');
        const period = timeMatch[3]?.toUpperCase();

        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        bookingDate.setHours(hour, minutes, 0, 0);
      }
    }

    return Math.max(0, (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  };

  const hoursUntilBooking = calculateHoursUntilBooking();

  // Check all conditions for rescheduling (unlimited reschedules allowed)
  const isWithinCancellationWindow = hoursUntilBooking < cancellationWindowHours;

  // Calculate canReschedule locally for real-time accuracy
  // Unlimited reschedules allowed, just check time window and subscription status
  const canReschedule = !isWithinCancellationWindow &&
    !hasCompletedBookingInSubscription;

  const handleProceed = () => {
    // Check if reschedule limit reached
    if (!canReschedule) {
      return;
    }

    // Get booking ID - handle both _id and id properties
    const bookingId = booking._id || (booking as any).id;

    if (!bookingId) {
      console.error('Booking ID not found', booking);
      return;
    }

    // Calculate duration from startTime and endTime if available
    let duration = '60min'; // Default
    if (booking.startTime && booking.endTime) {
      const parseTime = (timeStr: string): number => {
        const match = timeStr.match(/(\d+):(\d+)(AM|PM)?/i);
        if (!match) return 0;
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3]?.toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      const startMinutes = parseTime(booking.startTime);
      const endMinutes = parseTime(booking.endTime);
      const durationMinutes = endMinutes - startMinutes;
      duration = durationMinutes <= 30 ? '30min' : '60min';
    }

    // Store booking info in localStorage for the book-field page to access
    localStorage.setItem('rescheduleBooking', JSON.stringify({
      bookingId: bookingId,
      fieldId: booking.fieldId,
      numberOfDogs: booking.dogs,
      originalDate: booking.rawDate || booking.date,
      originalTime: booking.time,
      recurring: booking.recurring || 'None',
      duration: duration // Store original booking duration
    }));

    // Navigate to book-field page in reschedule mode with recurring parameter
    const recurringValue = booking.recurring || 'None';
    router.push(`/fields/book-field?id=${booking.fieldId}&mode=reschedule&bookingId=${bookingId}&recurring=${encodeURIComponent(recurringValue)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative overflow-visible">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -right-4 -top-4 sm:-right-3 sm:-top-3 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-[#3a6b22]" />
          <h2 className="text-2xl font-bold text-[#192215]">Reschedule Booking</h2>
        </div>

        {/* Current Booking Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-[#192215] mb-2">Current Booking</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p className="font-medium text-base text-[#192215]">{booking.name}</p>
            <p>Date: {booking.date}</p>
            <p>Time: {booking.time}</p>
            <p>Dogs: {booking.dogs}</p>
            <p>Amount: £{booking.price}</p>
            {booking.recurring && booking.recurring.toLowerCase() !== 'none' && (
              <div className="pt-2">
                <span className="inline-flex items-center px-3 py-1.5 bg-[#f4ffef] border border-[#3a6b221a] rounded-full text-[13px] font-bold text-[#3a6b22]">
                  {booking.recurring}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Warning Messages based on why reschedule is not allowed */}
        {!canReschedule ? (
          <>
            {/* Within Cancellation Window Warning */}
            {isWithinCancellationWindow && !hasCompletedBookingInSubscription && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700 font-semibold mb-2">
                      Rescheduling Not Available
                    </p>
                    <p className="text-sm text-red-600">
                      Rescheduling is only allowed at least <strong>{cancellationWindowHours} hours</strong> before the booking time.
                      Your booking is in <strong>{hoursUntilBooking.toFixed(1)} hours</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recurring Booking Completed Warning */}
            {hasCompletedBookingInSubscription && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700 font-semibold mb-2">
                      Rescheduling Not Available
                    </p>
                    <p className="text-sm text-red-600">
                      A booking in this recurring subscription has already been completed.
                      Rescheduling is no longer available for this subscription.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Reschedule Count Info - informational only, no limit */}
            {rescheduleCount > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      This booking has been rescheduled {rescheduleCount} time{rescheduleCount === 1 ? '' : 's'}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> You'll be redirected to select a new date and time slot.
                    Rescheduling is free and maintains your original payment.
                    The same policy ({cancellationWindowHours} hours notice) will apply to the new booking time.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
          >
            {canReschedule ? 'Cancel' : 'Close'}
          </button>
          {canReschedule && (
            <button
              onClick={handleProceed}
              className="flex-1 py-3 px-4 bg-[#3a6b22] text-white rounded-full font-semibold hover:bg-[#2d5319] transition-colors"
            >
              Select New Time
            </button>
          )}
        </div>
      </div>
    </div>
  );
};