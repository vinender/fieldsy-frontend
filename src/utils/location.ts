/**
 * Calculate distance between two geographic points using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles (use 6371 for kilometers)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return "< 0.1 miles";
  } else if (miles < 1) {
    return `${miles.toFixed(1)} miles`;
  } else if (miles < 10) {
    return `${miles.toFixed(1)} miles`;
  } else {
    return `${Math.round(miles)} miles`;
  }
}

/**
 * Get field coordinates from location object
 */
export function getFieldCoordinates(location: any): { lat: number; lng: number } | null {
  // Check if location is a JSON object with lat/lng
  if (location && typeof location === 'object') {
    if (location.lat && location.lng) {
      return { lat: location.lat, lng: location.lng };
    }
    if (location.latitude && location.longitude) {
      return { lat: location.latitude, lng: location.longitude };
    }
  }
  
  return null;
}