import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const internalSecretHeader = req.headers.get('x-internal-secret') || ''
    const internalSecret = process.env.INTERNAL_ADMIN_SECRET || ''
    if (!internalSecret || internalSecretHeader !== internalSecret) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Debug OTP called but SUPABASE_SERVICE_ROLE_KEY or URL is missing')
      return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })

    const { data, error } = await supabaseAdmin
      .from('otp_challenges')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Failed to fetch otp_challenges in debug endpoint:', error)
      if (error.code === '42501') {
        return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 500 })
      }
      return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Unexpected error in debug otp_challenges endpoint:', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}