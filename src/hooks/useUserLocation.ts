import { useLocation } from '@/contexts/LocationContext';

/**
 * Hook to get the last fetched user location
 * Returns location even if geolocation is currently off
 * Includes formatted address, latitude, and longitude
 */
export const useUserLocation = () => {
  const { location, isLoading, error, requestLocation, updateLocation, clearLocation } = useLocation();

  // Get location summary
  const getLocationSummary = () => {
    if (!location) return null;

    return {
      lat: location.latitude,
      lng: location.longitude,
      formattedAddress: location.formattedAddress,
      city: location.city,
      country: location.country,
      timestamp: location.timestamp,
      isStale: Date.now() - location.timestamp > 24 * 60 * 60 * 1000 // 24 hours
    };
  };

  // Check if location is available
  const hasLocation = !!location;

  // Get coordinates for API calls
  const getCoordinates = () => {
    if (!location) return null;
    return {
      latitude: location.latitude,
      longitude: location.longitude
    };
  };

  return {
    // Location data
    location: getLocationSummary(),
    hasLocation,
    isLoading,
    error,

    // Location methods
    requestLocation,
    updateLocation,
    clearLocation,
    getCoordinates,

    // Formatted data
    formattedAddress: location?.formattedAddress || null,
    coordinates: getCoordinates()
  };
};
