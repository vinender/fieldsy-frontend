/**
 * Field Amenities Configuration
 * Maps amenity slugs to their display labels and icon paths
 */

export interface AmenityConfig {
  slug: string;           // The database/API value (e.g., "water-access")
  label: string;          // Display label (e.g., "Water Access")
  iconPath: string;       // Path to the SVG icon
  category?: string;      // Optional category for grouping
}

export const AMENITIES_CONFIG: AmenityConfig[] = [
  // Water & Hydration
  {
    slug: 'water-access',
    label: 'Water Access',
    iconPath: '/add-field/water.svg',
    category: 'hydration'
  },
  {
    slug: 'water-bowls',
    label: 'Water Bowls',
    iconPath: '/field-details/drop.svg',
    category: 'hydration'
  },
  {
    slug: 'water-supply',
    label: 'Water Supply',
    iconPath: '/add-field/water.svg',
    category: 'hydration'
  },
  
  // Fencing & Security
  {
    slug: 'secure-fencing',
    label: 'Secure Fencing',
    iconPath: '/field-details/fence.svg',
    category: 'security'
  },
  {
    slug: 'fencing',
    label: 'Fencing',
    iconPath: '/field-details/fence.svg',
    category: 'security'
  },
  {
    slug: 'double-gated-entry',
    label: 'Double Gated Entry',
    iconPath: '/field-details/shield.svg',
    category: 'security'
  },
  {
    slug: 'cctv',
    label: 'CCTV',
    iconPath: '/add-field/cctv.svg',
    category: 'security'
  },
  
  // Shelter & Shade
  {
    slug: 'shelter',
    label: 'Shelter',
    iconPath: '/add-field/shelter.svg',
    category: 'comfort'
  },
  {
    slug: 'shelter-or-shade',
    label: 'Shelter or Shade',
    iconPath: '/add-field/shelter.svg',
    category: 'comfort'
  },
  {
    slug: 'shade-trees',
    label: 'Shade Trees',
    iconPath: '/add-field/tree.svg',
    category: 'comfort'
  },
  {
    slug: 'trees',
    label: 'Trees',
    iconPath: '/add-field/tree.svg',
    category: 'comfort'
  },
  
  // Activities & Equipment
  {
    slug: 'agility-equipment',
    label: 'Agility Equipment',
    iconPath: '/add-field/dog-agility.svg',
    category: 'activities'
  },
  {
    slug: 'agility-course',
    label: 'Agility Course',
    iconPath: '/add-field/dog-agility.svg',
    category: 'activities'
  },
  {
    slug: 'dog-play-equipment',
    label: 'Dog Play Equipment',
    iconPath: '/add-field/dog-play.svg',
    category: 'activities'
  },
  {
    slug: 'swimming-area',
    label: 'Swimming Area',
    iconPath: '/add-field/swimming.svg',
    category: 'activities'
  },
  {
    slug: 'swimming-pool',
    label: 'Swimming Pool',
    iconPath: '/add-field/swimming.svg',
    category: 'activities'
  },
  
  // Waste Management
  {
    slug: 'waste-disposal',
    label: 'Waste Disposal',
    iconPath: '/field-details/bin.svg',
    category: 'facilities'
  },
  {
    slug: 'poop-bags',
    label: 'Poop Bags',
    iconPath: '/field-details/bin.svg',
    category: 'facilities'
  },
  {
    slug: 'waste-bins',
    label: 'Waste Bins',
    iconPath: '/field-details/bin.svg',
    category: 'facilities'
  },
  
  // Facilities
  {
    slug: 'parking',
    label: 'Parking',
    iconPath: '/field-details/home.svg',
    category: 'facilities'
  },
  {
    slug: 'parking-available',
    label: 'Parking Available',
    iconPath: '/field-details/home.svg',
    category: 'facilities'
  },
  {
    slug: 'restrooms',
    label: 'Restrooms',
    iconPath: '/field-details/home.svg',
    category: 'facilities'
  },
  {
    slug: 'benches-seating',
    label: 'Benches/Seating',
    iconPath: '/field-details/home.svg',
    category: 'facilities'
  },
  
  // Dog Areas
  {
    slug: 'separate-small-dog-area',
    label: 'Separate Small Dog Area',
    iconPath: '/field-details/pet.svg',
    category: 'dog-areas'
  },
  {
    slug: 'separate-large-dog-area',
    label: 'Separate Large Dog Area',
    iconPath: '/field-details/pet.svg',
    category: 'dog-areas'
  },
  {
    slug: 'off-leash-area',
    label: 'Off Leash Area',
    iconPath: '/field-details/pet.svg',
    category: 'dog-areas'
  },
  {
    slug: 'on-leash-area',
    label: 'On Leash Area',
    iconPath: '/field-details/pet.svg',
    category: 'dog-areas'
  },
  {
    slug: 'training-area',
    label: 'Training Area',
    iconPath: '/field-details/pet.svg',
    category: 'dog-areas'
  },
  
  // Services
  {
    slug: 'on-site-supervision',
    label: 'On-Site Supervision',
    iconPath: '/field-details/user.svg',
    category: 'services'
  },
  {
    slug: 'first-aid-kit',
    label: 'First Aid Kit',
    iconPath: '/field-details/shield.svg',
    category: 'services'
  },
  {
    slug: 'dog-wash-station',
    label: 'Dog Wash Station',
    iconPath: '/field-details/drop.svg',
    category: 'services'
  },
  
  // Other Amenities
  {
    slug: 'picnic-area',
    label: 'Picnic Area',
    iconPath: '/field-details/home.svg',
    category: 'other'
  },
  {
    slug: 'wifi',
    label: 'WiFi',
    iconPath: '/field-details/home.svg',
    category: 'other'
  },
  {
    slug: 'food-and-drinks',
    label: 'Food and Drinks',
    iconPath: '/field-details/home.svg',
    category: 'other'
  },
  {
    slug: 'toys',
    label: 'Toys',
    iconPath: '/add-field/dog-play.svg',
    category: 'other'
  },
  {
    slug: 'treats',
    label: 'Treats',
    iconPath: '/field-details/pet.svg',
    category: 'other'
  },
  {
    slug: 'night-lighting',
    label: 'Night Lighting',
    iconPath: '/add-field/clock.svg',
    category: 'other'
  }
];

