import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, useJsApiLoader } from '@react-google-maps/api';

interface FieldMapProps {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  fieldName?: string;
  height?: string;
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 51.5074,
  lng: -0.1278 // Default to London
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

export default function FieldMap({ 
  address, 
  city, 
  state, 
  zipCode, 
  fieldName = 'Field Location',
  height = '384px',
  className = ''
}: FieldMapProps) {
  const [center, setCenter] = useState(defaultCenter);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get Google Maps API key from environment variable
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    libraries: ['places']
  });

  // Geocode the address to get coordinates
  const geocodeAddress = useCallback(async () => {
    if (!isLoaded || !window.google) return;

    try {
      setIsLoading(true);
      setError(null);

      // Construct full address (UK only)
      const fullAddress = [
        address,
        city,
        state,
        zipCode,
        'UK'
      ].filter(Boolean).join(', ');

      if (!fullAddress || fullAddress.trim() === '') {
        setError('No address provided');
        setIsLoading(false);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setCenter({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          console.error('Geocoding failed:', status);
          setError('Unable to find location');
        }
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Error geocoding address:', err);
      setError('Error loading map');
      setIsLoading(false);
    }
  }, [address, city, state, zipCode, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      geocodeAddress();
    }
  }, [geocodeAddress, isLoaded]);

  if (loadError) {
    return (
      <div 
        className={`relative rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-gray-500">Unable to load map</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || !googleMapsApiKey) {
    return (
      <div 
        className={`relative rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{ height }}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={mapOptions}
      >
        {!isLoading && !error && (
          <Marker
            position={center}
            title={fieldName}
          />
        )}
      </GoogleMap>
      
      {/* Zoom control overlay */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg p-2 shadow-lg">
        <button className="flex items-center space-x-2 p-2">
          <div className="w-5 h-5 bg-[#395ADC] rounded-full"></div>
          <span className="text-sm">Zoom</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">{error}</p>
            <p className="text-sm text-gray-400 mt-1">Showing default location</p>
          </div>
        </div>
      )}
    </div>
  );
}