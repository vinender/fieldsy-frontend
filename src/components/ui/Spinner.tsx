import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full-screen';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const spinnerSizes = {
    xs: 'w-6 h-6 border-2',
    sm: 'w-8 h-8 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-8 h-8 border-3',
    'full-screen': 'w-16 h-16 border-4',
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // ALWAYS render as full-screen overlay with white background
  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        cursor: 'none',
        pointerEvents: 'all',
      }}
      onClick={handleClick}
      onMouseDown={handleClick}
      onMouseUp={handleClick}
      onTouchStart={handleClick}
      onTouchEnd={handleClick}
    >
      <div className="pointer-events-none select-none text-center">
        {/* Branding - only show for full-screen size */}
        {size === 'full-screen' && (
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="text-5xl animate-bounce">🐾</span>
            <h1 className="text-4xl font-bold text-green">Fieldsy</h1>
          </div>
        )}

        {/* Single Spinner Ring */}
        <div className="relative flex items-center justify-center mb-6">
          <div
            className={cn(
              spinnerSizes[size],
              'border-gray-200 border-t-green rounded-full animate-spin'
            )}
          ></div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-900 animate-pulse">Loading</p>
          <div className="flex justify-center gap-1">
            <span
              className="w-2 h-2 bg-green rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></span>
            <span
              className="w-2 h-2 bg-green rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></span>
            <span
              className="w-2 h-2 bg-green rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spinner;
