/**
 * Phone helpers
 * - Store phones in DB as local 10-digit numbers (no country code)
 * - Display phone values can be formatted with +91
 */

export function normalizePhoneForStorage(raw: string | undefined | null): string | null {
  if (!raw) return null;
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
