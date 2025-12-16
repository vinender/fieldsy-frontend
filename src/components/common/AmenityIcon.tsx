import React from 'react';
import { getAmenityIcon, getAmenityLabel } from '@/config/amenities.config';
import { SvgIcon } from '@/components/ui/SvgIcon';

interface AmenityIconProps {
  amenity: string;  // The amenity slug
  showLabel?: boolean;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  iconColor?: string;  // Color for the icon (e.g., "#3a6b22" or "text-green")
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable component to display amenity icon with optional label
 * Uses SvgIcon for proper fill color control
 */
export const AmenityIcon: React.FC<AmenityIconProps> = ({
  amenity,
  showLabel = true,
  className = '',
  iconClassName = '',
  labelClassName = '',
  iconColor = '#3a6b22',  // Default to green
  size = 'md'
}) => {
  const iconPath = getAmenityIcon(amenity);
  const label = getAmenityLabel(amenity);

  // Size classes for the icon
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <SvgIcon
        src={iconPath}
        size={sizeMap[size]}
        color={iconColor}
        alt={label}
        className={iconClassName}
        fallback={
          <div
            className={`bg-gray-200 rounded`}
            style={{ width: sizeMap[size], height: sizeMap[size] }}
          />
        }
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
  iconColor?: string;
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
  iconColor = '#3a6b22',
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
          iconColor={iconColor}
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
  iconColor?: string;
}

/**
 * Badge-style amenity display component
 */
export const AmenityBadge: React.FC<AmenityBadgeProps> = ({
  amenity,
  className = '',
  variant = 'default',
  iconColor = '#3a6b22'
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
        iconColor={iconColor}
        labelClassName="font-medium text-[#192215]"
      />
    </div>
  );
};

interface AmenitySvgIconProps {
  iconPath: string;
  label?: string;
  color?: string;
  size?: number;
  className?: string;
}

/**
 * Direct SVG icon component for amenities when you have the icon path
 * Useful when amenity data comes from API with iconUrl
 */
export const AmenitySvgIcon: React.FC<AmenitySvgIconProps> = ({
  iconPath,
  label = 'Amenity',
  color = '#3a6b22',
  size = 20,
  className = ''
}) => {
  return (
    <SvgIcon
      src={iconPath}
      size={size}
      color={color}
      alt={label}
      className={className}
      fallback={
        <div
          className="bg-gray-200 rounded"
          style={{ width: size, height: size }}
        />
      }
    />
  );
};
