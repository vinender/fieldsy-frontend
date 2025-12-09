import React from 'react';
import { X, AlertCircle, Calendar } from 'lucide-react';
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
  };
  onConfirm: (bookingId: string, newDate: string, newStartTime: string, newEndTime: string) => void;
}

export const RescheduleBookingModal: React.FC<RescheduleBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const router = useRouter();
  const cancellationWindow = useCancellationWindow();
  const rescheduleCount = booking.rescheduleCount || 0;
  const remainingReschedules = 3 - rescheduleCount;
  const canReschedule = rescheduleCount < 3;

  console.log('booking',booking)
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

    // Store booking info in localStorage for the book-field page to access
    localStorage.setItem('rescheduleBooking', JSON.stringify({
      bookingId: bookingId,
      fieldId: booking.fieldId,
      numberOfDogs: booking.dogs,
      originalDate: booking.rawDate || booking.date,
      originalTime: booking.time,
      recurring: booking.recurring || 'None'
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

        {/* Reschedule Limit Warning */}
        {!canReschedule ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-semibold mb-2">
                  Maximum Reschedule Limit Reached
                </p>
                <p className="text-sm text-red-600">
                  You have already rescheduled this booking 3 times, which is the maximum allowed.
                  If you need to change the booking time, please cancel this booking and create a new one.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Reschedule Count Info */}
            {rescheduleCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-700">
                      <strong>Reschedules Used:</strong> {rescheduleCount} of 3
                      {remainingReschedules > 0 && (
                        <span className="block mt-1">
                          You have {remainingReschedules} reschedule{remainingReschedules === 1 ? '' : 's'} remaining for this booking.
                        </span>
                      )}
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
                    The same cancellation policy ({cancellationWindow} hours notice) will apply to the new booking time.
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