/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format date values in dd/mm/yyyy format (UK standard)
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatDate:', date);
    return '';
  }

  // If custom options provided, use them
  if (options) {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    return dateObj.toLocaleDateString('en-GB', defaultOptions);
  }

  // Default to dd/mm/yyyy format
  return formatDateDDMMYYYY(dateObj);
}

/**
 * Format date in dd/mm/yyyy format (UK standard)
 * e.g., 14/10/2025
 */
export function formatDateDDMMYYYY(date: Date | string): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatDateDDMMYYYY:', date);
    return '';
  }

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date with time in dd/mm/yyyy HH:mm format
 * e.g., 14/10/2025 14:30
 */
export function formatDateTimeDDMMYYYY(date: Date | string): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatDateTimeDDMMYYYY:', date);
    return '';
  }

  const datePart = formatDateDDMMYYYY(dateObj);
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  return `${datePart} ${hours}:${minutes}`;
}

/**
 * Format message timestamp in WhatsApp style
 * - Today: HH:mm (e.g., "14:30")
 * - Yesterday: "Yesterday"
 * - This week: Day name (e.g., "Monday")
 * - Older: dd/mm/yyyy
 */
export function formatMessageTimestamp(date: Date | string): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatMessageTimestamp:', date);
    return '';
  }

  // Always show only time (HH:mm) for messages
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format date header for chat messages - WhatsApp style
 * Used for the centered date dividers between message groups
 */
export function formatChatDateHeader(date: Date | string): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatChatDateHeader:', date);
    return '';
  }

  const now = new Date();

  // Reset time parts for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

  const diffTime = today.getTime() - messageDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Today
  if (diffDays === 0) {
    return 'Today';
  }

  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }

  // Within last 7 days - show day name with date
  if (diffDays < 7) {
    const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'long' });
    return `${dayName}`;
  }

  // Older - show formatted date (e.g., "15/10/2024")
  return formatDateDDMMYYYY(dateObj);
}

/**
 * Format chat list timestamp (last message time) - WhatsApp style
 * - Today: HH:mm
 * - Yesterday: "Yesterday"
 * - This week: Day name (Mon, Tue, etc.)
 * - Older: dd/mm/yyyy
 */
export function formatChatListTime(date: Date | string): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatChatListTime:', date);
    return '';
  }

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

  const diffTime = today.getTime() - messageDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Today - show time
  if (diffDays === 0) {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }

  // Within last 7 days - show short day name
  if (diffDays < 7) {
    return dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
  }

  // Older - show dd/mm/yyyy
  return formatDateDDMMYYYY(dateObj);
}

/**
 * Format amenity string from camelCase to readable text
 * e.g., "secureFencing" -> "Secure Fencing"
 * e.g., "wasteDisposal" -> "Waste Disposal"
 * e.g., "cctv" -> "CCTV"
 *
 * Also handles amenity objects with label, name, or value properties
 */
export function formatAmenity(amenity: string | any): string {
  if (!amenity) return '';

  // If amenity is an object, extract the label, name, or value
  if (typeof amenity === 'object') {
    return amenity.label || amenity.name || amenity.value || '';
  }

  // If amenity is not a string at this point, convert it
  if (typeof amenity !== 'string') {
    return String(amenity);
  }

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
 * Handles both string arrays and object arrays
 */
export function formatAmenities(amenities: (string | any)[]): string[] {
  if (!Array.isArray(amenities)) return [];
  return amenities.map(formatAmenity).filter(Boolean);
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
 * Handles both string amenities and object amenities
 */
export function getAmenityLabel(amenity: string | any): string {
  // If amenity is an object, extract the label directly
  if (typeof amenity === 'object' && amenity) {
    return amenity.label || amenity.name || amenity.value || '';
  }

  // If it's a string, look up in the labels map or format it
  if (typeof amenity === 'string') {
    return amenityLabels[amenity] || formatAmenity(amenity);
  }

  return '';
}

/**
 * Deslugify a string - convert from slug format to readable text
 * e.g., "soft-sand" -> "Soft Sand"
 * e.g., "artificial-grass" -> "Artificial Grass"
 * e.g., "wooden-mesh" -> "Wooden Mesh"
 */
export function deslugify(text: string): string {
  if (!text) return '';

  return text
    // Replace hyphens and underscores with spaces
    .replace(/[-_]/g, ' ')
    // Capitalize first letter of each word
    .replace(/\b\w/g, (char) => char.toUpperCase())
    // Trim any extra spaces
    .trim();
}

/**
 * Format time string to 12-hour format with AM/PM
 * Accepts formats: "HH:mm", "HH:mm:ss", or ISO datetime string
 * e.g., "09:00" -> "9:00 AM"
 * e.g., "13:30" -> "1:30 PM"
 * e.g., "00:00" -> "12:00 AM"
 * e.g., "12:00" -> "12:00 PM"
 */
export function formatTimeTo12Hour(time: string): string {
  if (!time) return '';

  try {
    // Extract time part if it's a full datetime string
    let timeString = time;
    if (time.includes('T') || time.includes(' ')) {
      // Handle ISO datetime or datetime with space
      const date = new Date(time);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else {
        // Extract time portion manually if Date parsing fails
        timeString = time.split(/[T ]/)[1] || time;
      }
    }

    // Parse HH:mm or HH:mm:ss format
    const parts = timeString.split(':');
    if (parts.length < 2) return time; // Return original if not valid format

    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];

    // Validate hours and minutes
    if (isNaN(hours) || hours < 0 || hours > 23) return time;
    if (isNaN(parseInt(minutes, 10)) || parseInt(minutes, 10) < 0 || parseInt(minutes, 10) > 59) return time;

    // Determine AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    if (hours === 0) {
      hours = 12; // Midnight case
    } else if (hours > 12) {
      hours = hours - 12;
    }

    return `${hours}:${minutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', time, error);
    return time; // Return original on error
  }
}

/**
 * Format opening hours range with AM/PM
 * e.g., "09:00 - 17:00" -> "9:00 AM - 5:00 PM"
 * e.g., "06:00-20:00" -> "6:00 AM - 8:00 PM"
 */
export function formatOpeningHours(openingTime: string, closingTime: string): string {
  if (!openingTime || !closingTime) return '';

  const formattedOpening = formatTimeTo12Hour(openingTime);
  const formattedClosing = formatTimeTo12Hour(closingTime);

  return `${formattedOpening} - ${formattedClosing}`;
}

/**
 * Format rating to nearest 0.5
 * e.g., 4.7 -> 4.5
 * e.g., 4.8 -> 5.0
 * e.g., 4.2 -> 4.0
 * e.g., 4.3 -> 4.5
 */
export function formatRating(rating: number): number {
  if (rating === undefined || rating === null) return 0;
  return Math.round(rating * 2) / 2;
}