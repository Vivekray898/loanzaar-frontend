import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/agent/stats
 * Fetch stats for the current agent.
 * Used by dashboard (server-side with internal secret).
 */
export async function GET(request: Request) {
  // Allow internal server calls using a shared secret header
  const internalSecret = request.headers.get('x-internal-secret')
  if (internalSecret !== process.env.INTERNAL_ADMIN_SECRET) {
    // Otherwise require agent auth
    const { requireAgent } = await import('@/lib/agentAuth')
    const check = await requireAgent(request)
    if (!check.ok) {
      return NextResponse.json({ success: false, error: check.message }, { status: check.status })
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 })
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Count applications
    const { count: appCount } = await supabaseAdmin
      .from('application_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    return NextResponse.json({
      success: true,
      data: {
        assigned: appCount || 0,
        pending: Math.floor((appCount || 0) * 0.3) // Mock: 30% pending
      }
    })
  } catch (error: any) {
    console.error('Fetch stats error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
