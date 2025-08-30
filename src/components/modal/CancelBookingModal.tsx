import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useCheckRefundEligibility } from '@/hooks/useBookingApi';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    _id: string;
    name: string;
    date: string;
    time: string;
    rawDate?: string; // Raw ISO date for calculations
    startTime?: string; // Raw start time (e.g., "8:00AM")
    price: number;
    currency: string;
    createdAt: string;
  };
  onConfirm: (bookingId: string, reason: string) => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Use React Query hook to check refund eligibility
  const { 
    data: eligibilityData, 
    isLoading: checkingEligibility,
    error: eligibilityError 
  } = useCheckRefundEligibility(booking?._id || '', isOpen);
  
  // State for fallback calculation
  const [fallbackEligible, setFallbackEligible] = useState<boolean | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState('');
  
  // Use API data if available, otherwise use fallback
  const isRefundEligible = eligibilityData?.data?.isRefundEligible ?? fallbackEligible;
  const refundMessage = eligibilityData?.data?.message ?? fallbackMessage;

  useEffect(() => {
    // Only calculate fallback if API call fails
    if (isOpen && booking && eligibilityError) {
      console.error('API error, using fallback calculation:', eligibilityError);
      // Calculate eligibility client-side as fallback
      const bookingCreatedAt = new Date(booking.createdAt);
      
      // Use rawDate if available, otherwise parse the display date
      let bookingDateTime: Date;
      
      if (booking.rawDate) {
        // Use the raw ISO date from backend
        bookingDateTime = new Date(booking.rawDate);
      } else if (booking.date.includes('T')) {
        // ISO format
        bookingDateTime = new Date(booking.date);
      } else {
        // Parse date string like "1 Sep 2025", "1 Sept 2025", etc.
        // First normalize month abbreviations
        let normalizedDate = booking.date
          .replace(/Sept/i, 'Sep')
          .replace(/July/i, 'Jul')
          .replace(/June/i, 'Jun');
        
        // Try different parsing approaches
        // Format: "1 Sep 2025" -> "Sep 1, 2025"
        const dateStr = normalizedDate.replace(/(\d{1,2})\s+(\w{3,})\s+(\d{4})/, '$2 $1, $3');
        bookingDateTime = new Date(dateStr);
        
        // If still invalid, try parsing as is
        if (isNaN(bookingDateTime.getTime())) {
          bookingDateTime = new Date(booking.date);
        }
        
        // If still invalid, manually parse
        if (isNaN(bookingDateTime.getTime())) {
          const parts = booking.date.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
          if (parts) {
            const day = parseInt(parts[1]);
            const year = parseInt(parts[3]);
            const monthStr = parts[2].toLowerCase();
            const months: {[key: string]: number} = {
              'jan': 0, 'january': 0,
              'feb': 1, 'february': 1,
              'mar': 2, 'march': 2,
              'apr': 3, 'april': 3,
              'may': 4,
              'jun': 5, 'june': 5,
              'jul': 6, 'july': 6,
              'aug': 7, 'august': 7,
              'sep': 8, 'sept': 8, 'september': 8,
              'oct': 9, 'october': 9,
              'nov': 10, 'november': 10,
              'dec': 11, 'december': 11
            };
            const month = months[monthStr] ?? months[monthStr.substring(0, 3)];
            if (month !== undefined) {
              bookingDateTime = new Date(year, month, day);
            }
          }
        }
      }
      
      // Use startTime if available, otherwise extract from time slot
      let startTimeStr = booking.startTime;
      if (!startTimeStr) {
        // Extract from time slot (e.g., "8:00AM - 9:00AM" -> "8:00AM")
        const match = booking.time.match(/(\d+:\d+\s*(?:AM|PM))/i);
        if (match) {
          startTimeStr = match[1];
        }
      }
      
      // Parse and set the time
      if (startTimeStr) {
        const timeMatch = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const period = timeMatch[3].toUpperCase();
          
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          bookingDateTime.setHours(hours, minutes, 0, 0);
        }
      }
      
      console.log('=== Client-side Refund Check ===');
      console.log('Raw booking data:', {
        date: booking.date,
        rawDate: booking.rawDate,
        time: booking.time,
        startTime: booking.startTime,
        createdAt: booking.createdAt
      });
      console.log('Created at:', bookingCreatedAt);
      console.log('Created at ISO:', bookingCreatedAt.toISOString());
      console.log('Booking date/time:', bookingDateTime);
      console.log('Booking date/time ISO:', bookingDateTime.toISOString());
      console.log('Created timestamp:', bookingCreatedAt.getTime());
      console.log('Booking timestamp:', bookingDateTime.getTime());
      
      const hoursGap = (bookingDateTime.getTime() - bookingCreatedAt.getTime()) / (1000 * 60 * 60);
      const eligible = hoursGap >= 24;
      
      console.log('Hours gap:', hoursGap);
      console.log('Is eligible:', eligible);
      console.log('=========================');
      
      setFallbackEligible(eligible);
      setFallbackMessage(
        eligible
          ? `This booking is eligible for a full refund. The booking was made ${Math.floor(hoursGap)} hours in advance.`
          : `This booking is not eligible for a refund. Bookings must be made at least 24 hours in advance. This booking was made only ${Math.floor(Math.abs(hoursGap))} hours before the scheduled time.`
      );
    }
  }, [isOpen, booking, eligibilityError]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(booking._id, reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#192215] mb-4">Cancel Booking</h2>

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-[#192215] mb-2">{booking.name}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Date: {booking.date}</p>
            <p>Time: {booking.time}</p>
            <p>Amount: {booking.currency}{booking.price}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-[#192215] mb-2">Booked On</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Date: {booking.createdAt.split('T')[0]}</p>
          
          </div>
        </div>

        {/* Refund Eligibility Status */}
        {checkingEligibility ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3a6b22]"></div>
          </div>
        ) : (
          <div className={`rounded-xl p-4 mb-4 ${
            isRefundEligible 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              {isRefundEligible ? (
                <CheckCircle className="w-5 h-5 text-green mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${
                  isRefundEligible ? 'text-green' : 'text-yellow-900'
                }`}>
                  {isRefundEligible ? 'Eligible for Refund' : 'Not Eligible for Refund'}
                </h4>
                <p className={`text-sm ${
                  isRefundEligible ? 'text-green' : 'text-yellow-700'
                }`}>
                  {refundMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#192215] mb-2">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us why you're cancelling..."
            className="w-full px-4 py-3 bg-white text-[#192215] border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-[#3a6b22] focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
          <p className="text-sm text-red-700">
            <strong>Warning:</strong> This action cannot be undone. Once cancelled, you'll need to make a new booking if you change your mind.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-[#3a6b22] text-white rounded-full font-semibold hover:bg-[#2d5319] transition-colors disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || checkingEligibility}
            className="flex-1 py-3 px-4 bg-white border-2 border-red-600 text-red-600 rounded-full font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>

        {/* 24-Hour Policy Note */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
          <Clock className="w-4 h-4 mt-0.5" />
          <p>
            Our 24-hour advance booking policy: Only bookings made at least 24 hours in advance are eligible for refunds upon cancellation. 
            If you book less than 24 hours before your scheduled time, the booking is non-refundable.
          </p>
        </div>
      </div>
    </div>
  );
};