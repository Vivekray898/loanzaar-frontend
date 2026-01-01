export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { parseSessionFromCookie, getCookieName } from '@/lib/auth/session';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET /api/admin/session
 * Validates admin role and returns admin profile
 * Uses the same auth_session cookie as regular auth
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieName = getCookieName();
    const authCookie = cookieStore.get(cookieName)?.value;

    if (!authCookie) {
      return NextResponse.json(
        { success: false, error: 'No session cookie' },
        { status: 401 }
      );
    }

    // Validate and parse the session cookie
    const session = parseSessionFromCookie(authCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Fetch profile to verify role
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id,phone,full_name,role,phone_verified,verified_at,created_at')
      .eq('id', session.profileId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check admin role
    if (profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        phone: profile.phone,
        fullName: profile.full_name,
        role: profile.role,
        phoneVerified: profile.phone_verified,
        verifiedAt: profile.verified_at,
        createdAt: profile.created_at,
      },
    });
  } catch (err: any) {
    console.error('[Admin] Session validation error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}