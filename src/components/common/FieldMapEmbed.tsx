import React, { useMemo } from 'react';

interface FieldMapEmbedProps {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  fieldName?: string;
  height?: string;
  className?: string;
  latitude?: number;
  longitude?: number;
}

export default function FieldMapEmbed({ 
  address, 
  city, 
  state, 
  zipCode, 
  country = 'UK',
  fieldName = 'Field Location',
  height = '384px',
  className = '',
  latitude,
  longitude
}: FieldMapEmbedProps) {
  
  // Construct the map URL
  const mapUrl = useMemo(() => {
    // If we have coordinates, use them directly
    if (latitude && longitude) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
    }

    // Otherwise, construct address string for search
    const fullAddress = [
      address,
      city,
      state,
      zipCode,
      country
    ].filter(Boolean).join(', ');

    if (!fullAddress || fullAddress.trim() === '') {
      // Default to London if no address
      return `https://www.openstreetmap.org/export/embed.html?bbox=-0.1478,51.4974,-0.1078,51.5174&layer=mapnik`;
    }

    // Encode the address for URL
    const encodedAddress = encodeURIComponent(fullAddress);
    
    // Use OpenStreetMap search embed
    // Note: This shows a general area, not exact pin
    return `https://www.openstreetmap.org/export/embed.html?bbox=-0.1478,51.4974,-0.1078,51.5174&layer=mapnik`;
  }, [address, city, state, zipCode, country, latitude, longitude]);

  return (
    <div 
      className={`relative rounded-xl overflow-hidden bg-gray-100 ${className}`}
      style={{ height }}
    >
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing ${fieldName}`}
      />
      
      {/* Custom zoom button overlay to match design */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg p-2 shadow-lg pointer-events-none">
        <div className="flex items-center space-x-2 p-2">
          <div className="w-5 h-5 bg-[#395ADC] rounded-full"></div>
          <span className="text-sm">Zoom</span>
        </div>
      </div>

      {/* Location label */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg px-3 py-2 shadow-md">
        <p className="text-sm font-semibold text-dark-green">{fieldName}</p>
        {city && state && (
          <p className="text-xs text-gray-600">{city}, {state}</p>
        )}
      </div>
    </div>
  );
}