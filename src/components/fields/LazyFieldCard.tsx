import { useInView } from 'react-intersection-observer';
import { FieldCard, FieldCardProps } from './FieldCard';
import { useState, useEffect } from 'react';

interface LazyFieldCardProps extends FieldCardProps {
  index: number;
}

export function LazyFieldCard({ index, ...props }: LazyFieldCardProps) {
  const [shouldRender, setShouldRender] = useState(false);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.01,
    rootMargin: '200px', // Start rendering cards 200px before they enter viewport
  });

  useEffect(() => {
    if (inView) {
      // Stagger rendering slightly to avoid blocking
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, index * 10); // 10ms stagger per card

      return () => clearTimeout(timer);
    }
  }, [inView, index]);

  return (
    <div ref={ref} className="w-full">
      {shouldRender ? (
        <FieldCard {...props} />
      ) : (
        <FieldCardSkeleton />
      )}
    </div>
  );
}

function FieldCardSkeleton() {
  return (
    <div className="bg-white rounded-[20px] overflow-hidden animate-pulse">
      <div className="px-3 pt-3 pb-2">
        {/* Header skeleton */}
        <div className="flex justify-between items-start mb-1">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />

        {/* Image skeleton */}
        <div className="relative mb-2">
          <div className="h-[200px] w-full bg-gray-200 rounded-[15px]" />
        </div>

        {/* Location skeleton */}
        <div className="flex justify-between items-center mb-2">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-6 bg-gray-200 rounded w-10" />
        </div>

        {/* Amenities skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-200 rounded w-14" />
        </div>

        {/* Buttons skeleton */}
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-gray-200 rounded-full" />
          <div className="flex-1 h-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
