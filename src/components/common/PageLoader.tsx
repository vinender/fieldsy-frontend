import React from 'react';

export default function PageLoader() {
  
  
  return (
    <div className="min-h-screen bg-light-cream flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Logo or brand icon */}
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-green rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 bg-green rounded-full opacity-40 animate-pulse animation-delay-200"></div>
            <div className="absolute inset-4 bg-green rounded-full opacity-60 animate-pulse animation-delay-400"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-green border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
        <p className="text-gray-text font-sans animate-pulse">Loading...</p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}