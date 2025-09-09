/**
 * UK Postcode validation and formatting utilities for frontend
 */

/**
 * UK postcode regex patterns
 * Supports formats like: SW1A 1AA, SW1A1AA, W1A 0AX, M1 1AE, B33 8TH, CR2 6XH
 */
const UK_POSTCODE_REGEX = /^([A-Z]{1,2}[0-9][0-9A-Z]?)\s?([0-9][A-Z]{2})$/i;
const UK_POSTCODE_PARTIAL_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?$/i;

/**
 * Validates if a string is a valid UK postcode (full or partial)
 */
export function isValidUKPostcode(postcode: string): boolean {
  if (!postcode) return false;
  const cleaned = postcode.trim().toUpperCase();
  return UK_POSTCODE_REGEX.test(cleaned) || UK_POSTCODE_PARTIAL_REGEX.test(cleaned);
}

/**
 * Formats a UK postcode to standard format (with space)
 * e.g., "sw1a1aa" -> "SW1A 1AA"
 */
export function formatUKPostcode(postcode: string): string | null {
  if (!postcode) return null;
  
  const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, '');
  
  // Full postcode
  const fullMatch = cleaned.match(/^([A-Z]{1,2}[0-9][0-9A-Z]?)([0-9][A-Z]{2})$/);
  if (fullMatch) {
    return `${fullMatch[1]} ${fullMatch[2]}`;
  }
  
  // Partial postcode (outward code only)
  const partialMatch = cleaned.match(/^([A-Z]{1,2}[0-9][0-9A-Z]?)$/);
  if (partialMatch) {
    return partialMatch[1];
  }
  
  return null;
}

/**
 * Checks if a string is a partial UK postcode (outward code only)
 */
export function isPartialUKPostcode(postcode: string): boolean {
  if (!postcode) return false;
  const cleaned = postcode.trim().toUpperCase();
  return UK_POSTCODE_PARTIAL_REGEX.test(cleaned) && !UK_POSTCODE_REGEX.test(cleaned);
}

/**
 * Extracts the outward code (area) from a UK postcode
 * e.g., "SW1A 1AA" -> "SW1A"
 */
export function getPostcodeOutwardCode(postcode: string): string | null {
  const formatted = formatUKPostcode(postcode);
  if (!formatted) return null;
  
  const parts = formatted.split(' ');
  return parts[0];
}

/**
 * Identifies if a search query might be a UK postcode
 */
export function detectPostcodeInQuery(query: string): {
  isPostcode: boolean;
  formatted: string | null;
  isPartial: boolean;
} {
  const trimmed = query.trim();
  
  // Check if it's a valid UK postcode
  const isValid = isValidUKPostcode(trimmed);
  const formatted = isValid ? formatUKPostcode(trimmed) : null;
  const isPartial = isValid && isPartialUKPostcode(trimmed);
  
  return {
    isPostcode: isValid,
    formatted,
    isPartial
  };
}

/**
 * Get postcode display format for UI
 */
export function getPostcodeDisplay(postcode: string): string {
  const formatted = formatUKPostcode(postcode);
  return formatted || postcode.toUpperCase();
}