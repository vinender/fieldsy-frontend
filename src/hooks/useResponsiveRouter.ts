import { useRouter } from 'next/router';
import { useNavigationLoader } from '@/contexts/NavigationLoaderContext';
import { useCallback } from 'react';

export const useResponsiveRouter = () => {
  const router = useRouter();
  const { startNavigation } = useNavigationLoader();

  const push = useCallback((url: string, as?: string, options?: any) => {
    if (url !== router.asPath && !url.startsWith('#') && !url.startsWith('http')) {
      startNavigation();
    }
    return router.push(url, as, options);
  }, [router, startNavigation]);

  const replace = useCallback((url: string, as?: string, options?: any) => {
    if (url !== router.asPath && !url.startsWith('#') && !url.startsWith('http')) {
      startNavigation();
    }
    return router.replace(url, as, options);
  }, [router, startNavigation]);

  const back = useCallback(() => {
    startNavigation();
    return router.back();
  }, [router, startNavigation]);

  return {
    ...router,
    push,
    replace,
    back,
  };
};