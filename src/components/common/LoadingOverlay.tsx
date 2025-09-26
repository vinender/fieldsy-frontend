import React from 'react';
import GreenSpinner from './GreenSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
        <GreenSpinner size="large" />
        {message && (
          <p className="text-sm text-gray-600 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;