import React from 'react';
import { X, AlertCircle, Calendar } from 'lucide-react';
import { useRouter } from 'next/router';

interface RescheduleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    _id: string;
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
  };
  onConfirm: (bookingId: string, newDate: string, newStartTime: string, newEndTime: string) => void;
}

export const RescheduleBookingModal: React.FC<RescheduleBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const router = useRouter();

  const handleProceed = () => {
    // Store booking info in localStorage for the book-field page to access
    localStorage.setItem('rescheduleBooking', JSON.stringify({
      bookingId: booking._id,
      fieldId: booking.fieldId,
      numberOfDogs: booking.dogs,
      originalDate: booking.rawDate || booking.date,
      originalTime: booking.time
    }));
    
    // Navigate to book-field page in reschedule mode
    router.push(`/fields/book-field?id=${booking.fieldId}&mode=reschedule&bookingId=${booking._id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
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
            <p>Amount: {booking.currency}{booking.price}</p>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> You'll be redirected to select a new date and time slot. 
                Rescheduling is free and maintains your original payment. 
                The same cancellation policy (24 hours notice) will apply to the new booking time.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            className="flex-1 py-3 px-4 bg-[#3a6b22] text-white rounded-full font-semibold hover:bg-[#2d5319] transition-colors"
          >
            Select New Time
          </button>
        </div>
      </div>
    </div>
  );
};