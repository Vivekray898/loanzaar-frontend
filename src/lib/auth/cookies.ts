/**
 * Cookie utilities for unified OTP auth system
 * Handles auth_session cookie creation, validation, and cleanup
 */

export const COOKIE_NAME = 'auth_session';
export const COOKIE_EXPIRY_DAYS = 7;
export const COOKIE_EXPIRY_MS = COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export interface AuthSessionCookie {
  profileId: string;
  role: 'user' | 'agent' | 'admin';
  createdAt: string;
}

/**
 * Generate a secure cookie header for setting auth_session
 * Used by verify-otp endpoint to set the cookie
 */
export function generateAuthCookie(profileId: string, role: string): string {
  const expiry = new Date(Date.now() + COOKIE_EXPIRY_MS);
  const cookieData: AuthSessionCookie = {
    profileId,
    role: (role as 'user' | 'agent' | 'admin') || 'user',
    createdAt: new Date().toISOString(),
  };

  const cookieValue = Buffer.from(JSON.stringify(cookieData)).toString('base64');

  const attrs: string[] = [
    `${COOKIE_NAME}=${cookieValue}`,
    `Path=/`,
    `Expires=${expiry.toUTCString()}`,
    `HttpOnly`,
    `SameSite=Lax`,
  ];

  // Only set Secure in production so local HTTP dev works correctly
  if (process.env.NODE_ENV === 'production') {
    attrs.push('Secure');
  }

  return attrs.join('; ');
}

/**
 * Parse auth_session cookie value
 */
export function parseAuthCookie(cookieValue: string | undefined): AuthSessionCookie | null {
  if (!cookieValue) return null;

  try {
    const decoded = Buffer.from(cookieValue, 'base64').toString('utf-8');
    return JSON.parse(decoded) as AuthSessionCookie;
  } catch (e) {
    console.error('Failed to parse auth_session cookie:', e);
    return null;
  }
}

/**
 * Generate logout cookie (clears the session)
 */
export function generateLogoutCookie(): string {
  const expiry = new Date(0);
  const attrs = [`${COOKIE_NAME}=; Path=/; Expires=${expiry.toUTCString()}; HttpOnly; SameSite=Lax`];
  if (process.env.NODE_ENV === 'production') {
    attrs[0] = attrs[0] + '; Secure';
  }
  return attrs.join('; ');
}

