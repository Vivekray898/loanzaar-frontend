import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/agent/applications
 * Fetch applications assigned to the current agent (active assignments only).
 */
export async function GET(request: Request) {
  const { requireAgent } = await import('@/lib/agentAuth')
  const check = await requireAgent(request)
  if (!check.ok) {
    return NextResponse.json({ success: false, error: check.message }, { status: check.status })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase config for agent applications API', { supabaseUrl: !!supabaseUrl, hasServiceKey: !!supabaseServiceKey })
    return NextResponse.json({ success: false, error: 'Server config error: missing supabase settings' }, { status: 500 })
  }

  try {
    const agentUserId = check.user.id
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Find all active assignments for this agent
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from('application_assignments')
      .select('application_id')
      .eq('agent_user_id', agentUserId)
      .eq('is_active', true)

    if (assignError) {
      console.error('Error fetching assignments:', assignError)
      return NextResponse.json({ success: false, error: assignError.message }, { status: 500 })
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // 2. Fetch applications for these assignments
    const appIds = assignments.map(a => a.application_id)
    const { data: applications, error: appError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .in('id', appIds)
      .order('created_at', { ascending: false })

    if (appError) {
      console.error('Error fetching applications:', appError)
      return NextResponse.json({ success: false, error: appError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: applications || [] })
  } catch (error: any) {
    console.error('Fetch agent applications error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
