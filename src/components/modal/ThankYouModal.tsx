import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ThankYouModalProps {
  isOpen: boolean;
  onGoHome: () => void;
  onPreviewListing: () => void;
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
        <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green" />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-dark-green mb-3">
          Thank You!
        </h2>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          Your field has been successfully submitted for review. 
          We'll notify you via email once it's approved and live on the platform.
        </p>
        
        {/* Additional Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            <strong>What's next?</strong><br />
            Our team will review your submission within 24-48 hours. 
            You can track the status in your dashboard.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={onGoHome}
            className="w-full py-3 rounded-full bg-green text-white font-semibold transition-opacity hover:opacity-90"
          >
            Go to Home
          </button>
          <button
            onClick={onPreviewListing}
            className="w-full py-3 rounded-full border-2 border-green text-green font-semibold transition-colors hover:bg-gray-50"
          >
            Preview My Listing
          </button>
        </div>
      </div>
    </div>
  );
}