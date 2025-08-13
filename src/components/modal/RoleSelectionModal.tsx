import React from 'react';
import { X } from 'lucide-react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'DOG_OWNER' | 'FIELD_OWNER') => void;
  isLoading?: boolean;
}

export function RoleSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectRole,
  isLoading = false 
}: RoleSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 relative animate-in fade-in zoom-in duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Modal content */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🐾</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Choose Your Role
            </h2>
            <p className="text-gray-600">
              Select how you'll be using Fieldsy
            </p>
          </div>

          {/* Role selection buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onSelectRole('DOG_OWNER')}
              disabled={isLoading}
              className="w-full group relative overflow-hidden rounded-2xl border-2 border-gray-200 hover:border-green transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green/20 transition-colors">
                  <img src="/login/dog-owner.svg" alt="Dog Owner" className="w-8 h-8" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Dog Owner</h3>
                  <p className="text-sm text-gray-600">
                    Search and book secure fields for your dog to enjoy off-lead freedom
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-green group-hover:bg-green transition-colors flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelectRole('FIELD_OWNER')}
              disabled={isLoading}
              className="w-full group relative overflow-hidden rounded-2xl border-2 border-gray-200 hover:border-green transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green/20 transition-colors">
                  <img src="/login/field-owner.svg" alt="Field Owner" className="w-8 h-8" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Field Owner</h3>
                  <p className="text-sm text-gray-600">
                    List your fields and manage bookings to earn from your outdoor space
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-green group-hover:bg-green transition-colors flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </button>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 rounded-3xl flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Info text */}
          <p className="text-xs text-gray-500 text-center mt-6">
            You can update your role later in your profile settings
          </p>
        </div>
      </div>
    </>
  );
}