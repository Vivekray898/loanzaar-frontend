/**
 * OTP Generation
 * 
 * Generates cryptographically secure 4-digit OTP (1000-9999)
 * Server-side only, never sent to client
 */

import crypto from 'crypto';

export const OTP_LENGTH = 4;
export const OTP_MIN = 1000;
export const OTP_MAX = 9999;
export const OTP_RANGE = OTP_MAX - OTP_MIN + 1;
export const OTP_EXPIRY_MINUTES = 5;

/**
 * Generate a 4-digit OTP (1000-9999)
 * Uses crypto.randomInt for cryptographic security
 * 
 * @returns 4-digit OTP as string
 * 
 * @example
 * ```typescript
 * const otp = generateOTP();
 * console.log(otp); // "3456" (4 digits, always)
 * ```
 */
export function generateOTP(): string {
  // Generate random number between 1000-9999 (inclusive)
  const otp = crypto.randomInt(OTP_MIN, OTP_MAX + 1);
  return String(otp);
}

/**
 * Validate OTP format
 * 
 * @param otp OTP to validate
 * @returns true if valid 4-digit OTP, false otherwise
 */
export function isValidOTPFormat(otp: string): boolean {
  // Must be exactly 4 digits
  if (!/^\d{4}$/.test(otp)) {
    return false;
  }

  const num = parseInt(otp, 10);
  return num >= OTP_MIN && num <= OTP_MAX;
}
