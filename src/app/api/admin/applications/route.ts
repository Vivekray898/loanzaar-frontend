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
    const status = searchParams.get('status') || null;
    const approvalStatus = searchParams.get('approvalStatus') || null;  // ✅ NEW: Filter by approval_status
    const product_type = searchParams.get('product_type') || null;
    const profileId = searchParams.get('profileId') || null;
    const search = searchParams.get('search') || null;
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortDir = (searchParams.get('sortDir') || 'desc').toLowerCase() === 'asc' ? { ascending: true } : { ascending: false };

    // 3. Select required fields and include related profile info (id, full_name, email, phone)
    // ✅ UPDATED: Include approval_status, last_agent_action_by, last_agent_action_at
    // Use explicit selects for stable UI fields
    let query = supabaseAdmin
      .from('applications')
      .select(`id,created_at,full_name,mobile_number,email,city,product_category,product_type,application_stage,status,source,metadata,address_line_1,address_line_2,pincode,state,ip,user_agent,profile_id,approval_status,last_agent_action_by,last_agent_action_at,profiles(id,full_name,email,phone,phone_verified)`, { count: 'exact' })
      .order(sortBy, sortDir)
      .range(offset, offset + limit - 1);

    // 4. Apply filters
    if (status) query = query.eq('status', status);
    if (approvalStatus) query = query.eq('approval_status', approvalStatus);  // ✅ Filter by approval status
    if (product_type) query = query.eq('product_type', product_type);
    if (profileId) query = query.eq('profile_id', profileId);

    // 5. Search (name or mobile)
    if (search) {
      // Use ilike for case-insensitive partial match across full_name and mobile_number
      const term = `%${search}%`;
      query = query.or(`full_name.ilike.${term},mobile_number.ilike.${term},email.ilike.${term}`);
    }

    const { data: applications, error, count } = await query;

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
      .eq('id', agent_user_id)
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