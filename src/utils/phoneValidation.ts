import { parsePhoneNumberFromString } from 'libphonenumber-js';

export interface PhoneValidationResult {
  isValid: boolean;
  cleaned: string;
  error?: string;
}

/**
 * Validates Indian mobile numbers with strict security rules.
 * 
 * Rules:
 * - Must be exactly 10 digits
 * - Must start with 6, 7, 8, or 9
 * - Rejects repetitive sequences (e.g., 9999999999, 1111111111)
 * - Rejects ascending/descending sequences (e.g., 1234567890, 9876543210)
 * 
 * @param phone - Raw phone number input (can include formatting)
 * @returns PhoneValidationResult with isValid, cleaned number, and optional error message
 */
export function validateIndianMobile(phone: string): PhoneValidationResult {
  // Clean input: remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Rule 1: Must be exactly 10 digits
  if (cleaned.length !== 10) {
    return {
      isValid: false,
      cleaned: '',
      error: 'Mobile number must be exactly 10 digits',
    };
  }

  // Rule 2: Must start with 6, 7, 8, or 9 (valid India mobile prefixes)
  const firstDigit = cleaned[0];
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      cleaned: '',
      error: 'Mobile number must start with 6, 7, 8, or 9',
    };
  }

  // Rule 3: Reject repetitive sequences (all same digit like 9999999999)
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return {
      isValid: false,
      cleaned: '',
      error: 'Invalid mobile number (repetitive sequence)',
    };
  }

  // Rule 4: Reject ascending sequences (1234567890, 0123456789, etc.)
  let isAscending = true;
  for (let i = 1; i < cleaned.length; i++) {
    if (parseInt(cleaned[i]) !== parseInt(cleaned[i - 1]) + 1) {
      isAscending = false;
      break;
    }
  }
  if (isAscending) {
    return {
      isValid: false,
      cleaned: '',
      error: 'Invalid mobile number (ascending sequence)',
    };
  }

  // Rule 5: Reject descending sequences (9876543210, 9876543210, etc.)
  let isDescending = true;
  for (let i = 1; i < cleaned.length; i++) {
    if (parseInt(cleaned[i]) !== parseInt(cleaned[i - 1]) - 1) {
      isDescending = false;
      break;
    }
  }
  if (isDescending) {
    return {
      isValid: false,
      cleaned: '',
      error: 'Invalid mobile number (descending sequence)',
    };
  }

  // Additional validation using libphonenumber-js to verify it's a valid Indian number
  try {
    const parsed = parsePhoneNumberFromString(cleaned, 'IN');
    if (!parsed || !parsed.isValid()) {
      return {
        isValid: false,
        cleaned: '',
        error: 'Invalid mobile number format',
      };
    }
  } catch (e) {
    return {
      isValid: false,
      cleaned: '',
      error: 'Invalid mobile number format',
    };
  }

  // All validations passed
  return {
    isValid: true,
    cleaned: cleaned,
  };
}

/**
 * Normalizes phone number to E.164 format for storage and comparison.
 * Used on server-side to ensure consistent phone number handling.
 * 
 * @param phone - Raw or partially formatted phone number
 * @returns E.164 formatted phone (e.g., "+919876543210") or null if invalid
 */
export function normalizePhoneToE164(phone: string): string | null {
  try {
    const parsed = parsePhoneNumberFromString(phone, 'IN');
    if (!parsed || !parsed.isValid()) {
      return null;
    }
    return parsed.number; // E.164 format
  } catch (e) {
    return null;
  }
}

/**
 * Normalizes phone number for storage (local format without country code).
 * Stores just the 10-digit number for compatibility with existing schema.
 * 
 * @param phone - E.164 or raw phone number
 * @returns 10-digit number or null if invalid
 */
export function normalizePhoneForStorage(phone: string): string | null {
  try {
    const parsed = parsePhoneNumberFromString(phone, 'IN');
    if (!parsed || !parsed.isValid()) {
      return null;
    }
    // Extract just the national number (10 digits for India)
    return parsed.nationalNumber.toString();
  } catch (e) {
    return null;
  }
}
