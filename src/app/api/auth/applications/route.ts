import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const queryProfileId = url.searchParams.get('profileId');
    const limit = Number(url.searchParams.get('limit') || '20');
    const offset = Number(url.searchParams.get('offset') || '0');

    if (!supabaseUrl || !supabaseServiceKey) return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // If Authorization header present, resolve user's profile and ignore queryProfileId
    const authHeader = req.headers.get('authorization');
    let profileId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      // Try to resolve user from token
      let userId: string | null = null;
      let userEmail: string | null = null;
      let userPhone: string | null = null;

      try {
        let resp: any = null;
        try {
          resp = await (supabaseAdmin.auth as any).getUser(token);
        } catch (e) {
          try {
            resp = await (supabaseAdmin.auth as any).getUser({ access_token: token });
          } catch (e2) {
            resp = null;
          }
        }
        const user = resp?.data?.user || null;
        if (user) {
          userId = user.id;
          userEmail = user.email || null;
          userPhone = user.phone || null;
        }
      } catch (err) {
        console.warn('Failed to resolve user from token:', err);
      }

      if (!userId) {
        try {
          const parts = token.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            userId = payload?.sub || null;
            userEmail = userEmail || payload?.email || null;
            userPhone = userPhone || payload?.phone || null;
          }
        } catch (err) {
          console.warn('Failed to decode token payload:', err);
        }
      }

      if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized - failed to resolve user' }, { status: 401 });

      // Try to find a verified profile for this user via a few methods
      // trySelect - helper to find a profile. For the authenticated user we allow
      // returning the profile even if `phone_verified` is false when looking up by id/user_id
      const trySelect = async (filter: any, options: { allowUnverified?: boolean } = {}) => {
        const q = supabaseAdmin.from('profiles').select('id').limit(1);
        let res: any;
        const allowUnverified = !!options.allowUnverified;

        if (filter.id) {
          res = allowUnverified ? await q.eq('id', filter.id) : await q.eq('id', filter.id).eq('phone_verified', true);
        } else if (filter.user_id) {
          res = allowUnverified ? await q.eq('user_id', filter.user_id) : await q.eq('user_id', filter.user_id).eq('phone_verified', true);
        } else if (filter.email) {
          res = await q.eq('email', filter.email).eq('phone_verified', true);
        } else if (filter.phone) {
          const { normalizePhoneForStorage } = await import('@/lib/phone');
          const storagePhone = normalizePhoneForStorage(filter.phone);
          res = await q.eq('phone', storagePhone).eq('phone_verified', true);
        } else return null;

        if (res?.error) return null;
        const arr = res?.data || [];
        return (arr && arr.length) ? arr[0] : null;
      };

      // When resolving the currently authenticated user, allow looking up by id or user_id
      // without requiring phone verification (they are the authenticated owner)
      let profile = await trySelect({ id: userId }, { allowUnverified: true });
      if (!profile) profile = await trySelect({ user_id: userId }, { allowUnverified: true });
      if (!profile && userEmail) profile = await trySelect({ email: userEmail });
      if (!profile && userPhone) profile = await trySelect({ phone: userPhone });

      if (!profile) {
        // No profile found for user – return empty list
        return NextResponse.json({ success: true, data: [] });
      }

      profileId = profile.id;
    } else if (queryProfileId) {
      // Fallback: older clients may pass profileId directly
      profileId = queryProfileId;
    } else {
      return NextResponse.json({ success: false, error: 'profileId required or Authorization header' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('id, product_type, product_category, status, application_stage, created_at, metadata')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching applications for profile:', error);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Applications GET unexpected error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
