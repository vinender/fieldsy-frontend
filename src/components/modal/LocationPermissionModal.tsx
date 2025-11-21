import React from 'react';
import { X, MapPin } from 'lucide-react';

interface LocationPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>

                {/* Modal Content */}
                <div className="p-5 sm:p-6 text-center">
                    <div className="w-16 h-16 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-green" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-[#192215] mb-3">
                        Use your location?
                    </h2>

                    <p className="text-gray-600 mb-8">
                        Fieldsy needs access to your location to show you the best dog fields nearby.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                        >
                            Not Now
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-green text-white rounded-full font-semibold hover:bg-green/90 transition-colors text-sm sm:text-base"
                        >
                            Allow
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
