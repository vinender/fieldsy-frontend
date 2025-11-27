import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import PageLoader from '@/components/common/PageLoader';

interface NavigationContextType {
  isNavigating: boolean;
  startNavigation: () => void;
}

// Default context value for when provider is not available (SSR/initial render)
const defaultContextValue: NavigationContextType = {
  isNavigating: false,
  startNavigation: () => {},
};

const NavigationContext = createContext<NavigationContextType>(defaultContextValue);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
    setShowLoader(true);
  }, []);

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== router.asPath) {
        setIsNavigating(true);
        setShowLoader(true);
      }
    };

    const handleComplete = () => {
      setIsNavigating(false);
      setTimeout(() => {
        setShowLoader(false);
      }, 100);
    };

    const handleError = () => {
      setIsNavigating(false);
      setShowLoader(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
      {showLoader && (
        <div className="fixed inset-0 z-[9999] bg-white">
          <PageLoader />
        </div>
      )}
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  return useContext(NavigationContext);
};