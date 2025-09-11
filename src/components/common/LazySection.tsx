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
  animation?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  delay?: number;
}

export function LazySection({
  children,
  fallback,
  rootMargin = '100px',
  threshold = 0,
  className = '',
  minHeight = '400px',
  animation = 'fade',
  delay = 0,
}: LazySectionProps) {
  const [ref, entry] = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  });

  const [hasAnimated, setHasAnimated] = useState(false);
  const isVisible = entry?.isIntersecting;

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hasAnimated, delay]);

  // Animation classes based on the animation prop
  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    if (!hasAnimated) return 'opacity-0';
    
    switch (animation) {
      case 'fade':
        return 'animate-fadeIn';
      case 'slide':
        return 'animate-slideIn';
      case 'scale':
        return 'animate-scaleIn';
      case 'slideUp':
        return 'animate-slideUp';
      case 'slideDown':
        return 'animate-slideDown';
      default:
        return 'animate-fadeIn';
    }
  };

  return (
    <div ref={ref} className={`${className} transition-all duration-700 ease-out ${isVisible ? getAnimationClass() : ''}`}>
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