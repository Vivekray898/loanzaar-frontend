/**
 * Session utilities for unified OTP auth system
 * Server-side session creation and validation
 */

import { generateAuthCookie, parseAuthCookie, COOKIE_NAME } from './cookies';

export interface SessionData {
  profileId: string;
  role: 'user' | 'agent' | 'admin';
  createdAt: string;
}

/**
 * Create a new auth session
 * Called by verify-otp endpoint after successful OTP verification
 * Returns the Set-Cookie header value
 */
export function createSession(profileId: string, role: string): { cookieHeader: string; session: SessionData } {
  const session: SessionData = {
    profileId,
    role: (role as 'user' | 'agent' | 'admin') || 'user',
    createdAt: new Date().toISOString(),
  };

  const cookieHeader = generateAuthCookie(profileId, role);
  return { cookieHeader, session };
}

/**
 * Parse and validate session from cookie
 * Returns null if cookie is invalid or missing
 */
export function parseSessionFromCookie(cookieValue: string | undefined): SessionData | null {
  const parsed = parseAuthCookie(cookieValue);
  if (!parsed) return null;

  // Validate required fields
  if (!parsed.profileId || !parsed.role) {
    console.warn('Invalid auth_session cookie structure');
    return null;
  }

  return {
    profileId: parsed.profileId,
    role: parsed.role as 'user' | 'agent' | 'admin',
    createdAt: parsed.createdAt,
  };
}

/**
 * Validate session existence in DB and return status
 */
export async function validateSessionInDb(cookieValue: string | undefined): Promise<{ valid: boolean; reason?: 'session_missing' | 'expired' | 'revoked' | 'invalid_cookie' | 'db_error'; session?: SessionData } > {
  try {
    const session = parseSessionFromCookie(cookieValue);
    if (!session) return { valid: false, reason: 'invalid_cookie' };

    // Use Supabase service role to inspect auth_sessions table
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find latest session record for this profile
    const { data: rows, error } = await supabaseAdmin
      .from('auth_sessions')
      .select('id,revoked,expires_at,created_at')
      .eq('profile_id', session.profileId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[Auth][session] Error querying auth_sessions:', error.message || error);
      return { valid: false, reason: 'db_error' };
    }

    const rec = (rows && rows[0]) || null;
    if (!rec) return { valid: false, reason: 'session_missing' };

    // Check revoked
    if (rec.revoked) return { valid: false, reason: 'revoked' };

    // Check expiry
    const now = new Date();
    if (new Date(rec.expires_at) < now) return { valid: false, reason: 'expired' };

    // Looks valid
    return { valid: true, session };
  } catch (err) {
    console.error('[Auth][session] validateSessionInDb unexpected error:', err);
    return { valid: false, reason: 'db_error' };
  }
}
/**
 * Check if auth_session cookie exists (for Edge Runtime)
 * Used by middleware to do lightweight checks
 */
export function hasAuthCookie(cookieValue: string | undefined): boolean {
  return !!cookieValue && cookieValue.length > 0;
}

/**
 * Get cookie name for consistent reference across the app
 */
export function getCookieName(): string {
  return COOKIE_NAME;
}
