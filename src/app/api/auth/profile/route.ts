import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseSessionFromCookie, getCookieName } from '@/lib/auth/session';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Profile API requires SUPABASE_SERVICE_ROLE_KEY and URL');
}

export async function PUT(req: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 });
    }

    // Require valid session
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cookieName = getCookieName();
    const authCookie = cookieStore.get(cookieName)?.value;
    const session = authCookie ? parseSessionFromCookie(authCookie) : null;
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await req.json();
    const { id, phone, full_name, email, address, photo_url } = body || {};

    if (!id && !phone) {
      return NextResponse.json({ success: false, error: 'id or phone required' }, { status: 400 });
    }

    // Normalize phone for storage and prevent role changes via this endpoint (only admin should change roles)
    const { normalizePhoneForStorage, formatPhoneForDisplay } = await import('@/lib/phone');
    const storagePhone = phone ? normalizePhoneForStorage(phone) : null;

    const payload: any = {
      full_name: full_name ?? null,
      email: email ?? null,
      phone: storagePhone ?? null,
      address: address ?? null,
      photo_url: photo_url ?? null,
      updated_at: new Date().toISOString()
    };

    // If id provided, only allow if updating your own profile or if admin
    let result: any = null;
    if (id) {
      if (session.profileId !== id && session.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Insufficient permissions to update this profile' }, { status: 403 });
      }

      payload.id = id;
      const { data, error } = await supabaseAdmin.from('profiles').upsert([payload], { onConflict: 'id' }).select();
      if (error) {
        console.error('Failed to upsert profile by id:', error);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
      }
      result = Array.isArray(data) ? data[0] : data;
    } else {
      // Upserting by phone - ensure phone belongs to the session user
      if (session.role !== 'admin') {
        // Non-admins may only update their own phone - ensure session profile has same phone
        const { data: me, error: meErr } = await supabaseAdmin.from('profiles').select('phone').eq('id', session.profileId).single();
        if (meErr || !me) {
          return NextResponse.json({ success: false, error: 'Unable to verify session profile' }, { status: 500 });
        }
        if (me.phone !== storagePhone) {
          return NextResponse.json({ success: false, error: 'Cannot update other profiles' }, { status: 403 });
        }
      }

      const { data, error } = await supabaseAdmin.from('profiles').upsert([payload], { onConflict: 'phone' }).select();
      if (error) {
        console.error('Failed to upsert profile by phone:', error);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
      }
      result = Array.isArray(data) ? data[0] : data;
    }

    // Format phone for display before returning
    try {
      if (result && result.phone) {
        result.phone = formatPhoneForDisplay(result.phone) || result.phone;
      }
    } catch (e) {}

    return NextResponse.json({ success: true, profile: result });
  } catch (err: any) {
    console.error('Profile PUT error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // support reading via query param id as fallback
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 });
    }

    // Require session and only allow admin or the owner to fetch
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cookieName = getCookieName();
    const authCookie = cookieStore.get(cookieName)?.value;
    const session = authCookie ? parseSessionFromCookie(authCookie) : null;
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin' && session.profileId !== id) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
    if (error) {
      console.error('Profile GET error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    // Format phone for display
    try {
      const { formatPhoneForDisplay } = await import('@/lib/phone');
      if (data && data.phone) data.phone = formatPhoneForDisplay(data.phone) || data.phone;
    } catch (e) {}

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    console.error('Profile GET unexpected error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}