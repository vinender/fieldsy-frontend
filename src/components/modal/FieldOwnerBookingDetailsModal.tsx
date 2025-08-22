'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

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
        const formattedDate = format(date, 'dd MMM');
        return `${dayName}, ${formattedDate} · ${booking.time || ''}`;
      }
      return booking.time || 'N/A';
    } catch {
      return booking.time || 'N/A';
    }
  };

  // Calculate fees (you may need to adjust based on your business logic)
  const calculateFees = () => {
    const subTotal = booking?.amount || 0;
    const fieldsyFee = subTotal * 0.1; // 10% fee, adjust as needed
    const total = subTotal + fieldsyFee;
    
    return {
      subTotal,
      fieldsyFee,
      total
    };
  };

  const fees = calculateFees();

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" />
      
      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-[800px] mx-4 transition-all duration-300 transform ${
          isVisible ? 'scale-100' : 'scale-95'
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
        <div className="bg-white rounded-[32px] shadow-[0px_22px_70px_0px_rgba(0,0,0,0.06)] border border-[rgba(25,34,21,0.1)] max-h-[90vh] overflow-y-auto">
          <div className="p-8 sm:p-10">
            {booking ? (
              // Success State with Booking Data
              <>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-[60px] h-[60px] rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                      {booking.userAvatar ? (
                        <img 
                          src={booking.userAvatar} 
                          alt={booking.userName || 'Customer'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold">
                          {(booking.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {/* Customer Info */}
                    <div className="space-y-1">
                      <h2 className="text-[29px] font-semibold text-[#192215]">
                        {booking.userName || 'Customer'}
                      </h2>
                      <p className="text-base text-[#192215] opacity-70">
                        {booking.userEmail || 'No email provided'}
                      </p>
                      {booking.userPhone && (
                        <p className="text-sm text-[#192215] opacity-70">
                          {booking.userPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Send Message Button */}
                  <button 
                    className="bg-[#3a6b22] hover:bg-[#2d5419] transition-colors text-white font-semibold px-6 py-4 rounded-full whitespace-nowrap"
                    onClick={() => {
                      // Add your message functionality here
                      console.log('Send message to user:', booking.id);
                    }}
                  >
                    Send Message
                  </button>
                </div>

                {/* Order Details Section */}
                <div className="space-y-8">
                  <div className="space-y-2.5">
                    <h3 className="text-lg font-bold text-[#192215]">Order Details</h3>
                    <div className="bg-white border border-black/5 rounded-[14px] p-4 space-y-3">
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
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            booking.status === 'refunded' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status?.toUpperCase()}
                          </span>
                        } 
                      />
                    </div>
                  </div>

                  {/* Field Information */}
                  {booking.fieldName && (
                    <div className="space-y-2.5">
                      <h3 className="text-lg font-bold text-[#192215]">Field Information</h3>
                      <div className="bg-white border border-black/5 rounded-[14px] p-4 space-y-3">
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
                  <div className="space-y-2.5">
                    <h3 className="text-lg font-bold text-[#192215]">Order Summary</h3>
                    <div className="bg-white border border-black/5 rounded-[14px] p-4 space-y-3">
                      <DetailRow 
                        label="Sub total" 
                        value={`$${fees.subTotal.toFixed(2)}`} 
                      />
                      <DetailRow 
                        label="Fieldsy Fee" 
                        value={`$${fees.fieldsyFee.toFixed(2)}`} 
                      />
                      
                      {/* Divider */}
                      <div className="h-px bg-gray-300 my-3" />
                      
                      {/* Total */}
                      <div className="flex justify-between items-start">
                        <span className="text-base font-bold text-[#192215]">
                          Total
                        </span>
                        <span className="text-lg font-bold text-[#3a6b22]">
                          ${fees.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes if available */}
                  {booking.notes && (
                    <div className="space-y-2.5">
                      <h3 className="text-lg font-bold text-[#192215]">Notes</h3>
                      <div className="bg-white border border-black/5 rounded-[14px] p-4">
                        <p className="text-[#192215] opacity-70">{booking.notes}</p>
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
    <span className="text-base text-[#192215] opacity-70">
      {label}
    </span>
    <span className="text-base font-semibold text-[#192215]">
      {value}
    </span>
  </div>
);

export default FieldOwnerBookingDetailsModal;