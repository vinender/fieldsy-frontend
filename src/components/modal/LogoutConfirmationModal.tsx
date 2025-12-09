import React from 'react';
import { X } from 'lucide-react';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[32px] px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10 shadow-xl relative w-full max-w-2xl overflow-visible">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -right-4 -top-4 sm:-right-3 sm:-top-3 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>

          {/* Content */}
          <div className="text-center mb-4 sm:mb-6 mt-2 sm:mt-4 pr-6 sm:pr-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
              Are you sure you want to log out?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-[18px] font-normal text-gray-500 leading-relaxed sm:leading-7">
              You'll be signed out of your Fieldsy account and will need to log in again to access your bookings and saved fields.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-white border-2 border-green text-green text-sm sm:text-base font-bold rounded-full hover:bg-green/5 transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-green text-white text-sm sm:text-base font-bold rounded-full hover:bg-dark-green transition-colors order-1 sm:order-2"
            >
              Yes, I'm sure
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
