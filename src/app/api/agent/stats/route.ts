import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAgent } from '@/lib/agentAuth'

export const runtime = 'nodejs'

/**
 * GET /api/agent/stats
 * Fetch stats for the current agent.
 * Used by dashboard (server-side with internal secret).
 */
export async function GET(request: Request) {
  const check = await requireAgent(request)
  if (!check.ok) {
    return NextResponse.json({ success: false, error: check.message }, { status: check.status })
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
