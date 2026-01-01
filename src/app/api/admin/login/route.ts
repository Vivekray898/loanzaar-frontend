import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signAdminSession, getAdminCookieHeader, clearAdminCookieHeader } from '@/lib/adminSession';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileId } = body || {};
    if (!profileId) return NextResponse.json({ success: false, error: 'profileId required' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) return NextResponse.json({ success: false, error: 'Server config' }, { status: 500 });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile, error } = await supabaseAdmin.from('profiles').select('id,role').eq('id', profileId).single();
    if (error) {
      console.error('Admin login: profile lookup failed', error);
      return NextResponse.json({ success: false, error: 'Profile lookup failed' }, { status: 500 });
    }

    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    if (profile.role !== 'admin') return NextResponse.json({ success: false, error: 'Not an admin' }, { status: 403 });

    // Sign session and set HttpOnly cookie
    try {
      const cookieValue = await signAdminSession(profileId);
      const maxAge = Number(process.env.ADMIN_SESSION_TTL_SECONDS || 60 * 60 * 24);
      const cookie = getAdminCookieHeader(cookieValue, maxAge);
      const res = NextResponse.json({ success: true });
      res.headers.append('Set-Cookie', cookie);
      return res;
    } catch (e) {
      console.error('Failed to create admin session cookie:', e);
      return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 500 });
    }

  } catch (err: any) {
    console.error('Admin login error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  // Clear the admin cookie
  const res = NextResponse.json({ success: true });
  res.headers.append('Set-Cookie', clearAdminCookieHeader());
  return res;
}
