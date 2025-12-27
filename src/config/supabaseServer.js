import { createClient } from '@supabase/supabase-js'

// Server-only Supabase factory. Do NOT export or hard-code the service role key.
// Usage (server-side only):
// const supabase = createServerSupabase();

export function createServerSupabase(serviceKey = process.env.SUPABASE_SERVICE_ROLE) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = serviceKey || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!SUPABASE_URL || !key) {
    // Caller should handle errors; avoid throwing during import time
    console.warn('createServerSupabase: missing SUPABASE_URL or service key');
  }

  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false },
  })
}

export default createServerSupabase
