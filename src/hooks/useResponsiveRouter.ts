import { useRouter } from 'next/router';
import { useSkeleton } from '@/contexts/SkeletonContext';
import { useCallback } from 'react';

export const useResponsiveRouter = () => {
  const router = useRouter();
  const { startNavigation } = useSkeleton();

  const push = useCallback((url: string, as?: string, options?: any) => {
    if (url !== router.asPath && !url.startsWith('#') && !url.startsWith('http')) {
      startNavigation(url);
    }
    return router.push(url, as, options);
  }, [router, startNavigation]);

  const replace = useCallback((url: string, as?: string, options?: any) => {
    if (url !== router.asPath && !url.startsWith('#') && !url.startsWith('http')) {
      startNavigation(url);
    }
    return router.replace(url, as, options);
  }, [router, startNavigation]);

  const back = useCallback(() => {
    startNavigation(router.asPath);
    return router.back();
  }, [router, startNavigation]);

  return {
    ...router,
    push,
    replace,
    back,
  };
};