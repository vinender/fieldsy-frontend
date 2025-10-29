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
    'full-screen': 'w-16 h-16 border-4'
  };

  // Prevent any clicks from going through for full-screen spinner
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (size === 'full-screen') {
    return (
      <div
        className="fixed inset-0 bg-gradient-to-br from-cream via-light-cream to-cream z-[9999] flex flex-col items-center justify-center cursor-wait"
        onClick={handleClick}
        onMouseDown={handleClick}
        onMouseUp={handleClick}
        onTouchStart={handleClick}
        onTouchEnd={handleClick}
      >
        <div className="pointer-events-none select-none text-center">
          {/* Logo/Brand */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="text-5xl animate-bounce">🐾</span>
            <h1 className="text-4xl font-bold text-green">Fieldsy</h1>
          </div>

          {/* Animated Spinner */}
          <div className="relative flex items-center justify-center mb-6">
            {/* Outer ring */}
            <div className="absolute w-24 h-24 border-4 border-green/20 rounded-full"></div>

            {/* Middle ring */}
            <div className="absolute w-20 h-20 border-4 border-green/40 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>

            {/* Inner spinner */}
            <div className={`${sizeClasses[size]} border-gray-200 border-t-green rounded-full animate-spin`}></div>
          </div>

          {/* Loading text */}
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900 animate-pulse">Loading</p>
            <div className="flex justify-center gap-1">
              <span className="w-2 h-2 bg-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} border-gray-200 border-t-green rounded-full animate-spin ${className}`} />
  );
};

export default GreenSpinner;    