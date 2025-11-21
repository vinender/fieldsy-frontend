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
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Field Entry Code</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-6 h-6" />
                    </button>
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
                                } focus:ring-0 focus:outline-none transition-colors font-mono text-lg`}
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
                                    <Spinner size="sm" className="mr-2" />
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
