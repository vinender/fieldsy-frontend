import React from 'react';
import { X, AlertCircle, Power } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

interface ToggleFieldStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: {
    id: string;
    name: string;
    isActive: boolean;
  };
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ToggleFieldStatusModal: React.FC<ToggleFieldStatusModalProps> = ({
  isOpen,
  onClose,
  field,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const isDisabling = field.isActive;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md relative overflow-visible">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 rounded-2xl sm:rounded-3xl flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green/20 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner size="md" />
                </div>
              </div>
              <p className="text-sm sm:text-base font-semibold text-[#192215]">
                {isDisabling ? 'Disabling field...' : 'Enabling field...'}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Please wait</p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute -right-4 -top-4 sm:-right-3 sm:-top-3 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
        </button>

        {/* Modal Content */}
        <div className="p-5 sm:p-6">
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#192215] mb-3 sm:mb-4 pr-8">
            {isDisabling ? 'Disable Field' : 'Enable Field'}
          </h2>

          {/* Field Details */}
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                isDisabling ? 'bg-red-100' : 'bg-green/10'
              }`}>
                <Power className={`w-5 h-5 ${
                  isDisabling ? 'text-red-600' : 'text-green'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-[#192215] mb-1">
                  {field.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Current Status: <span className={`font-medium ${
                    field.isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {field.isActive ? 'Active' : 'Disabled'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Warning/Info Message */}
          <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 ${
            isDisabling
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${
                isDisabling ? 'text-yellow-600' : 'text-green'
              }`} />
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm sm:text-base mb-1 ${
                  isDisabling ? 'text-yellow-900' : 'text-green'
                }`}>
                  {isDisabling ? 'Are you sure?' : 'Confirm Activation'}
                </h4>
                <p className={`text-xs sm:text-sm ${
                  isDisabling ? 'text-yellow-700' : 'text-green'
                }`}>
                  {isDisabling
                    ? 'Disabling this field will hide it from public listings and prevent new bookings. Existing bookings will not be affected.'
                    : 'Enabling this field will make it visible in public listings and available for new bookings.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                isDisabling
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green text-white hover:bg-green/90'
              }`}
            >
              {isDisabling ? 'Disable Field' : 'Enable Field'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
