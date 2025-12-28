import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect the /admin routes - only allow users with profiles.role === 'admin'
export async function middleware(req: NextRequest) {
  const { cookies } = req
  const token = cookies.get('userToken')?.value
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // If no token -> redirect to sign in
  if (!token) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  try {
    // Validate token and get user info
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey || ''
      }
    })

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/signin', req.url))
    }

    const user = await userRes.json()
    const userId = user?.id
    if (!userId) return NextResponse.redirect(new URL('/signin', req.url))

    // Query the profile to check role (using anon key)
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}&select=role`, {
      headers: {
        apikey: anonKey || '',
        Authorization: `Bearer ${anonKey || ''}`
      }
    })

    if (!profileRes.ok) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    const profiles = await profileRes.json()
    const role = profiles?.[0]?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Authorized
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware admin auth error:', error)
    return NextResponse.redirect(new URL('/signin', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*']
}
