import React, { ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Skeleton } from '@/components/ui/skeleton';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: string;
}

export function LazySection({
  children,
  fallback,
  rootMargin = '100px',
  threshold = 0,
  className = '',
  minHeight = '400px',
}: LazySectionProps) {
  const [ref, entry] = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  });

  const isVisible = entry?.isIntersecting;

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        children
      ) : (
        fallback || (
          <div className="w-full flex items-center justify-center" style={{ minHeight }}>
            <div className="space-y-4 w-full max-w-4xl mx-auto px-4">
              <Skeleton className="h-12 w-3/4 mx-auto" />
              <Skeleton className="h-64 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}