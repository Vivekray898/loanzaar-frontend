import { createClient } from '@supabase/supabase-js'

export async function getAgentStats() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Server config error')
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  const { count: appCount } = await supabaseAdmin
    .from('application_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return {
    assigned: appCount || 0,
    pending: Math.floor((appCount || 0) * 0.3)
  }
}
