import React from 'react';
import { cn } from '@/lib/utils';
import { formatRating } from '@/utils/formatters';

interface RatingStarsProps {
  rating?: number;
  max?: number;
  size?: number;
  className?: string;
}

export function RatingStars({
  rating = 0,
  max = 5,
  size = 16,
  className,
}: RatingStarsProps) {
  const normalizedRating = Math.min(Math.max(formatRating(rating), 0), max);

  const stars = Array.from({ length: max }, (_, index) => {
    const difference = normalizedRating - index;

    // Determine which star to show
    let starType: 'full' | 'half' | 'empty';
    if (difference >= 1) {
      starType = 'full';
    } else if (difference >= 0.5) {
      starType = 'half';
    } else {
      starType = 'empty';
    }

    return (
      <span
        key={index}
        className="inline-flex"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {starType === 'full' && (
          <img
            src="/star.svg"
            alt="star"
            className="w-full h-full"
          />
        )}
        {starType === 'half' && (
          <img
            src="/half-star.svg"
            alt="half star"
            className="w-full h-full"
          />
        )}
        {starType === 'empty' && (
          <img
            src="/star.svg"
            alt="empty star"
            className="w-full h-full opacity-20 grayscale"
          />
        )}
      </span>
    );
  });

  return (
    <div className={cn('flex gap-0.5', className)}>
      {stars}
      <span className="sr-only">Rating: {normalizedRating} out of {max}</span>
    </div>
  );
}
