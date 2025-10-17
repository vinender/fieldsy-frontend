import React from 'react';
import Image from 'next/image';

interface ThankYouModalProps {
  isOpen: boolean;
  onGoHome: () => void;
  onPreviewListing?: () => void;
  onClose?: () => void;
}

export default function ThankYouModal({ isOpen, onGoHome, onPreviewListing, onClose }: ThankYouModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose || onGoHome}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
        {/* Success Icon */}
        <div className="flex items-center justify-center mx-auto mb-6">
          <Image
            src="/field-submit.svg"
            alt="Success"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-dark-green mb-3">
          Thank you for sharing your space with Fieldsy!
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Your listing has been successfully submitted and is now under review to ensure it meets our platform standards. We'll notify you as soon as it's live and ready for bookings.
        </p>

        {/* Actions */}
        <div className="flex justify-center">
          <button
            onClick={onGoHome}
            className="w-full max-w-xs py-3 rounded-full bg-green text-white font-semibold transition-opacity hover:opacity-90"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}