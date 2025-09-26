import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface OptimizedLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  prefetchStrategy?: 'hover' | 'viewport' | 'immediate' | 'none';
  priority?: boolean; // For high-traffic routes
}

/**
 * OptimizedLink component with smart prefetching strategies
 * - viewport: Prefetch when link enters viewport
 * - hover: Prefetch on mouse hover (default Next.js behavior)
 * - immediate: Prefetch immediately on mount (for critical routes)
 * - none: Disable prefetching
 */
export const OptimizedLink: React.FC<OptimizedLinkProps> = ({
  children,
  className,
  prefetchStrategy = 'hover',
  priority = false,
  prefetch = true,
  ...props
}) => {
  const router = useRouter();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout>();
  const hasPrefetched = useRef(false);
  
  // Use Intersection Observer for viewport prefetching
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '50px', // Start prefetching 50px before entering viewport
    triggerOnce: true,
  });

  // Handle viewport prefetching
  useEffect(() => {
    if (prefetchStrategy === 'viewport' && inView && !hasPrefetched.current && prefetch !== false) {
      hasPrefetched.current = true;
      // Delay prefetch slightly to avoid overwhelming the browser
      prefetchTimeoutRef.current = setTimeout(() => {
        router.prefetch(props.href as string);
      }, priority ? 0 : 100);
    }
    
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [inView, prefetchStrategy, props.href, router, priority, prefetch]);

  // Handle immediate prefetching for critical routes
  useEffect(() => {
    if (prefetchStrategy === 'immediate' && !hasPrefetched.current && prefetch !== false) {
      hasPrefetched.current = true;
      router.prefetch(props.href as string);
    }
  }, [prefetchStrategy, props.href, router, prefetch]);

  // Determine if we should use Next.js default prefetch
  const shouldUseLinkPrefetch = prefetchStrategy === 'hover' && prefetch !== false;

  return (
    <Link
      {...props}
      prefetch={shouldUseLinkPrefetch}
      className={className}
      ref={prefetchStrategy === 'viewport' ? ref : undefined}
    >
      {children}
    </Link>
  );
};

// High-priority routes that should be prefetched immediately
export const HIGH_PRIORITY_ROUTES = [
  '/fields',
  '/login',
  '/register',
  '/user/my-bookings',
  '/user/profile',
];

// Utility hook for manual prefetching
export const usePrefetch = () => {
  const router = useRouter();

  const prefetchRoute = (href: string, priority = false) => {
    if (priority) {
      router.prefetch(href);
    } else {
      setTimeout(() => router.prefetch(href), 100);
    }
  };

  const prefetchMultiple = (hrefs: string[], priority = false) => {
    hrefs.forEach((href, index) => {
      setTimeout(() => router.prefetch(href), priority ? 0 : index * 50);
    });
  };

  return { prefetchRoute, prefetchMultiple };
};