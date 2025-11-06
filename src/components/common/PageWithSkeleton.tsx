import React, { ReactNode } from 'react';
import { useNavigationLoader } from '@/contexts/NavigationLoaderContext';

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
  const { isPageTransitioning } = useNavigationLoader();

  // Only show skeleton during page transitions if provided
  // if (isPageTransitioning && skeleton) {
  //   return (
  //     <div className={`animate-pulse cursor-wait pointer-events-none ${className}`}>
  //       {skeleton}
  //     </div>
  //   );
  // }

  return <>{children}</>;
};