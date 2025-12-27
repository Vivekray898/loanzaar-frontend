import { createClient } from '@supabase/supabase-js'

// Client-only Supabase instance (for browser UI)
// Exports a client that uses the publishable/anon key and browser storage.
// Only import this module from client components (do NOT import from server code).

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly in development to help the developer configure envs.
  // Do not log secrets in production.
  // eslint-disable-next-line no-console
  console.warn('Supabase client missing env variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabaseClient = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    // Client should persist session in browser storage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

export default supabaseClient
