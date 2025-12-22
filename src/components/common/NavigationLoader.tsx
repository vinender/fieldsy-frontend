import React from 'react';
import { useNavigationLoader } from '@/contexts/NavigationLoaderContext';
import Spinner from '@/components/ui/Spinner';

const NavigationLoader: React.FC = () => {
  const { isNavigating } = useNavigationLoader();

  if (!isNavigating) return null;

  // Use full-screen spinner which provides solid white background and blocks all interactions
  return <Spinner size="full-screen" />;
};

export default NavigationLoader;