/**
 * Get amenity configuration by slug
 * @param slug - The amenity slug (e.g., "water-access")
 * @returns The amenity configuration or undefined
 */
export function getAmenityBySlug(slug: string): AmenityConfig | undefined {
  return AMENITIES_CONFIG.find(amenity => amenity.slug === slug);
}

/**
 * Get amenity icon path by slug
 * @param slug - The amenity slug
 * @param defaultIcon - Default icon path if not found
 * @returns The icon path
 */
export function getAmenityIcon(slug: string, defaultIcon = '/field-details/shield.svg'): string {
  const amenity = getAmenityBySlug(slug);
  return amenity?.iconPath || defaultIcon;
}

/**
 * Get amenity label by slug (deslugified)
 * @param slug - The amenity slug
 * @returns The display label
 */
export function getAmenityLabel(slug: string): string {
  const amenity = getAmenityBySlug(slug);
  if (amenity) return amenity.label;
  
  // Fallback: deslugify the slug
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Get amenities by category
 * @param category - The category to filter by
 * @returns Array of amenities in that category
 */
export function getAmenitiesByCategory(category: string): AmenityConfig[] {
  return AMENITIES_CONFIG.filter(amenity => amenity.category === category);
}

/**
 * Get all unique categories
 * @returns Array of unique category names
 */
export function getAmenityCategories(): string[] {
  const categories = AMENITIES_CONFIG
    .map(amenity => amenity.category)
    .filter((category): category is string => category !== undefined);
  
  return [...new Set(categories)];
}

/**
 * Map an array of amenity slugs to their configurations
 * @param slugs - Array of amenity slugs
 * @returns Array of amenity configurations
 */
export function mapAmenityConfigs(slugs: string[]): AmenityConfig[] {
  return slugs
    .map(slug => getAmenityBySlug(slug))
    .filter((config): config is AmenityConfig => config !== undefined);
}