import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

/**
 * POST /api/admin/applications/[id]/approve
 * Admin approves an agent-submitted status change.
 * 
 * Body: { action: 'approve' | 'reject', reason?: string }
 * 
 * On approve:
 * - Set approval_status to 'approved'
 * - Application becomes visible to user
 * 
 * On reject:
 * - Set approval_status to 'rejected'
 * - Reset status to previous value
 * - Return to agent for revision
 */
export async function POST(req: Request, context: { params: any }) {
  try {
    const { params } = context;
    const { id: applicationId } = (await params) || {};

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Missing application id' },
        { status: 400 }
      );
    }

    // ✅ Validate admin session
    const { requireAdmin } = await import('@/lib/adminAuth');
    const check = await requireAdmin(req);
    if (!check.ok) {
      return NextResponse.json(
        { success: false, error: check.message || 'Unauthorized' },
        { status: check.status || 401 }
      );
    }

    const adminId = check.user?.id;
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin session' },
        { status: 401 }
      );
    }

    // ✅ Parse request body
    const body = await req.json();
    const { action, reason } = body || {};

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ Fetch current application
    const { data: appRow, error: appErr } = await supabaseAdmin
      .from('applications')
      .select('id,status,approval_status')
      .eq('id', applicationId)
      .single();

    if (appErr || !appRow) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // ✅ Can only approve if approval is pending
    if (appRow.approval_status !== 'pending_admin_approval') {
      return NextResponse.json(
        { success: false, error: `Cannot approve. Current approval status: ${appRow.approval_status}` },
        { status: 400 }
      );
    }

    const previousStatus = appRow.status;

    // ✅ Handle approval vs rejection
    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (action === 'approve') {
      updateData.approval_status = 'approved';
    } else if (action === 'reject') {
      // ✅ On rejection, reset to "new" status
      updateData.status = 'new';
      updateData.approval_status = 'rejected';
    }

    // ✅ Update application
    const { data: updatedApp, error: updateErr } = await supabaseAdmin
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (updateErr) {
      console.error('❌ Failed to update application approval:', updateErr);
      return NextResponse.json(
        { success: false, error: `Failed to update application: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // ✅ Create history entry
    const { error: historyErr } = await supabaseAdmin
      .from('application_status_logs')
      .insert([
        {
          application_id: applicationId,
          actor_user_id: adminId,
          actor_role: 'admin',
          action: action === 'approve' ? 'approved' : 'rejected',
          from_status: previousStatus,
          to_status: action === 'approve' ? previousStatus : 'new',
          reason: reason || `Admin ${action}d agent submission`,
        },
      ]);

    if (historyErr) {
      console.warn('⚠️ History logging failed:', historyErr.message);
      // Non-fatal
    }

    console.log(`✅ Admin ${adminId} ${action}d application ${applicationId} (agent submission)`);

    return NextResponse.json({
      success: true,
      data: updatedApp,
    });
  } catch (err: any) {
    console.error('❌ POST /api/admin/applications/[id]/approve error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
