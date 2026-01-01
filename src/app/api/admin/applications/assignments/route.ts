import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/adminAuth'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // Validate admin role
    const check = await requireAdmin(request)
    if (!check.ok) {
      return NextResponse.json({ success: false, error: check.message }, { status: check.status })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: assignments, error } = await supabaseAdmin
      .from('application_assignments')
      .select('id, application_id, agent_user_id')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching active assignments:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: assignments || [] })
  } catch (error: any) {
    console.error('Assignments GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
