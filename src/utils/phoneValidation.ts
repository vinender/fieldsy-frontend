/**
 * UK Phone Number Validation Utility
 *
 * Handles validation and formatting for UK phone numbers
 * Supports various UK phone number formats
 */

/**
 * Validates UK phone number format
 *
 * Valid formats:
 * - Mobile: 07xxx xxxxxx (11 digits starting with 07)
 * - Mobile without leading 0: 7xxx xxxxxx (10 digits starting with 7)
 * - Landline: 01xxx xxx xxx, 02x xxxx xxxx, 03xx xxx xxxx (10-11 digits)
 * - With +44 prefix: +44 7xxx xxxxxx or +447xxxxxxxxx
 * - Any valid UK number format with spaces, dashes, or parentheses
 *
 * @param phoneNumber - The phone number to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateUKPhoneNumber = (phoneNumber: string): { isValid: boolean; error?: string } => {
  // Allow empty phone number (optional field)
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { isValid: true };
  }

  // Remove spaces, dashes, parentheses, and + for validation
  let cleanNumber = phoneNumber.replace(/[\s\-()]/g, '');

  // Handle +44 or 44 prefix - convert to 0 prefix
  if (cleanNumber.startsWith('+44')) {
    cleanNumber = '0' + cleanNumber.slice(3);
  } else if (cleanNumber.startsWith('44') && cleanNumber.length > 10) {
    cleanNumber = '0' + cleanNumber.slice(2);
  }

  // If number starts with 7, 1, 2, or 3 (without leading 0), add the 0
  if (/^[7123]\d{9}$/.test(cleanNumber)) {
    cleanNumber = '0' + cleanNumber;
  }

  // Check if it contains only digits after processing
  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, error: 'Phone number should only contain digits' };
  }

  // UK mobile numbers: Start with 07 and have 11 digits total
  const mobileRegex = /^07\d{9}$/;

  // UK landline numbers: Start with 01, 02, or 03 and have 10-11 digits
  const landlineRegex = /^0[123]\d{8,9}$/;

  if (mobileRegex.test(cleanNumber)) {
    return { isValid: true };
  }

  if (landlineRegex.test(cleanNumber)) {
    return { isValid: true };
  }

  // If it doesn't match any valid UK format
  if (cleanNumber.length < 10) {
    return { isValid: false, error: 'UK phone numbers must be at least 10 digits' };
  }

  if (cleanNumber.length > 11) {
    return { isValid: false, error: 'UK phone numbers cannot exceed 11 digits' };
  }

  return {
    isValid: false,
    error: 'Please enter a valid UK phone number (e.g., 07123456789, +447123456789, or 7123456789)'
  };
};

/**
 * Formats UK phone number for display
 *
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number string
 */
export const formatUKPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Format based on length and starting digits
  if (cleanNumber.startsWith('07') && cleanNumber.length === 11) {
    // Mobile format: 07123 456789
    return cleanNumber.replace(/(\d{5})(\d{6})/, '$1 $2');
  }

  if (cleanNumber.startsWith('01') && cleanNumber.length === 11) {
    // Landline format: 01234 567890
    return cleanNumber.replace(/(\d{5})(\d{6})/, '$1 $2');
  }

  if (cleanNumber.startsWith('02') && cleanNumber.length === 10) {
    // London format: 020 1234 5678
    return cleanNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
  }

  if (cleanNumber.startsWith('03') && cleanNumber.length === 10) {
    // 03 format: 0300 123 4567
    return cleanNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  // Default: just return the clean number
  return cleanNumber;
};

/**
 * Sanitizes phone number input - removes non-numeric characters except spaces, dashes, parentheses, and + for international
 *
 * @param input - The raw input string
 * @returns Sanitized phone number string
 */
export const sanitizePhoneInput = (input: string): string => {
  // Remove everything except digits, spaces, dashes, parentheses, and + (for international format)
  return input.replace(/[^\d\s\-()+]/g, '');
};
