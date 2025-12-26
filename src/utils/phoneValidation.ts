/**
 * UK Phone Number Validation Utility
 *
 * Handles validation and formatting for UK phone numbers
 * Only validates length - accepts any UK phone number format
 */

// UK phone number length limits (excluding +44 country code)
// Mobile: 10-11 digits (7xxxxxxxxx or 07xxxxxxxxx)
// Landline: 10-11 digits
export const UK_PHONE_MAX_LENGTH = 11; // Maximum digits excluding country code
export const UK_PHONE_MIN_LENGTH = 10; // Minimum digits excluding country code

/**
 * Validates UK phone number - only checks length, not format
 *
 * Accepts any phone number that has between 10-11 digits (excluding country code)
 *
 * @param phoneNumber - The phone number to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateUKPhoneNumber = (phoneNumber: string): { isValid: boolean; error?: string } => {
  // Allow empty phone number (optional field)
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { isValid: true };
  }

  // Remove all non-digit characters for length validation
  let cleanNumber = phoneNumber.replace(/\D/g, '');

  // Handle +44 or 44 prefix - remove it for length calculation
  if (cleanNumber.startsWith('44') && cleanNumber.length > 11) {
    cleanNumber = cleanNumber.slice(2);
  }

  // Remove leading 0 if present for consistent length check
  if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
    cleanNumber = cleanNumber.slice(1);
  }

  // Check length only - accept 10 or 11 digits
  if (cleanNumber.length < UK_PHONE_MIN_LENGTH) {
    return { isValid: false, error: `Phone number must be at least ${UK_PHONE_MIN_LENGTH} digits` };
  }

  if (cleanNumber.length > UK_PHONE_MAX_LENGTH) {
    return { isValid: false, error: `Phone number cannot exceed ${UK_PHONE_MAX_LENGTH} digits` };
  }

  return { isValid: true };
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
 * @param enforceMaxLength - Whether to enforce the max length limit (default: true)
 * @returns Sanitized phone number string
 */
export const sanitizePhoneInput = (input: string, enforceMaxLength: boolean = true): string => {
  // Remove everything except digits, spaces, dashes, parentheses, and + (for international format)
  let sanitized = input.replace(/[^\d\s\-()+]/g, '');

  if (enforceMaxLength) {
    // Count only digits (excluding formatting characters)
    const digitsOnly = sanitized.replace(/\D/g, '');

    // If exceeds max length, truncate to max allowed digits
    if (digitsOnly.length > UK_PHONE_MAX_LENGTH) {
      // Keep only max allowed digits
      let digitCount = 0;
      let truncatedIndex = 0;

      for (let i = 0; i < sanitized.length; i++) {
        if (/\d/.test(sanitized[i])) {
          digitCount++;
          if (digitCount === UK_PHONE_MAX_LENGTH) {
            truncatedIndex = i + 1;
            break;
          }
        } else {
          truncatedIndex = i + 1;
        }
      }

      sanitized = sanitized.substring(0, truncatedIndex);
    }
  }

  return sanitized;
};
