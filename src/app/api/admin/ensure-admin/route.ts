import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const POST = async (request: Request) => {
  try {
    const internalSecret = request.headers.get('x-internal-secret')
    if (internalSecret !== process.env.INTERNAL_ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { user_id, full_name, email, phone } = body
    if (!user_id || !email) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) return NextResponse.json({ success: false, error: 'Server config' }, { status: 500 })

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const payload = {
      user_id,
      full_name: full_name || null,
      email,
      phone: phone || null,
      role: 'admin',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('ensure-admin upsert error', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error('ensure-admin exception', e)
    return NextResponse.json({ success: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}