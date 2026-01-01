import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hasAuthCookie, getCookieName } from '@/lib/auth/edgeSession'

/**
 * LIGHTWEIGHT Edge Runtime Authentication Middleware
 * 
 * This middleware runs at the Edge and ONLY:
 * 1. Checks if auth_session cookie EXISTS
 * 2. Redirects if missing on protected routes
 * 
 * ACTUAL session validation (signature verification, JWT decode, etc.)
 * happens in /api/auth/session endpoint (Node.js runtime)
 * 
 * Why? Edge Runtime doesn't support Node.js crypto functions.
 * The browser will make a request to /api/auth/session to validate.
 */

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname || '/'

  // List of public routes that don't require authentication
  const publicRoutes = [
    '/signin',
    '/auth/send-otp',
    '/auth/verify-otp',
    '/auth/request-otp',
    '/privacy',
    '/terms',
    '/about',
    '/',
  ]

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(route)
  )
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get auth_session cookie (no decoding, just check existence)
  const cookieName = getCookieName()
  const authCookie = req.cookies.get(cookieName)?.value
  const hasSession = hasAuthCookie(authCookie)

  if (!hasSession) {
    // No session cookie - redirect to signin with deep link
    const nextRoute = encodeURIComponent(pathname)
    return NextResponse.redirect(
      new URL(`/?modal=login&next_route=${nextRoute}`, req.url)
    )
  }

  // Cookie exists - allow request to proceed
  // Client-side AuthContext will validate when it mounts
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/agent/:path*',
    '/account/:path*',
    '/apply/:path*',
    '/dashboard/:path*',
  ],
}
