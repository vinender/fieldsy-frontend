import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRating } from '@/utils/formatters';

interface RatingStarsProps {
  rating?: number;
  max?: number;
  size?: number;
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export function RatingStars({
  rating = 0,
  max = 5,
  size = 16,
  className,
  activeColor = '#F5C04A',
  inactiveColor = '#D1D5DB',
}: RatingStarsProps) {
  // Round to nearest 0.5 for display
  const normalizedRating = Math.min(Math.max(formatRating(rating), 0), max);

  const stars = Array.from({ length: max }, (_, index) => {
    const relativeValue = normalizedRating - index;
    const fillPercentage = Math.max(0, Math.min(1, relativeValue)) * 100;

    return (
      <span
        key={index}
        className="relative inline-flex"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <Star
          className="w-full h-full"
          strokeWidth={1.5}
          color={inactiveColor}
        />
        {fillPercentage > 0 && (
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fillPercentage}%` }}
          >
            <Star
              className="w-full h-full"
              strokeWidth={1.5}
              color={activeColor}
              fill={activeColor}
            />
          </span>
        )}
      </span>
    );
  });

  return (
    <div className={cn('flex gap-1', className)}>
      {stars}
      <span className="sr-only">Rating: {normalizedRating} out of {max}</span>
    </div>
  );
}
