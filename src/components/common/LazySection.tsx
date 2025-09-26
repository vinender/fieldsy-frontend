import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { useNavigationLoader } from '@/contexts/NavigationLoaderContext';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  delay?: number;
  duration?: number;
}

export function LazySection({
  children,
  fallback,
  rootMargin = '50px',
  threshold = 0.1,
  className = '',
  minHeight = '400px',
  animation = 'fade',
  delay = 0,
  duration = 800,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { isNavigating } = useNavigationLoader();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          console.log(`LazySection [${animation}]: Now in view`);
          setIsInView(true);
          
          // Trigger animation after delay
          setTimeout(() => {
            console.log(`LazySection [${animation}]: Starting animation`);
            setHasAnimated(true);
          }, delay);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [animation, delay, rootMargin, threshold, isInView]);

  // Get initial transform based on animation type
  const getInitialTransform = () => {
    switch (animation) {
      case 'slideUp':
        return 'translate-y-10';
      case 'slideDown':
        return '-translate-y-10';
      case 'slide':
        return 'translate-x-10';
      case 'scale':
        return 'scale-95';
      default:
        return '';
    }
  };

  // Build animation classes
  const animationClasses = hasAnimated 
    ? 'opacity-100 translate-x-0 translate-y-0 scale-100 transition-all duration-[800ms] ease-out'
    : `opacity-0 ${getInitialTransform()} transition-all duration-[800ms] ease-out`;

  return (
    <div 
      ref={ref} 
      className={`${className}`}
      style={{ minHeight: !isInView && !isNavigating ? minHeight : undefined }}
    >
      {isInView ? (
        <div className={`lazy-section-animate ${animationClasses}`}>
          {children}
        </div>
      ) : (
        // During navigation, don't show fallback or placeholder
        // But still render the container so intersection observer can work
        !isNavigating && (fallback || <div style={{ minHeight }} />)
      )}
    </div>
  );
}