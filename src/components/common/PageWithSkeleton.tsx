import React, { ReactNode } from 'react';
import { useSkeleton } from '@/contexts/SkeletonContext';

interface PageWithSkeletonProps {
  children: ReactNode;
  skeleton?: ReactNode;
  className?: string;
}

export const PageWithSkeleton: React.FC<PageWithSkeletonProps> = ({ 
  children, 
  skeleton,
  className = ""
}) => {
  const { isNavigating } = useSkeleton();

  if (isNavigating && skeleton) {
    return (
      <div className={`animate-pulse ${className}`}>
        {skeleton}
      </div>
    );
  }

  return <>{children}</>;
};