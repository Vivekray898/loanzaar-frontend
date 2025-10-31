import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Validate a phone number using libphonenumber-js.
 * Returns true when the number is a valid phone number for the given default country (IN by default).
 */
export function isValidPhoneNumber(number, defaultCountry = 'IN') {
  if (!number) return false;
  try {
    const pn = parsePhoneNumberFromString(String(number), defaultCountry);
    return pn ? pn.isValid() : false;
  } catch (e) {
    return false;
  }
}

/**
 * Format a phone number to E.164 if valid, otherwise return null.
 */
export function formatE164(number, defaultCountry = 'IN') {
  if (!number) return null;
  try {
    const pn = parsePhoneNumberFromString(String(number), defaultCountry);
    return pn && pn.isValid() ? pn.number : null; // .number is E.164
  } catch (e) {
    return null;
  }
}

/**
 * Return a normalized national string if possible (useful for display).
 */
export function formatNational(number, defaultCountry = 'IN') {
  if (!number) return null;
  try {
    const pn = parsePhoneNumberFromString(String(number), defaultCountry);
    return pn && pn.isValid() ? pn.formatNational() : null;
  } catch (e) {
    return null;
  }
}

export default {
  isValidPhoneNumber,
  formatE164,
  formatNational,
};
