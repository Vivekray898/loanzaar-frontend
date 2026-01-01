import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(req: Request, context: { params: any }) {
  try {
    const { params } = context;
    const { id } = (await params) || {};

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing application id' }, { status: 400 });
    }

    // Validate agent session
    const { requireAgent } = await import('@/lib/agentAuth');
    const check = await requireAgent(req as unknown as Request);
    if (!check.ok) {
      return NextResponse.json({ success: false, error: check.message || 'Unauthorized' }, { status: check.status || 401 });
    }

    const agentId = check.user?.id;

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
      .eq('application_id', id)
      .eq('agent_user_id', agentId)
      .eq('is_active', true)
      .single();

    if (assignmentErr || !assignment) {
      console.warn(`[Agent History] Agent ${agentId} not assigned to application ${id}`);
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // ✅ Verify application exists
    const { data: appRow, error: appErr } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('id', id)
      .limit(1)
      .single();

    if (appErr || !appRow) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    // Fetch ordered status history
    const { data: logs, error: logsErr } = await supabaseAdmin
      .from('application_status_logs')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: true });

    if (logsErr) {
      console.error('Failed to fetch application status logs:', logsErr);
      return NextResponse.json({ success: false, error: 'Failed to load history' }, { status: 500 });
    }

    if (!logs || logs.length === 0) {
      return NextResponse.json({ success: false, error: 'No history' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    console.error('GET /api/agent/applications/[id]/history error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
