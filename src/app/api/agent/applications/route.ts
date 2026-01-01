import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAgent } from '@/lib/agentAuth'

export const runtime = 'nodejs'

/**
 * GET /api/agent/applications
 * Fetch applications assigned to the current agent (active assignments only).
 */
export async function GET(request: Request) {
  const check = await requireAgent(request)
  if (!check.ok) {
    return NextResponse.json({ success: false, error: check.message }, { status: check.status })
  }

  if (!check.user?.id) {
    return NextResponse.json({ success: false, error: 'Invalid user session' }, { status: 401 })
  }

  try {
    const agentUserId = check.user.id
    const { getAgentApplications } = await import('@/lib/queries/applications')
    const { data, total } = await getAgentApplications(agentUserId, { skip: 0, take: 100 })
    return NextResponse.json({ success: true, data, meta: { total } })
  } catch (error: any) {
    console.error('Fetch agent applications error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
