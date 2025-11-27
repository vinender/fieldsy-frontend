import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
  formattedAddress?: string;
  city?: string;
  country?: string;
}

interface LocationContextType {
  currentLocation: LocationCoordinates | null;
  isLocationEnabled: boolean;
  isLoadingLocation: boolean;
  locationError: string | null;
  requestLocation: () => Promise<void>;
  setCurrentLocation: (location: LocationCoordinates | null) => void;
  clearLocation: () => void;
  updateFormattedAddress: (lat: number, lng: number) => Promise<void>;
}

// Default context value for when provider is not available (SSR/initial render)
const defaultContextValue: LocationContextType = {
  currentLocation: null,
  isLocationEnabled: false,
  isLoadingLocation: false,
  locationError: null,
  requestLocation: async () => {},
  setCurrentLocation: () => {},
  clearLocation: () => {},
  updateFormattedAddress: async () => {},
};

const LocationContext = createContext<LocationContextType>(defaultContextValue);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Load saved location from localStorage on mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        // Check if location is not too old (24 hours)
        const dayInMs = 24 * 60 * 60 * 1000;
        if (parsed.timestamp && Date.now() - parsed.timestamp < dayInMs) {
          setCurrentLocation(parsed);
          setIsLocationEnabled(true);
        } else {
          // Clear old location
          localStorage.removeItem('userLocation');
        }
      } catch (err) {
        console.error('Error parsing saved location:', err);
        localStorage.removeItem('userLocation');
      }
    }
  }, []);

  // Reverse geocode coordinates to get formatted address
  const updateFormattedAddress = async (lat: number, lng: number): Promise<void> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const formattedAddress = result.formatted_address;

        // Extract city and country
        const cityComponent = result.address_components?.find((c: any) =>
          c.types.includes('locality') || c.types.includes('administrative_area_level_2')
        );
        const countryComponent = result.address_components?.find((c: any) =>
          c.types.includes('country')
        );

        setCurrentLocation(prev => prev ? {
          ...prev,
          formattedAddress,
          city: cityComponent?.long_name,
          country: countryComponent?.long_name
        } : null);

        // Update localStorage
        const updatedLocation = {
          ...currentLocation,
          formattedAddress,
          city: cityComponent?.long_name,
          country: countryComponent?.long_name
        };
        localStorage.setItem('userLocation', JSON.stringify(updatedLocation));
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
    }
  };

  const requestLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation: LocationCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };

          setCurrentLocation(newLocation);
          setIsLocationEnabled(true);

          // Get formatted address
          await updateFormattedAddress(position.coords.latitude, position.coords.longitude);

          setIsLoadingLocation(false);
          resolve();
        },
        (err) => {
          setIsLoadingLocation(false);
          setIsLocationEnabled(false);
          
          let errorMessage = 'Unable to get your location';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again.';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          
          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const clearLocation = () => {
    setCurrentLocation(null);
    setIsLocationEnabled(false);
    setLocationError(null);
    localStorage.removeItem('userLocation');
  };

  const value: LocationContextType = {
    currentLocation,
    isLocationEnabled,
    isLoadingLocation,
    locationError,
    requestLocation,
    setCurrentLocation,
    clearLocation,
    updateFormattedAddress
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

// Custom hook to use location context
export function useLocation() {
  return useContext(LocationContext);
}