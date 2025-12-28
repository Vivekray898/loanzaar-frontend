import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // Require caller to be an admin
  const { requireAdmin } = await import('@/lib/adminAuth')
  const check = await requireAdmin(request)
  if (!check.ok) {
    return NextResponse.json({ success: false, error: check.message }, { status: check.status })
  }

  // 1. Safety Check: Ensure keys exist before crashing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase Environment Variables');
    return NextResponse.json(
      { success: false, error: 'Internal Server Configuration Error: Missing API Keys' }, 
      { status: 500 }
    );
  }

  // 2. Initialize Client
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 3. Use Wildcard Select (*)
    const { data: applications, error, count } = await supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact' }) 
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: applications,
      meta: { total: count, limit, offset }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/applications/assign
 * Assign an application to an agent.
 * 
 * Body: { application_id, agent_user_id }
 * - Deactivates existing active assignment for this application
 * - Inserts new assignment as active
 * - Returns the new assignment
 */
export async function POST(request: Request) {
  // Require caller to be an admin
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
    const body = await request.json()
    const { application_id, agent_user_id } = body

    if (!application_id || !agent_user_id) {
      return NextResponse.json(
        { success: false, error: 'Missing application_id or agent_user_id' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Verify application exists
    const { data: app, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('id', application_id)
      .single()

    if (appError || !app) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 })
    }

    // 2. Verify agent profile exists and has agent role
    const { data: agentProfile, error: agentError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', agent_user_id)
      .single()

    if (agentError || !agentProfile) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }

    if (agentProfile.role !== 'agent') {
      return NextResponse.json(
        { success: false, error: 'User is not an agent' },
        { status: 400 }
      )
    }

    // 3. Check for existing active assignment
    const { data: existingActive, error: existingErr } = await supabaseAdmin
      .from('application_assignments')
      .select('*')
      .eq('application_id', application_id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (existingErr && existingErr.code !== 'PGRST116') {
      console.error('Error querying existing assignment:', existingErr)
      return NextResponse.json({ success: false, error: 'Failed to query existing assignment' }, { status: 500 })
    }

    // If already assigned to the same agent, return existing assignment and avoid duplicate
    if (existingActive && existingActive.agent_user_id === agent_user_id) {
      return NextResponse.json({ success: true, data: existingActive, message: 'Already assigned to this agent' })
    }

    // 4. Deactivate existing active assignment for this application
    const { error: deactivateError } = await supabaseAdmin
      .from('application_assignments')
      .update({ is_active: false })
      .eq('application_id', application_id)
      .eq('is_active', true)

    if (deactivateError) {
      console.error('Error deactivating old assignment:', deactivateError)
      return NextResponse.json(
        { success: false, error: 'Failed to deactivate old assignment' },
        { status: 500 }
      )
    }

    // 5. Insert new active assignment
    const { data: newAssignment, error: insertError } = await supabaseAdmin
      .from('application_assignments')
      .insert([
        {
          application_id,
          agent_user_id,
          assigned_by: check.user.id,
          is_active: true
        }
      ])
      .select()
      .single()

    if (insertError || !newAssignment) {
      return NextResponse.json(
        { success: false, error: 'Failed to create assignment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: newAssignment })
  } catch (error: any) {
    console.error('Assign application error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}