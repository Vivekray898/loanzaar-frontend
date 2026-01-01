import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

export async function GET(request: Request, context: { params: any }) {
  const { params } = context;
  const { id: applicationId } = (await params) || {};
  if (!applicationId || !isValidUUID(applicationId)) {
    return NextResponse.json({ success: false, error: 'Invalid application ID' }, { status: 400 });
  }

  const { requireAdmin } = await import('@/lib/adminAuth');
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) {
    return NextResponse.json({ success: false, error: adminCheck.message }, { status: adminCheck.status });
  }

  try {
    const { getAdminApplicationById } = await import('@/lib/queries/applications');
    const result = await getAdminApplicationById(applicationId);
    if (!result) return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('GET /api/admin/applications/[id] error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: any }) {
  // Unwrap dynamic params (Next.js may provide them as a Promise)
  const { params } = context;
  const { id: applicationId } = (await params) || {};

  // ✅ Validate applicationId from route params
  if (!applicationId || !isValidUUID(applicationId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid application ID' },
      { status: 400 }
    );
  }

  // ✅ Require caller to be an admin and validate session
  const { requireAdmin } = await import('@/lib/adminAuth');
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) {
    return NextResponse.json({ success: false, error: adminCheck.message }, { status: adminCheck.status });
  }

  // ✅ Validate admin session has user ID
  if (!adminCheck.user?.id || !isValidUUID(adminCheck.user.id)) {
    console.error('❌ Admin user ID is missing or invalid:', adminCheck.user?.id);
    return NextResponse.json(
      { success: false, error: 'Unauthorized: invalid admin session' },
      { status: 401 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase Environment Variables');
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { status, assigned_to } = body || {};

    // ✅ Validate incoming status value
    const allowedStatuses = ['new', 'processing', 'on_hold', 'approved', 'rejected'];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 });
    }

    // ✅ Validate assigned_to if provided
    if (assigned_to && !isValidUUID(assigned_to)) {
      return NextResponse.json({ success: false, error: 'Invalid assigned_to UUID' }, { status: 400 });
    }

    // ✅ Add defensive logging before DB write
    console.log('[PATCH /api/admin/applications] Payload:', {
      applicationId,
      status,
      assigned_to: assigned_to || null,
      adminId: adminCheck.user.id,
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ Get current application status for history logging
    const { data: currentApp, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    if (fetchError || !currentApp) {
      console.error('❌ Failed to fetch current application:', fetchError?.message);
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const previousStatus = currentApp.status;

    // ✅ Update application status only (NOT assigned_to - use application_assignments table)
    const { data: updatedApp, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        status,
        updated_at: new Date(),
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update application status:', updateError);
      return NextResponse.json(
        { success: false, error: `Failed to update application: ${updateError.message}` },
        { status: 500 }
      );
    }

    // ✅ Handle assignment separately via application_assignments table (single source of truth)
    if (assigned_to) {
      // Deactivate all existing active assignments for this application
      const { error: deactivateError } = await supabaseAdmin
        .from('application_assignments')
        .update({ is_active: false })
        .eq('application_id', applicationId)
        .eq('is_active', true);

      if (deactivateError) {
        console.warn('⚠️ Warning: Failed to deactivate previous assignments:', deactivateError.message);
        // Non-fatal: continue with new assignment
      }

      // Create new active assignment
      const { error: assignmentError } = await supabaseAdmin
        .from('application_assignments')
        .insert([
          {
            application_id: applicationId,
            agent_user_id: assigned_to,
            assigned_by: adminCheck.user.id,
          },
        ]);

      if (assignmentError) {
        console.error('❌ Failed to create application assignment:', assignmentError.message);
        return NextResponse.json(
          { success: false, error: `Failed to assign application: ${assignmentError.message}` },
          { status: 500 }
        );
      }

      console.log(`✅ Application ${applicationId} assigned to agent ${assigned_to} by admin ${adminCheck.user.id}`);
    }

    // ✅ Create status history entry with valid UUID
    const { error: historyError } = await supabaseAdmin
      .from('application_status_logs')
      .insert([
        {
          application_id: applicationId,
          actor_user_id: adminCheck.user.id,
          actor_role: 'admin',
          action: 'approved', // Admin approves status changes
          from_status: previousStatus,
          to_status: status,
          reason: body.reason || null,
        },
      ]);

    if (historyError) {
      console.warn('⚠️ Warning: Failed to create status history:', historyError.message);
      // Non-fatal: return success but log the warning
    }

    console.log(`✅ Successfully updated application ${applicationId} status to ${status}`);

    return NextResponse.json({
      success: true,
      data: updatedApp,
    });
  } catch (err: any) {
    console.error('❌ PATCH /api/admin/applications/[id] error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}