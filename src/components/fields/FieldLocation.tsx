import React from 'react';

interface FieldLocationProps {
  field: {
    city?: string;
    state?: string;
    county?: string;
    postalCode?: string;
    zipCode?: string;
    address?: string;
    streetAddress?: string;
    distance?: number | string; // Backward compatibility
    distanceMiles?: number; // Backend-calculated distance in miles
  };
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showDistance?: boolean;
}

export default function FieldLocation({
  field,
  className = 'flex items-center gap-1',
  iconClassName = 'w-4 h-4 sm:w-5 sm:h-5 text-[#3A6B22]',
  textClassName = 'text-sm sm:text-[16px] text-dark-green truncate',
  showDistance = true
}: FieldLocationProps) {
  // Format the location address
  const formatAddress = (): string => {
    // Priority 1: City and PostalCode/ZipCode
    if (field.city && (field.postalCode || field.zipCode)) {
      return `${field.city} ${field.postalCode || field.zipCode}`;
    }

    // Priority 2: City and State/County
    if (field.city && (field.state || field.county)) {
      return `${field.city}, ${field.state || field.county}`;
    }

    // Priority 3: Just City
    if (field.city) {
      return field.city;
    }

    // Priority 4: Full address or street address
    if (field.address || field.streetAddress) {
      return field.address || field.streetAddress || '';
    }

    // Fallback
    return 'Location not specified';
  };

  // Format distance text
  const formatDistance = (): string => {
    if (!showDistance) return '';

    // Priority 1: Use backend-calculated distanceMiles
    if (field.distanceMiles !== undefined && field.distanceMiles !== null) {
      return ` • ${field.distanceMiles.toFixed(1)} miles`;
    }

    // Priority 2: Use legacy distance field
    if (field.distance) {
      const distanceText = typeof field.distance === 'number'
        ? `${field.distance.toFixed(1)} miles`
        : field.distance;
      return ` • ${distanceText}`;
    }

    return '';
  };

  const locationText = formatAddress();
  const distanceText = formatDistance();

  return (
    <div className={className}>
      <img src='/location.svg' className={iconClassName} alt="Location" />
      <span className={textClassName}>
        {field?.address+','} {field.city}{distanceText}
      </span>
    </div>
  );
}
