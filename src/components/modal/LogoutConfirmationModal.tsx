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
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          {/* Content */}
          <div className="text-center mb-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Are you sure you want to log out?
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              You'll be signed out of your Fieldsy account and will need to log in again to access your bookings and saved fields.
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white border border-green text-green font-medium rounded-full hover:bg-green/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 bg-green text-white font-medium rounded-full hover:bg-dark-green transition-colors"
            >
              Yes, I'm sure
            </button>
          </div>
        </div>
      </div>
    </>
  );
};