/**
 * Session validation endpoint
 * Used by client to verify auth_session cookie and fetch user profile + role
 * 
 * Supports two flows:
 * 1. Cookie-based: GET /api/auth/session (middleware will set cookie)
 * 2. Bearer token: GET /api/auth/session with Authorization header
 */

export const runtime = 'nodejs';

import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseSessionFromCookie, getCookieName } from '@/lib/auth/session';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: NextRequest) {
  try {
    // Extract auth_session cookie
    const cookieName = getCookieName();
    const cookieValue = req.cookies.get(cookieName)?.value;

    if (!cookieValue) {
      return NextResponse.json(
        { success: false, code: 'NO_SESSION', error: 'No auth session found' },
        { status: 401 }
      );
    }

    // Parse and validate session
    const session = parseSessionFromCookie(cookieValue);
    if (!session) {
      return NextResponse.json(
        { success: false, code: 'INVALID_SESSION', error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Fetch profile from DB to verify it still exists and get current role
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id,full_name,email,phone,role,photo_url,verified_at')
      .eq('id', session.profileId)
      .limit(1);

    if (error || !profiles || profiles.length === 0) {
      console.warn('[Auth][session] Profile not found for session:', session.profileId);
      return NextResponse.json(
        { success: false, code: 'PROFILE_NOT_FOUND', error: 'Profile not found' },
        { status: 401 }
      );
    }

    const profile = profiles[0];

    // Format phone for display (+91 prefixed) while keeping DB storage as local 10-digit
    const { formatPhoneForDisplay } = await import('@/lib/phone');
    const displayPhone = formatPhoneForDisplay(profile.phone) || profile.phone || null;

    // Return session + profile data
    return NextResponse.json({
      success: true,
      session: {
        profileId: session.profileId,
        role: profile.role || 'user',
        createdAt: session.createdAt,
      },
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        phone: displayPhone,
        role: profile.role || 'user',
        photoUrl: profile.photo_url,
        verifiedAt: profile.verified_at,
      },
    });
  } catch (err: any) {
    console.error('[Auth][session] Error:', err);
    return NextResponse.json(
      { success: false, code: 'INTERNAL_ERROR', error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
