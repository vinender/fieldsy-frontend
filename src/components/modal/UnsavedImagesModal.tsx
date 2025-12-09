import React from 'react';
import { AlertCircle } from 'lucide-react';

interface UnsavedImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
  imageCount: number;
  hasMinimumImages: boolean; // Whether user has uploaded at least 4 images
}

export function UnsavedImagesModal({
  isOpen,
  onClose,
  onSave,
  onDiscard,
  imageCount,
  hasMinimumImages
}: UnsavedImagesModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6 relative overflow-visible"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -right-4 -top-4 sm:-right-3 sm:-top-3 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon and Title */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-dark-green mb-2">
                Unsaved Images
              </h3>
              <p className="text-gray-600 text-sm">
                {hasMinimumImages
                  ? `You have uploaded ${imageCount} image${imageCount > 1 ? 's' : ''} but haven't saved them yet. Would you like to save these images before continuing?`
                  : `You have uploaded ${imageCount} image${imageCount > 1 ? 's' : ''} but need at least 4 images. These images will be deleted if you continue without saving.`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {hasMinimumImages && (
              <button
                onClick={onSave}
                className="w-full py-3 px-4 bg-[#3A6B22] text-white rounded-full font-semibold hover:bg-[#2D5A1B] transition-colors"
              >
                Save Images
              </button>
            )}
            <button
              onClick={onDiscard}
              className={`w-full py-3 px-4 rounded-full font-semibold transition-colors ${
                hasMinimumImages
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-[#3A6B22] text-white hover:bg-[#2D5A1B]'
              }`}
            >
              {hasMinimumImages ? 'Discard & Continue' : 'Continue Without Saving'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 border border-gray-300 rounded-full font-semibold text-dark-green hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
