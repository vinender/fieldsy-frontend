import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

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

// UK geographical bounds - restricts map to UK only
const UK_BOUNDS = {
  north: 60.85,  // North of Shetland Islands
  south: 49.87,  // South of Scilly Isles
  west: -8.65,   // West of Ireland border
  east: 1.76     // East of England coast
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  restriction: {
    latLngBounds: UK_BOUNDS,
    strictBounds: true  // Prevents panning outside UK bounds
  },
  minZoom: 5,  // Minimum zoom to keep UK in view
  maxZoom: 20, // Maximum zoom for street level detail
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
  const [showInfoWindow, setShowInfoWindow] = useState(false);

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

      // Restrict geocoding results to UK only
      geocoder.geocode({
        address: fullAddress,
        componentRestrictions: {
          country: 'GB'  // ISO 3166-1 Alpha-2 code for United Kingdom
        }
      }, (results, status) => {
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
          <>
            <Marker
              position={center}
              title={fieldName}
              onClick={() => setShowInfoWindow(true)}
            />
            {showInfoWindow && (
              <InfoWindow
                position={center}
                onCloseClick={() => setShowInfoWindow(false)}
                options={{ pixelOffset: new window.google.maps.Size(-12, -30) }}
              >
                <div style={{ minWidth: 260, minHeight: 120, padding: '16px 0', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", overflow: 'visible', position: 'relative' }}>
                  <button
                    onClick={() => setShowInfoWindow(false)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: 1,
                      padding: 0,
                      zIndex: 2147483647,
                    }}
                  >
                    ✕
                  </button>
                  <p style={{ fontSize: 14, color: '#4b5563', margin: '0 0 14px', lineHeight: 1.5, fontWeight: 400 }}>
                    {[address, city, zipCode].filter(Boolean).join(', ')}
                  </p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 18px',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: 'none',
                      letterSpacing: '0.01em',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                    Get Directions
                  </a>
                </div>
              </InfoWindow>
            )}
          </>
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