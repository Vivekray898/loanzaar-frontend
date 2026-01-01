import { createClient } from '@supabase/supabase-js'

/**
 * Server-side authorization helper for agent endpoints.
 * Validates Bearer token and ensures caller has agent role.
 * 
 * Returns { ok: true, user } on success.
 * Returns { ok: false, status, message } on failure.
 */
export async function requireAgent(request: Request) {
  // First, allow internal server calls using a shared secret header
  const internalSecretHeader = request.headers.get('x-internal-secret') || ''
  const internalSecret = process.env.INTERNAL_ADMIN_SECRET || ''
  if (internalSecret && internalSecretHeader === internalSecret) {
    return { ok: true, user: { id: 'internal', internal: true } }
  }

  // Support unified auth_session cookie so agents logged in via OTP can access agent endpoints
  const cookieHeader = request.headers.get('cookie') || '';
  const authCookieMatch = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('auth_session='));
  if (authCookieMatch) {
    const cookieVal = authCookieMatch.slice('auth_session='.length);
    try {
      const { validateSessionInDb } = await import('@/lib/auth/session');
      const result = await validateSessionInDb(cookieVal);
      if (!result.valid) {
        console.warn('[AgentAuth] auth_session invalid for agent check:', result.reason, 'profileId:', result.session?.profileId || 'unknown');
        // Return explicit failure so caller can differentiate
        if (result.reason === 'expired' || result.reason === 'session_missing') return { ok: false, status: 401, message: 'Agent auth session invalid' }
        if (result.reason === 'revoked') return { ok: false, status: 403, message: 'Agent auth session revoked' }
        return { ok: false, status: 401, message: 'Agent auth session invalid' }
      }

      // Confirm role server-side
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && supabaseServiceKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
        const { data: profile, error } = await supabaseAdmin.from('profiles').select('id,role').eq('id', result.session!.profileId).single()
        if (!error && profile && profile.role === 'agent') {
          return { ok: true, user: { id: result.session!.profileId } }
        }
        // Not an agent
        console.warn('[AgentAuth] auth_session profile not agent, profileId:', result.session!.profileId);
        return { ok: false, status: 403, message: 'Not an agent' }
      }
    } catch (e) {
      console.error('Failed to validate auth_session cookie for agent:', e);
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

  if (profile?.role !== 'agent') {
    return { ok: false, status: 403, message: 'Forbidden: Not an agent' }
  }

  return { ok: true, user }
}
