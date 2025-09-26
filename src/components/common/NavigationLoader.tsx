import React from 'react';
import { useNavigationLoader } from '@/contexts/NavigationLoaderContext';
import GreenSpinner from './GreenSpinner';

const NavigationLoader: React.FC = () => {
  const { isNavigating } = useNavigationLoader();

  if (!isNavigating) return null;

  return (
    <>
      {/* Centered spinner overlay during navigation */}
      <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[9999] flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-full p-4 shadow-2xl">
          <GreenSpinner size="large" />
        </div>
      </div>
    </>
  );
};

export default NavigationLoader;