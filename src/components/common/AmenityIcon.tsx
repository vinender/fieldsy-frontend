import React from 'react';
import { getAmenityIcon, getAmenityLabel } from '@/config/amenities.config';

interface AmenityIconProps {
  amenity: string;  // The amenity slug
  showLabel?: boolean;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable component to display amenity icon with optional label
 */

export const AmenityIcon: React.FC<AmenityIconProps> = ({
  amenity,
  showLabel = true,
  className = '',
  iconClassName = '',
  labelClassName = '',
  size = 'md'
}) => {

  const iconPath = getAmenityIcon(amenity);
  const label = getAmenityLabel(amenity);
  
  
  // Size classes for the icon
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={iconPath} 
        alt={label}
        className={`${sizeClasses[size]} ${iconClassName}`}
      />
      {showLabel && (
        <span className={`${textSizeClasses[size]} ${labelClassName}`}>
          {label}
        </span>
      )}
    </div>
  );
};

interface AmenitiesListProps {
  amenities: string[];  // Array of amenity slugs
  className?: string;
  itemClassName?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

/**
 * Component to display a list of amenities with their icons
 */
export const AmenitiesList: React.FC<AmenitiesListProps> = ({
  amenities,
  className = '',
  itemClassName = '',
  iconSize = 'md',
  showLabels = true,
  columns = 2
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 ${className}`}>
      {amenities.map((amenity) => (
        <AmenityIcon
          key={amenity}
          amenity={amenity}
          showLabel={showLabels}
          size={iconSize}
          className={itemClassName}
        />
      ))}
    </div>
  );
};

interface AmenityBadgeProps {
  amenity: string;
  className?: string;
  variant?: 'default' | 'outlined' | 'filled';
}

/**
 * Badge-style amenity display component
 */
export const AmenityBadge: React.FC<AmenityBadgeProps> = ({
  amenity,
  className = '',
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-white border border-black/6',
    outlined: 'bg-transparent border-2 border-[#3a6b22]',
    filled: 'bg-[#f4ffef] border border-[#3a6b221a]'
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${variantClasses[variant]} ${className}`}>
      <AmenityIcon
        amenity={amenity}
        showLabel={true}
        size="sm"
        iconClassName="text-[#3a6b22]"
        labelClassName="font-medium text-[#192215]"
      />
    </div>
  );
};