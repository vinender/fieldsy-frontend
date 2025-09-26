import React from 'react';

interface GreenSpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'full-screen';
  className?: string;
}

const GreenSpinner: React.FC<GreenSpinnerProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-8 h-8 border-4',
    'full-screen': 'w-8 h-8 border-4'
  };

  if (size === 'full-screen') {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="bg-transparent rounded-lg p-6 shadow-xl">
          <div className={`${sizeClasses[size]} border-gray-200 border-t-green rounded-full animate-spin`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} border-gray-200 border-t-green rounded-full animate-spin ${className}`} />
  );
};

export default GreenSpinner;    