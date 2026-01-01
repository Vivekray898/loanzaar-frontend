/**
 * Edge Runtime compatible session utilities
 * Used by middleware to check session existence without crypto operations
 */

export const COOKIE_NAME = 'auth_session';

/**
 * Lightweight check for auth cookie existence (Edge Runtime safe)
 */
export function hasAuthCookie(cookieValue: string | undefined): boolean {
  return !!cookieValue && cookieValue.length > 0;
}

/**
 * Get cookie name
 */
export function getCookieName(): string {
  return COOKIE_NAME;
}
