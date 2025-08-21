import React, { useState } from 'react';
import { X } from 'lucide-react';

export const BookingSuccessModal = ({ isOpen = true, onClose, onCheckHistory, onGoHome }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="relative bg-white rounded-[32px] w-full max-w-[800px] h-[546px] border border-[#192215]/10 shadow-[0px_22px_70px_0px_rgba(0,0,0,0.06)]">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-12 -right-12 lg:top-4 lg:right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#192215]/10 shadow-[0px_6px_16px_0px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors z-10"
          >
            <X className="w-6 h-6 text-[#192215]" />
          </button>

          {/* Modal Content */}
          <div className="relative h-full flex flex-col items-center justify-between p-8 lg:p-10">
            
            {/* Illustration */}
            <div className="flex-1 flex items-center justify-center w-full max-w-[400px] mx-auto">
              <img 
                src="/modal/walking-dog.svg"
                alt="Person walking dog illustration"
                className="w-full h-auto max-h-[250px] object-contain"
              />
            </div>

            {/* Text Content */}
            <div className="space-y-8 text-center w-full max-w-[592px] mx-auto">
              <div className="space-y-4">
                <h2 className="text-[40px] font-bold text-black leading-[40px]">
                  Your Field is Booked!
                </h2>
                <p className="text-[18px] text-[#8D8D8D] leading-[24px]">
                  You're all set. We've sent a confirmation email with your booking details.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 w-full">
                <button
                  onClick={onCheckHistory}
                  className="flex-1 h-14 px-6 border-2 border-[#3A6B22] text-[#3A6B22] rounded-full font-bold text-[16px] hover:bg-[#3A6B22] hover:text-white transition-colors"
                >
                  Check Booking History
                </button>
                <button
                  onClick={onGoHome}
                  className="flex-1 h-14 px-6 bg-[#3A6B22] text-white rounded-full font-bold text-[16px] hover:bg-[#2D5A1B] transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
