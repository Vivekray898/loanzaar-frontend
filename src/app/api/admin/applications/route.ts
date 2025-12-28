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