import { createClient } from '@supabase/supabase-js'

export async function requireAdmin(request: Request) {
  // First, allow internal server calls using a shared secret header
  const internalSecretHeader = request.headers.get('x-internal-secret') || ''
  const internalSecret = process.env.INTERNAL_ADMIN_SECRET || ''
  if (internalSecret && internalSecretHeader === internalSecret) {
    return { ok: true, user: { id: 'internal', internal: true } }
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
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { ok: false, status: 403, message: 'Unable to verify profile role' }
  }

  if (profile?.role !== 'admin') {
    return { ok: false, status: 403, message: 'Forbidden: Not an admin' }
  }

  return { ok: true, user }
}
