import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

/**
 * POST /api/agent/applications/[id]/status
 * Update application status as an agent.
 * 
 * Agent can only:
 * - Update applications assigned to them
 * - Use agent-specific status values
 */
export async function POST(req: Request, context: { params: any }) {
  try {
    const { params } = context;
    const { id: applicationId } = (await params) || {};

    // ✅ Validate applicationId
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Missing application id' },
        { status: 400 }
      );
    }

    // ✅ Validate agent session
    const { requireAgent } = await import('@/lib/agentAuth');
    const check = await requireAgent(req);
    if (!check.ok) {
      return NextResponse.json(
        { success: false, error: check.message || 'Unauthorized' },
        { status: check.status || 401 }
      );
    }

    const agentId = check.user?.id;
    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent session' },
        { status: 401 }
      );
    }

    // ✅ Parse request body
    const body = await req.json();
    const { status: newStatus } = body || {};

    // ✅ Validate status is provided
    if (!newStatus) {
      return NextResponse.json(
        { success: false, error: 'Status value is required' },
        { status: 400 }
      );
    }

    // ✅ Validate agent-specific status values (agents can only set these)
    const allowedAgentStatuses = ['contacted', 'docs_collected', 'eligible', 'rejected', 'recommended'];
    if (!allowedAgentStatuses.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Allowed values: ${allowedAgentStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ CRITICAL: Check assignment via application_assignments table (single source of truth)
    const { data: assignment, error: assignmentErr } = await supabaseAdmin
      .from('application_assignments')
      .select('id')
      .eq('application_id', applicationId)
      .eq('agent_user_id', agentId)
      .eq('is_active', true)
      .single();

    if (assignmentErr || !assignment) {
      console.warn(`[Agent Status] Agent ${agentId} not assigned to application ${applicationId}`);
      return NextResponse.json(
        { success: false, error: 'You are not assigned to this application' },
        { status: 403 }
      );
    }

    // ✅ Fetch application current status for history logging
    const { data: appRow, error: appErr } = await supabaseAdmin
      .from('applications')
      .select('id,status')
      .eq('id', applicationId)
      .single();

    if (appErr || !appRow) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const previousStatus = appRow.status;

    // ✅ Update application status AND mark as pending admin approval
    const { data: updatedApp, error: updateErr } = await supabaseAdmin
      .from('applications')
      .update({
        status: newStatus,
        updated_at: new Date(),
        approval_status: 'pending_admin_approval', // ✅ Mark for admin review
        last_agent_action_by: agentId,             // ✅ Track which agent updated
        last_agent_action_at: new Date(),          // ✅ Track when
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateErr) {
      console.error('❌ Failed to update application status:', updateErr);
      return NextResponse.json(
        { success: false, error: `Failed to update status: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // ✅ Create status history entry
    const { error: historyErr } = await supabaseAdmin
      .from('application_status_logs')
      .insert([
        {
          application_id: applicationId,
          actor_user_id: agentId,
          actor_role: 'agent',
          action: 'proposed', // Agent proposes status changes
          from_status: previousStatus,
          to_status: newStatus,
          reason: body.reason || null,
        },
      ]);

    if (historyErr) {
      console.warn('⚠️ Status updated but history logging failed:', historyErr.message);
      // Non-fatal: still return success but log the warning
    }

    // ✅ Log mutation for audit
    console.log(`✅ Agent ${agentId} updated application ${applicationId} status from ${previousStatus} to ${newStatus}`);

    return NextResponse.json({
      success: true,
      data: updatedApp,
    });
  } catch (err: any) {
    console.error('❌ POST /api/agent/applications/[id]/status error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
