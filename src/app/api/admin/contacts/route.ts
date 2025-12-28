import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: Request) {
  try {
    // Verify caller is an admin
    const { requireAdmin } = await import('@/lib/adminAuth')
    const check = await requireAdmin(request)
    if (!check.ok) {
      return NextResponse.json({ success: false, error: check.message }, { status: check.status })
    }

    // 1. Setup Admin Client with Service Role Key (Bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Service Role Key for Admin API');
        return NextResponse.json({ success: false, error: 'Server Config Error: Missing Keys' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 2. Fetch All Fields ('*')
    const { data: messages, error, count } = await supabaseAdmin
      .from('contact_messages')
      .select('*', { count: 'exact' }) 
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data: messages, 
      meta: { total: count } 
    });

  } catch (error: any) {
    console.error('/api/admin/contacts error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}