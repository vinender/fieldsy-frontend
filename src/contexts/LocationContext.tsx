import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

interface LocationContextType {
  currentLocation: LocationCoordinates | null;
  isLocationEnabled: boolean;
  isLoadingLocation: boolean;
  locationError: string | null;
  requestLocation: () => Promise<void>;
  setCurrentLocation: (location: LocationCoordinates | null) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

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

  const requestLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: LocationCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          
          setCurrentLocation(newLocation);
          setIsLocationEnabled(true);
          setIsLoadingLocation(false);
          
          // Save to localStorage with timestamp
          localStorage.setItem('userLocation', JSON.stringify(newLocation));
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
    clearLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

// Custom hook to use location context
export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}