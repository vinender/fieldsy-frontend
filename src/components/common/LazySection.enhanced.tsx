import React, { ReactNode, useEffect, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Skeleton } from '@/components/ui/skeleton';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: string;
  preload?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

export function LazySectionEnhanced({
  children,
  fallback,
  rootMargin = '100px',
  threshold = 0,
  className = '',
  minHeight = '400px',
  preload = false,
  priority = 'normal',
}: LazySectionProps) {
  const [ref, entry] = useIntersectionObserver({
    threshold,
    rootMargin: priority === 'high' ? '500px' : rootMargin,
    freezeOnceVisible: true,
  });

  const [shouldRender, setShouldRender] = useState(preload);
  const isVisible = entry?.isIntersecting;

  useEffect(() => {
    if (isVisible && !shouldRender) {
      // Add a small delay for low priority sections to prevent blocking
      if (priority === 'low') {
        const timer = setTimeout(() => {
          setShouldRender(true);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setShouldRender(true);
      }
    }
  }, [isVisible, shouldRender, priority]);

  // Add fade-in animation
  const contentClass = shouldRender ? 'animate-fadeIn' : '';

  return (
    <div ref={ref} className={`${className} ${contentClass}`}>
      {shouldRender ? (
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