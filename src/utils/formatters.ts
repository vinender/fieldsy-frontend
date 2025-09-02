/**
 * Format amenity string from camelCase to readable text
 * e.g., "secureFencing" -> "Secure Fencing"
 * e.g., "wasteDisposal" -> "Waste Disposal"
 * e.g., "cctv" -> "CCTV"
 */
export function formatAmenity(amenity: string): string {
  if (!amenity) return '';
  
  // Special cases for acronyms
  const acronyms: Record<string, string> = {
    'cctv': 'CCTV',
    'wifi': 'WiFi',
    'bbq': 'BBQ',
    'atm': 'ATM',
    'ac': 'AC',
    'tv': 'TV',
    'gps': 'GPS',
    'led': 'LED',
    'usb': 'USB'
  };
  
  // Check if it's a known acronym
  const lowerAmenity = amenity.toLowerCase();
  if (acronyms[lowerAmenity]) {
    return acronyms[lowerAmenity];
  }
  
  // Handle camelCase and add spaces
  let formatted = amenity
    // Add space before capital letters (but not at the start)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Handle numbers
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    // Capitalize first letter of each word
    .replace(/\b\w/g, (char) => char.toUpperCase());
  
  // Special formatting for common patterns
  formatted = formatted
    .replace(/\bAnd\b/g, 'and')
    .replace(/\bOr\b/g, 'or')
    .replace(/\bOf\b/g, 'of')
    .replace(/\bThe\b/g, 'the')
    .replace(/\bIn\b/g, 'in')
    .replace(/\bOn\b/g, 'on')
    .replace(/\bWith\b/g, 'with')
    .replace(/\bFor\b/g, 'for');
  
  // Ensure first letter is always capitalized
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Format an array of amenities
 */
export function formatAmenities(amenities: string[]): string[] {
  return amenities.map(formatAmenity);
}

/**
 * Common amenity mappings for consistency
 */
export const amenityLabels: Record<string, string> = {
  'secureFencing': 'Secure Fencing',
  'wasteDisposal': 'Waste Disposal',
  'waterSupply': 'Water Supply',
  'cctv': 'CCTV',
  'nightLighting': 'Night Lighting',
  'shelterOrShade': 'Shelter or Shade',
  'agilityCourse': 'Agility Course',
  'agilityEquipment': 'Agility Equipment',
  'separateSmallDogArea': 'Separate Small Dog Area',
  'separateLargeDogArea': 'Separate Large Dog Area',
  'doubleGatedEntry': 'Double Gated Entry',
  'parkingAvailable': 'Parking Available',
  'onSiteSupervision': 'On-Site Supervision',
  'restrooms': 'Restrooms',
  'picnicArea': 'Picnic Area',
  'dogWashStation': 'Dog Wash Station',
  'firstAidKit': 'First Aid Kit',
  'offLeashArea': 'Off Leash Area',
  'onLeashArea': 'On Leash Area',
  'trainingArea': 'Training Area',
  'wifi': 'WiFi',
  'foodAndDrinks': 'Food and Drinks',
  'toys': 'Toys',
  'poopBags': 'Poop Bags',
  'benchesSeating': 'Benches/Seating',
  'shadeTrees': 'Shade Trees',
  'waterBowls': 'Water Bowls',
  'treats': 'Treats',
  'leashRequired': 'Leash Required',
  'vaccinationRequired': 'Vaccination Required',
  'registrationRequired': 'Registration Required',
  'supervisionRequired': 'Supervision Required'
};

/**
 * Get formatted amenity label with fallback to auto-formatting
 */
export function getAmenityLabel(amenity: string): string {
  return amenityLabels[amenity] || formatAmenity(amenity);
}