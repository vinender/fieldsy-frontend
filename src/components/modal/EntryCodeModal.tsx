import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

interface EntryCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (code: string) => void;
    initialEntryCode?: string;
    isLoading?: boolean;
}

export const EntryCodeModal: React.FC<EntryCodeModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialEntryCode = '',
    isLoading = false,
}) => {
    const [entryCode, setEntryCode] = useState(initialEntryCode);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setEntryCode(initialEntryCode || '');
            setError('');
        }
    }, [isOpen, initialEntryCode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow numbers
        if (/^\d*$/.test(value)) {
            setEntryCode(value);
            setError('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate length (3-10 characters)
        if (entryCode.length < 3) {
            setError('Entry code must be at least 3 digits');
            return;
        }
        if (entryCode.length > 10) {
            setError('Entry code must be at most 10 digits');
            return;
        }

        onConfirm(entryCode);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-visible">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -right-4 -top-4 sm:-right-3 sm:-top-3 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </button>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Field Entry Code</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Entry Code
                        </label>
                        <input
                            type="text"
                            value={entryCode}
                            onChange={handleInputChange}
                            placeholder="Enter code (3-10 digits)"
                            className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green'
                                } focus:ring-0 focus:outline-none  bg-white transition-colors font-mono text-lg`}
                            disabled={isLoading}
                            maxLength={10}
                        />
                        {error ? (
                            <p className="mt-2 text-sm text-red-500">{error}</p>
                        ) : (
                            <p className="mt-2 text-xs text-gray-500">
                                Enter a numeric code between 3 and 10 digits. This code will be shared with customers.
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-green text-white font-medium rounded-xl hover:bg-green/90 transition-colors flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" inline className="mr-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Code'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
