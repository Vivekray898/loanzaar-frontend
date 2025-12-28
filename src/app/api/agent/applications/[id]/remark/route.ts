import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/agent/applications/[id]/remark
 * Add a remark to an application.
 * 
 * Rules:
 * - Agent must be assigned to the application
 * - Assignment must be active
 * - Insert remark with agent ID
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = await params
  const { requireAgent } = await import('@/lib/agentAuth')
  const check = await requireAgent(request)
  if (!check.ok) {
    return NextResponse.json({ success: false, error: check.message }, { status: check.status })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 })
  }

  try {
    const agentUserId = check.user.id
    const body = await request.json()
    const { remark, metadata } = body

    if (!remark || typeof remark !== 'string' || remark.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Remark text is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Verify application exists
    const { data: app, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .single()

    if (appError || !app) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 })
    }

    // 2. Verify agent is assigned to this application and assignment is active
    const { data: assignment, error: assignError } = await supabaseAdmin
      .from('application_assignments')
      .select('id')
      .eq('application_id', applicationId)
      .eq('agent_user_id', agentUserId)
      .eq('is_active', true)
      .single()

    if (assignError || !assignment) {
      return NextResponse.json(
        { success: false, error: 'Not assigned to this application' },
        { status: 403 }
      )
    }

    // 3. Insert remark
    const { data: newRemark, error: insertError } = await supabaseAdmin
      .from('application_remarks')
      .insert([
        {
          application_id: applicationId,
          agent_user_id: agentUserId,
          remark: remark.trim(),
          metadata: metadata || null
        }
      ])
      .select()
      .single()

    if (insertError || !newRemark) {
      console.error('Error inserting remark:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create remark' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: newRemark })
  } catch (error: any) {
    console.error('Create remark error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

/**
 * GET /api/agent/applications/[id]/remark
 * Fetch remarks for an application (read-only for assigned agent).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = await params
  const { requireAgent } = await import('@/lib/agentAuth')
  const check = await requireAgent(request)
  if (!check.ok) {
    return NextResponse.json({ success: false, error: check.message }, { status: check.status })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 })
  }

  try {
    const agentUserId = check.user.id
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Verify agent is assigned to this application
    const { data: assignment, error: assignError } = await supabaseAdmin
      .from('application_assignments')
      .select('id')
      .eq('application_id', applicationId)
      .eq('agent_user_id', agentUserId)
      .eq('is_active', true)
      .single()

    if (assignError || !assignment) {
      return NextResponse.json(
        { success: false, error: 'Not assigned to this application' },
        { status: 403 }
      )
    }

    // 2. Fetch remarks
    const { data: remarks, error } = await supabaseAdmin
      .from('application_remarks')
      .select('id, application_id, agent_user_id, remark, created_at, metadata')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching remarks:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: remarks || [] })
  } catch (error: any) {
    console.error('Fetch remarks error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
