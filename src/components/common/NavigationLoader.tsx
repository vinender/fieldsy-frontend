import React from 'react';
import { useNavigationLoader } from '@/contexts/NavigationLoaderContext';
import Spinner from '@/components/ui/Spinner';

const NavigationLoader: React.FC = () => {
  const { isNavigating } = useNavigationLoader();

  if (!isNavigating) return null;

  return (
    <>
      {/* Centered spinner overlay during navigation */}
      <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[9999] flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-full p-4 shadow-2xl">
          <Spinner size="lg" />
        </div>
      </div>
    </>
  );
};

export default NavigationLoader;