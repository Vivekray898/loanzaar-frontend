import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/admin/applications/[id]/remarks
 * Fetch all remarks for an application.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = await params
  const { requireAdmin } = await import('@/lib/adminAuth')
  const check = await requireAdmin(request)
  if (!check.ok) {
    return NextResponse.json({ success: false, error: check.message }, { status: check.status })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 })
  }

  try {
    // Verify application exists
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: app, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .single()

    if (appError || !app) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 })
    }

    // Fetch remarks with agent profile info
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
