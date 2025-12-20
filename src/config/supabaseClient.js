import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly in development to help the developer configure envs.
  // Do not log secrets in production.
  // eslint-disable-next-line no-console
  console.warn('Supabase client missing env variables: SUPABASE_URL or SUPABASE_ANON_KEY')
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '')

export default supabase
