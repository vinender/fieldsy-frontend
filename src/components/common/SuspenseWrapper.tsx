import { Suspense, ReactNode } from 'react';
import GreenSpinner from './GreenSpinner';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
}

/**
 * Wrapper component for Suspense boundaries
 * Provides graceful loading states for heavy data fetches
 */
export function SuspenseWrapper({ 
  children, 
  fallback,
  delay = 0 
}: SuspenseWrapperProps) {
  const defaultFallback = (
    <div className="flex justify-center items-center min-h-[200px]">
      <GreenSpinner size="large" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

/**
 * Component-specific Suspense boundaries
 */
export function FieldsSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64" />
          ))}
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export function BookingsSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32" />
          ))}
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export function ProfileSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-20 w-20 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-full bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}