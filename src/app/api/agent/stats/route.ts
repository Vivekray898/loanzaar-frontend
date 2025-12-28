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

  try {
    const { getAgentStats } = await import('@/services/agentService.server')
    const data = await getAgentStats()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Fetch stats error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
