import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(request: Request, context: { params: any }) {
  // Unwrap dynamic params (Next.js may provide them as a Promise)
  const { params } = context;
  const { id } = (await params) || {};

  // Validate id
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing application id in route' }, { status: 400 });
  }

  // Require caller to be an admin
  const { requireAdmin } = await import('@/lib/adminAuth');
  const check = await requireAdmin(request);
  if (!check.ok) {
    return NextResponse.json({ success: false, error: check.message }, { status: check.status });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase Environment Variables');
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body || {};

    const allowedStatuses = ['new', 'processing', 'on_hold', 'approved', 'rejected'];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('PATCH /api/admin/applications/[id] error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Unknown error' }, { status: 500 });
  }
}