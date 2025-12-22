import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full-screen';
  className?: string;
  /** Set to true for inline spinner (e.g., inside buttons). Default false renders centered spinner. */
  inline?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, inline = false }) => {
  const spinnerSizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-5 h-5 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-6 h-6 border-2',
    xl: 'w-6 h-6 border-3',
    'full-screen': 'w-8 h-8 border-2',
  };

  // Disable body scroll and interactions when full-screen loader is active
  useEffect(() => {
    if (size === 'full-screen') {
      // Store original styles to restore later
      const originalOverflow = document.body.style.overflow;
      const originalPointerEvents = document.body.style.pointerEvents;
      const originalUserSelect = document.body.style.userSelect;

      // Disable scrolling and interactions on body
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
      document.body.style.userSelect = 'none';

      // Add comprehensive style tag to block ALL interactions
      const styleTag = document.createElement('style');
      styleTag.id = 'spinner-full-screen-block';
      styleTag.textContent = `
        /* Force wait cursor on everything */
        *, *::before, *::after {
          cursor: wait !important;
        }

        /* Disable all pointer events on body and children */
        body > *:not(.spinner-overlay) {
          pointer-events: none !important;
          user-select: none !important;
        }

        /* Disable all buttons and interactive elements */
        button, a, input, select, textarea, [role="button"], [tabindex] {
          pointer-events: none !important;
          cursor: wait !important;
        }

        /* Disable form submissions */
        form {
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(styleTag);

      // Also add an inert attribute to the root element to prevent focus
      const rootElement = document.getElementById('__next') || document.getElementById('root');
      if (rootElement) {
        rootElement.setAttribute('inert', '');
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.pointerEvents = originalPointerEvents;
        document.body.style.userSelect = originalUserSelect;

        const existingStyle = document.getElementById('spinner-full-screen-block');
        if (existingStyle) {
          existingStyle.remove();
        }

        if (rootElement) {
          rootElement.removeAttribute('inert');
        }
      };
    }
  }, [size]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // For full-screen size, render as overlay
  if (size === 'full-screen') {
    return (
      <div
        className="spinner-overlay fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white select-none"
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
          cursor: 'wait',
          pointerEvents: 'all',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onClick={handleInteraction}
        onMouseDown={handleInteraction}
        onMouseUp={handleInteraction}
        onTouchStart={handleInteraction}
        onTouchEnd={handleInteraction}
        onTouchMove={handleInteraction}
        onKeyDown={handleInteraction}
        onContextMenu={handleInteraction}
        tabIndex={-1}
      >
        <div className="pointer-events-none select-none text-center" style={{ cursor: 'wait' }}>
          {/* Branding */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="text-5xl animate-bounce">🐾</span>
            <h1 className="text-4xl font-bold text-green">Fieldsy</h1>
          </div>

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
  }

  // For inline mode (inside buttons), render just the spinner element
  if (inline) {
    return (
      <div
        className={cn(
          spinnerSizes[size],
          'border-current/30 border-t-current rounded-full animate-spin',
          className
        )}
      ></div>
    );
  }

  // Default: render centered spinner (original behavior)
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          spinnerSizes[size],
          'border-gray-200 border-t-green rounded-full animate-spin'
        )}
      ></div>
    </div>
  );
};

export default Spinner;
