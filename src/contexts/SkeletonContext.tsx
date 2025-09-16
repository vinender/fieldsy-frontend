import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface SkeletonContextType {
  isNavigating: boolean;
  targetPath: string | null;
  startNavigation: (path: string) => void;
}

const SkeletonContext = createContext<SkeletonContextType | undefined>(undefined);

export const SkeletonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const router = useRouter();

  const startNavigation = useCallback((path: string) => {
    setTargetPath(path);
    setIsNavigating(true);
  }, []);

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== router.asPath) {
        setTargetPath(url);
        setIsNavigating(true);
      }
    };

    const handleComplete = () => {
      setIsNavigating(false);
      setTargetPath(null);
    };

    const handleError = () => {
      setIsNavigating(false);
      setTargetPath(null);
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
    <SkeletonContext.Provider value={{ isNavigating, targetPath, startNavigation }}>
      {children}
    </SkeletonContext.Provider>
  );
};

export const useSkeleton = () => {
  const context = useContext(SkeletonContext);
  if (context === undefined) {
    throw new Error('useSkeleton must be used within a SkeletonProvider');
  }
  return context;
};