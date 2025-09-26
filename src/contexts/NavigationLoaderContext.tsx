import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface NavigationLoaderContextType {
  isNavigating: boolean;
  isPageTransitioning: boolean;
  startNavigation: () => void;
  stopNavigation: () => void;
}

const NavigationLoaderContext = createContext<NavigationLoaderContextType>({
  isNavigating: false,
  isPageTransitioning: false,
  startNavigation: () => {},
  stopNavigation: () => {},
});

export const useNavigationLoader = () => useContext(NavigationLoaderContext);

export const NavigationLoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleStart = (url: string) => {
      // Only show spinner for actual page navigation, not for shallow routing
      if (url !== router.asPath) {
        setIsNavigating(true);
        setIsPageTransitioning(true);
        
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };
    
    const handleComplete = () => {
      setIsNavigating(false);
      // Keep page transitioning true for a short time to prevent skeleton flash
      timeoutRef.current = setTimeout(() => {
        setIsPageTransitioning(false);
      }, 100);
    };
    
    const handleError = () => {
      setIsNavigating(false);
      setIsPageTransitioning(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);

  const startNavigation = () => setIsNavigating(true);
  const stopNavigation = () => setIsNavigating(false);

  return (
    <NavigationLoaderContext.Provider value={{ isNavigating, isPageTransitioning, startNavigation, stopNavigation }}>
      {children}
    </NavigationLoaderContext.Provider>
  );
};