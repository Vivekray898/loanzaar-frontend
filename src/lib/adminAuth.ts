import { createClient } from '@supabase/supabase-js'

export async function requireAdmin(request: Request) {
  // First, allow internal server calls using a shared secret header
  const internalSecretHeader = request.headers.get('x-internal-secret') || ''
  const internalSecret = process.env.INTERNAL_ADMIN_SECRET || ''
  if (internalSecret && internalSecretHeader === internalSecret) {
    return { ok: true, user: { id: 'internal', internal: true } }
  }

  // Support admin_profile cookie sessions as fallback (signed by server after OTP profile login)
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('admin_profile='));
  if (cookieMatch) {
    const cookieVal = cookieMatch.slice('admin_profile='.length);
    try {
      const { verifyAdminSession } = await import('@/lib/adminSession');
      const profileId = await verifyAdminSession(cookieVal || null);
      if (profileId) {
        // Verify profile exists and is admin using service key
        const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
        const { data: profile, error } = await supabaseAdmin.from('profiles').select('id,role').eq('id', profileId).single();
        if (error || !profile) return { ok: false, status: 403, message: 'Invalid admin session' };
        if (profile.role !== 'admin') return { ok: false, status: 403, message: 'Not an admin' };
        return { ok: true, user: { id: profileId, admin: true } };
      }
    } catch (e) {
      console.error('Failed to validate admin_profile cookie', e);
    }
  }

  // Support unified auth_session cookie (set by verify-otp) so admins can use the same OTP flow
  const authCookieMatch = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('auth_session='));
  if (authCookieMatch) {
    const cookieVal = authCookieMatch.slice('auth_session='.length);
    try {
      const { parseSessionFromCookie } = await import('@/lib/auth/session');
      const session = parseSessionFromCookie(cookieVal);
      if (session && session.profileId) {
        // Confirm current role from DB using service key (don't trust cookie role entirely)
        const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
        const { data: profile, error } = await supabaseAdmin.from('profiles').select('id,role').eq('id', session.profileId).single();
        if (error || !profile) return { ok: false, status: 403, message: 'Invalid auth session' };
        if (profile.role !== 'admin') return { ok: false, status: 403, message: 'Not an admin' };
        return { ok: true, user: { id: session.profileId, admin: true } };
      }
    } catch (e) {
      console.error('Failed to validate auth_session cookie for admin:', e);
    }
  }

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.split(' ')[1]

  if (!token) {
    return { ok: false, status: 401, message: 'Missing authorization token' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return { ok: false, status: 500, message: 'Server config error' }
  }

  // Validate token with Supabase Auth endpoint
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey
    }
  })

  if (!userRes.ok) {
    return { ok: false, status: 401, message: 'Invalid token' }
  }

  const user = await userRes.json()
  if (!user?.id) return { ok: false, status: 401, message: 'Invalid token payload' }

  // Check profile role using service role key (server-side safe)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error) {
    return { ok: false, status: 403, message: 'Unable to verify profile role' }
  }

  if (profile?.role !== 'admin') {
    return { ok: false, status: 403, message: 'Forbidden: Not an admin' }
  }

  return { ok: true, user }
}
