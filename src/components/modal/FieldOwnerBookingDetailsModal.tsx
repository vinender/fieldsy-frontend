'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { formatDateDDMMYYYY } from '@/utils/formatters';

interface Booking {
  id: string;
  userName: string;
  userAvatar?: string;
  time: string;
  orderId: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'refunded' | 'pending';
  frequency?: string;
  dogs: number;
  amount: number;
  date: string;
  userEmail?: string;
  userPhone?: string;
  fieldName?: string;
  fieldAddress?: string;
  notes?: string;
  rescheduleCount?: number;
  userId?: string;
  fieldId?: string;
  // Fee breakdown from API
  platformCommissionRate?: number; // Platform fee percentage (what Fieldsy takes)
  isCustomCommission?: boolean; // Whether admin has set a custom commission for this field owner
  defaultCommissionRate?: number; // The default platform commission rate
  fieldOwnerEarnings?: number; // What field owner receives
  platformFee?: number; // What Fieldsy keeps
}

interface FieldOwnerBookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const FieldOwnerBookingDetailsModal: React.FC<FieldOwnerBookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  // Format date and time
  const formatBookingDateTime = () => {
    if (!booking) return 'N/A';

    try {
      if (booking.date) {
        const date = new Date(booking.date);
        const dayName = format(date, 'EEEE');
        const formattedDate = formatDateDDMMYYYY(date);
        return `${dayName}, ${formattedDate} · ${booking.time || ''}`;
      }
      return booking.time || 'N/A';
    } catch {
      return booking.time || 'N/A';
    }
  };

  // Calculate fees - field owner perspective
  const calculateFees = () => {
    const subTotal = booking?.amount || 0; // Booking amount (what customer paid)
    // Check if we have locked/stored values from backend
    const storedFieldOwnerEarnings = booking?.fieldOwnerEarnings;
    const storedPlatformFee = booking?.platformFee;

    const platformCommissionRate = booking?.platformCommissionRate || 20; // Default 20% platform commission
    const isCustomCommission = booking?.isCustomCommission || false;
    const defaultCommissionRate = booking?.defaultCommissionRate || 20;

    // Helper ensures we deal with money properly (2 decimals, truncated not rounded)
    const toCurrency = (amount: number) => {
      return Math.floor(amount * 100) / 100;
    };

    // Calculate Stripe fee (1.5% + £0.20) - Informational only
    // We calculate this with precision then round to 2 decimals
    const stripeFee = subTotal > 0 ? toCurrency((subTotal * 0.015) + 0.20) : 0;

    let platformFee = 0;
    let fieldOwnerEarnings = 0;

    // Calculate Net (Amount after Stripe fee) - Basis for commission
    const amountAfterStripeFee = toCurrency(subTotal - stripeFee);

    if (storedPlatformFee !== undefined && storedFieldOwnerEarnings !== undefined) {
      // Use values provided by backend (especially for completed/locked bookings)
      platformFee = storedPlatformFee;
      fieldOwnerEarnings = storedFieldOwnerEarnings;
    } else {
      // Dynamic calculation for pending/future bookings
      // Platform fee is calculated on NET amount (after Stripe fee)
      platformFee = toCurrency((amountAfterStripeFee * platformCommissionRate) / 100);

      // Field owner gets the remaining net amount after platform commission
      // Owner Amount = Net (after Stripe) - PlatformCommission
      const rawEarnings = amountAfterStripeFee - platformFee;
      fieldOwnerEarnings = Math.max(0, toCurrency(rawEarnings));
    }

    return {
      subTotal,
      stripeFee,
      amountAfterStripeFee,
      fieldsyFee: platformFee,
      total: fieldOwnerEarnings,
      platformCommissionRate,
      isCustomCommission,
      defaultCommissionRate
    };
  };

  const fees = calculateFees();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-[800px] mx-4 transition-all duration-300 transform ${isVisible ? 'scale-100' : 'scale-95'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-4 sm:-right-12 sm:top-0 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors z-50 shadow-md"
          aria-label="Close modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-[0px_22px_70px_0px_rgba(0,0,0,0.06)] border border-[rgba(25,34,21,0.1)] flex flex-col max-h-[85vh] sm:max-h-[90vh]">
          <div className="p-5 sm:p-8 overflow-y-auto scrollbar-hide flex-1">
            {booking ? (
              // Success State with Booking Data
              <>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                      {booking.userAvatar ? (
                        <img
                          src={booking.userAvatar}
                          alt={booking.userName || 'Customer'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-base sm:text-lg font-bold">
                          {(booking.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-0.5 min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-[#192215] truncate">
                        {booking.userName || 'Customer'}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#192215] opacity-70 truncate">
                        {booking.userEmail || 'No email provided'}
                      </p>
                      {booking.userPhone && (
                        <p className="text-[10px] sm:text-xs text-[#192215] opacity-70">
                          {booking.userPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Send Message Button */}
                  <button
                    className="w-full sm:w-auto bg-[#3a6b22] hover:bg-[#2d5419] transition-colors text-white font-semibold px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap text-xs sm:text-sm"
                    onClick={() => {
                      if (booking.userId) {
                        onClose();
                        // Use query param for direct linking which is handled by messages page
                        // Also set sessionStorage as backup/intent
                        sessionStorage.setItem('messageIntentUserId', booking.userId);
                        if (booking.fieldId) {
                          sessionStorage.setItem('messageIntentFieldId', booking.fieldId);
                        }
                        router.push(`/user/messages?userId=${booking.userId}`);
                      }
                    }}
                  >
                    Send Message
                  </button>
                </div>

                {/* Order Details Section */}
                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#192215]">Order Details</h3>
                    <div className="bg-white border border-black/5 rounded-[14px] p-3 space-y-2.5">
                      <DetailRow
                        label="Order ID"
                        value={booking.orderId || `#${booking.id?.slice(-6).toUpperCase() || 'N/A'}`}
                      />
                      <DetailRow
                        label="Booking date & time"
                        value={formatBookingDateTime()}
                      />
                      <DetailRow
                        label="Recurring booking"
                        value={booking.frequency || 'NA'}
                      />
                      <DetailRow
                        label="Number of Dogs"
                        value={`${booking.dogs || 1} Dog${(booking.dogs || 1) > 1 ? 's' : ''}`}
                      />
                      <DetailRow
                        label="Status"
                        value={
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-[#3A6B22] text-white' :
                            booking.status === 'completed' ? 'bg-green text-white' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  booking.status === 'refunded' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                            }`}>
                            {booking.status?.toUpperCase()}
                          </span>
                        }
                      />
                      {/* Rescheduled Count Row */}
                      {booking.rescheduleCount && booking.rescheduleCount > 0 ? (
                        <DetailRow
                          label="Rescheduled"
                          value={
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#fff4e6] text-[#ff9800] border border-[#ff9800]/20">
                              {booking.rescheduleCount} time{booking.rescheduleCount > 1 ? 's' : ''}
                            </span>
                          }
                        />
                      ) : ''}
                    </div>
                  </div>

                  {/* Field Information */}
                  {booking.fieldName && (
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-[#192215]">Field Information</h3>
                      <div className="bg-white border border-black/5 rounded-[14px] p-3 space-y-2.5">
                        <DetailRow
                          label="Field Name"
                          value={booking.fieldName || 'N/A'}
                        />
                        {booking.fieldAddress && (
                          <DetailRow
                            label="Location"
                            value={booking.fieldAddress}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Summary Section */}
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#192215]">Order Summary</h3>
                    <div className="bg-white border border-black/5 rounded-[14px] p-3 space-y-2.5">
                      <DetailRow
                        label="Booking Amount"
                        value={`£${fees.subTotal.toFixed(2)}`}
                      />
                      <DetailRow
                        label="Stripe Processing Fee"
                        value={
                          <span className="flex items-center gap-1">
                            <span className="text-gray-500">£{fees.stripeFee.toFixed(2)}</span>
                            <span className="text-xs text-gray-400">(Included in Fieldsy Fee)</span>
                          </span>
                        }
                      />
                      {/* Net row restored */}
                      <DetailRow
                        label="Net (After Stripe)"
                        value={`£${fees.amountAfterStripeFee.toFixed(2)}`}
                      />

                      <DetailRow
                        label="Fieldsy Fee"
                        value={
                          <span className="flex items-center gap-1">
                            <span className="text-red-600">-£{fees.fieldsyFee.toFixed(2)}</span>
                            <span className="text-xs text-gray-500">
                              ({fees.platformCommissionRate}% of net{fees.isCustomCommission ? ' - Custom Rate' : ''})
                            </span>
                          </span>
                        }
                      />

                      {/* Divider */}
                      <div className="h-px bg-gray-300 my-3" />

                      {/* Total */}
                      <div className="flex justify-between items-center sm:items-start pt-1">
                        <span className="text-sm sm:text-base font-bold text-[#192215]">
                          Your Earnings
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-base sm:text-lg font-bold text-[#3a6b22]">
                            £{fees.total.toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes if available */}
                  {booking.notes && (
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-[#192215]">Notes</h3>
                      <div className="bg-white border border-black/5 rounded-[14px] p-3">
                        <p className="text-sm text-[#192215] opacity-70">{booking.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Empty State
              <div className="text-center py-12">
                <p className="text-gray-500">No booking details available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Detail Row Component
const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-start">
    <span className="text-sm text-[#192215] opacity-70">
      {label}
    </span>
    <span className="text-sm font-semibold text-[#192215]">
      {value}
    </span>
  </div>
);

export default FieldOwnerBookingDetailsModal;