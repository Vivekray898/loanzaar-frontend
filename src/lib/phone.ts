/**
 * Phone helpers
 * - Store phones in DB as local 10-digit numbers (no country code)
 * - Display phone values can be formatted with +91
 * 
 * ⚠️ IMPORTANT: Use validateIndianMobile() from @/utils/phoneValidation for validation!
 * This module only handles formatting and storage normalization.
 */

import { normalizePhoneForStorage as normalizeForStorageUtil } from '@/utils/phoneValidation';

export function normalizePhoneForStorage(raw: string | undefined | null): string | null {
  if (!raw) return null;
  
  // Try using the validated utility first (includes security checks)
  const result = normalizeForStorageUtil(raw);
  if (result) return result;
  
  // Fallback: simple digit extraction for backwards compatibility
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return null;
}

export function formatPhoneForDisplay(storedPhone: string | undefined | null): string | null {
  if (!storedPhone) return null;
  const digits = String(storedPhone).replace(/\D/g, '').slice(-10);
  return `+91${digits}`;
}
