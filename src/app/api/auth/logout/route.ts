/**
 * Logout endpoint
 * Clears auth_session cookie and logs user out
 */

export const runtime = 'nodejs';

import { NextResponse, NextRequest } from 'next/server';
import { generateLogoutCookie } from '@/lib/auth/cookies';

export async function POST(req: NextRequest) {
  try {
    const logoutCookie = generateLogoutCookie();
    
    const res = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
    
    res.headers.append('Set-Cookie', logoutCookie);
    
    return res;
  } catch (err: any) {
    console.error('[Auth][logout] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
