import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAgent } from '@/lib/agentAuth'

export const runtime = 'nodejs'

/**
 * GET /api/agent/applications
 * Fetch applications assigned to the current agent (active assignments only).
 */
export async function GET(request: Request) {
  const check = await requireAgent(request)
  if (!check.ok) {
    return NextResponse.json({ success: false, error: check.message }, { status: check.status })
  }

  if (!check.user?.id) {
    return NextResponse.json({ success: false, error: 'Invalid user session' }, { status: 401 })
  }

  try {
    const agentUserId = check.user.id
    const { getAgentApplications } = await import('@/lib/queries/applications')
    const { data, total } = await getAgentApplications(agentUserId, { skip: 0, take: 100 })
    return NextResponse.json({ success: true, data, meta: { total } })
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    const errorName = error?.name || 'UnknownError';

    // Handle Prisma connection errors specifically
    if (
      errorName === 'PrismaClientInitializationError' ||
      errorMessage.includes('Can\'t reach database server') ||
      errorMessage.includes('connect ECONNREFUSED') ||
      errorMessage.includes('timeout')
    ) {
      console.error(`[DB Connection Error] ${errorName}: ${errorMessage}`, {
        timestamp: new Date().toISOString(),
        route: '/api/agent/applications',
        agentUserId: check.user.id
      });
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable. Please try again.' },
        { status: 503 }
      );
    }

    console.error(`[Agent Applications Error] ${errorName}: ${errorMessage}`, error);
    return NextResponse.json(
      { success: false, error: errorMessage || 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
