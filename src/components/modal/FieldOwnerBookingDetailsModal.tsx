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
  status: 'confirmed' | 'completed' | 'cancelled' | 'refunded';
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
  stripeFee?: number;
  amountAfterStripeFee?: number;
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
  // Uses pre-calculated values from API which account for:
  // 1. Stripe processing fee (deducted first)
  // 2. Platform commission (what Fieldsy takes)
  // Total = what field owner receives (remainder after fees)
  const calculateFees = () => {
    const subTotal = booking?.amount || 0; // Booking amount (what customer paid)

    // Use pre-calculated values from API if available
    if (booking?.fieldOwnerEarnings !== undefined && booking?.platformFee !== undefined) {
      return {
        subTotal,
        stripeFee: booking.stripeFee || 0,
        amountAfterStripeFee: booking.amountAfterStripeFee || subTotal,
        fieldsyFee: booking.platformFee, // Platform fee (what Fieldsy keeps)
        total: booking.fieldOwnerEarnings, // What field owner receives
        platformCommissionRate: booking.platformCommissionRate || 20 // Platform commission percentage
      };
    }

    // Fallback calculation if API values not available (shouldn't happen normally)
    const defaultPlatformRate = 20; // Platform takes 20% by default
    const stripeFee = subTotal > 0 ? Math.round(((subTotal * 0.015) + 0.20) * 100) / 100 : 0;
    const amountAfterStripeFee = Math.round((subTotal - stripeFee) * 100) / 100;
    // Platform fee = what Fieldsy takes (commission percentage)
    const platformFee = Math.round((amountAfterStripeFee * defaultPlatformRate) / 100 * 100) / 100;
    // Field owner gets the remainder
    const fieldOwnerEarnings = Math.round((amountAfterStripeFee - platformFee) * 100) / 100;

    return {
      subTotal,
      stripeFee,
      amountAfterStripeFee,
      fieldsyFee: platformFee,
      total: fieldOwnerEarnings,
      platformCommissionRate: defaultPlatformRate
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
          className="absolute -top-12 right-0 sm:-right-12 sm:top-0 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
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
        <div className="bg-white rounded-[32px] shadow-[0px_22px_70px_0px_rgba(0,0,0,0.06)] border border-[rgba(25,34,21,0.1)] flex flex-col max-h-[90vh]">
          <div className="p-6 sm:p-8 overflow-y-auto scrollbar-hide flex-1">
            {booking ? (
              // Success State with Booking Data
              <>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-[48px] h-[48px] rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                      {booking.userAvatar ? (
                        <img
                          src={booking.userAvatar}
                          alt={booking.userName || 'Customer'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-lg font-bold">
                          {(booking.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-0.5">
                      <h2 className="text-xl font-semibold text-[#192215]">
                        {booking.userName || 'Customer'}
                      </h2>
                      <p className="text-sm text-[#192215] opacity-70">
                        {booking.userEmail || 'No email provided'}
                      </p>
                      {booking.userPhone && (
                        <p className="text-xs text-[#192215] opacity-70">
                          {booking.userPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Send Message Button */}
                  <button
                    className="bg-[#3a6b22] hover:bg-[#2d5419] transition-colors text-white font-semibold px-5 py-2.5 rounded-full whitespace-nowrap text-sm"
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
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#192215]">Order Details</h3>
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
                        label="Sub total"
                        value={`£${fees.subTotal.toFixed(2)}`}
                      />
                      <DetailRow
                        label="Stripe Processing Fee"
                        value={`-£${fees.stripeFee.toFixed(2)}`}
                      />
                      <DetailRow
                        label="Net (After Stripe)"
                        value={`£${fees.amountAfterStripeFee.toFixed(2)}`}
                      />
                      <DetailRow
                        label="Fieldsy Fee"
                        value={
                          <span className="flex items-center gap-1">
                            <span>-£{fees.fieldsyFee.toFixed(2)}</span>
                            <span className="text-xs text-gray-500">({fees.platformCommissionRate}%)</span>
                          </span>
                        }
                      />

                      {/* Divider */}
                      <div className="h-px bg-gray-300 my-3" />

                      {/* Total */}
                      <div className="flex justify-between items-start">
                        <span className="text-base font-bold text-[#192215]">
                          Total (You Receive)
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#3a6b22]">
                            £{fees.total.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">({100 - fees.platformCommissionRate}%)</span>
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