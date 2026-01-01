import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/adminAuth'

// Lightweight in-memory rate limiter (per actor id) — simple protection
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT = 20; // 20 ops per minute per admin
const rateMap = new Map<string, { count: number; windowStart: number }>();

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // Validate admin role
    const check = await requireAdmin(request)
    if (!check.ok) {
      return NextResponse.json({ success: false, error: check.message }, { status: check.status })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Service Role Key for Admin API');
        return NextResponse.json({ success: false, error: 'Server Config Error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const role = searchParams.get('role'); // Optional role filter

    let query = supabaseAdmin
      .from('profiles')
      .select('id,full_name,email,phone,role,created_at,updated_at,phone_verified', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply role filter if provided
    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data: users, 
      meta: { total: count } 
    });

  } catch (error: any) {
    console.error('/api/admin/users error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Update a user's role
export async function PUT(request: Request) {
  try {
    // Validate admin role
    const check = await requireAdmin(request)
    if (!check.ok) {
      return NextResponse.json({ success: false, error: check.message }, { status: check.status })
    }

    const actorId = check.user?.id

    const body = await request.json()
    const { user_id, role } = body

    if (!user_id || !role || !['user','agent','admin'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }

    // Rate limit per admin actor
    if (actorId) {
      const now = Date.now();
      const entry = rateMap.get(actorId) || { count: 0, windowStart: now };
      if (now - entry.windowStart > RATE_WINDOW_MS) {
        entry.count = 0;
        entry.windowStart = now;
      }
      entry.count += 1;
      rateMap.set(actorId, entry);
      if (entry.count > RATE_LIMIT) {
        return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 })
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Service Role Key for Admin API');
      return NextResponse.json({ success: false, error: 'Server Config Error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing role first
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user_id)
      .single()

    if (fetchErr) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 })
    }

    const oldRole = existing?.role || 'user'

    // Prevent self-demotion server-side
    if (actorId && actorId === user_id && role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admins cannot demote themselves' }, { status: 400 })
    }

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', user_id)
      .select()
      .single()

    if (error) throw error

    // Insert audit record
    try {
      await supabaseAdmin.from('role_change_audit').insert([{
        actor_user_id: actorId || 'system',
        target_user_id: user_id,
        old_role: oldRole,
        new_role: role
      }])
    } catch (auditErr) {
      console.error('Failed to insert role_change_audit:', auditErr)
      // don't block the main flow
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error('/api/admin/users PUT error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}