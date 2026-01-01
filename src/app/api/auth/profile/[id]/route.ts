import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Profile fetch called but SUPABASE_SERVICE_ROLE_KEY or URL missing')
      return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })

    // Only return profile if phone_verified = true to avoid leaking unverified leads
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, phone_verified, role, photo_url')
      .eq('id', id)
      .eq('phone_verified', true)
      .limit(1)

    if (error) {
      console.error('Error fetching profile in server endpoint:', error)
      if (error.code === '42501') {
        return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 500 })
      }
      return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 })
    }

    const profile = (data && data.length) ? data[0] : null
    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found or not verified' }, { status: 404 })

    return NextResponse.json({ success: true, data: profile })
  } catch (err: any) {
    console.error('Unexpected error in profile GET', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}