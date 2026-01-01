import { NextResponse } from 'next/server'
import { requireAgent } from '@/lib/agentAuth'

export async function GET(request: Request, context: { params: any }) {
  const { params } = context
  const { id: applicationId } = (await params) || {}

  if (!applicationId) {
    return NextResponse.json({ success: false, error: 'Missing application ID' }, { status: 400 })
  }

  const check = await requireAgent(request)
  if (!check.ok) return NextResponse.json({ success: false, error: check.message }, { status: check.status })

  const agentUserId = check.user?.id
  if (!agentUserId) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 })

  try {
    const { getAgentApplicationById } = await import('@/lib/queries/applications')
    const result = await getAgentApplicationById(agentUserId, applicationId)
    if (!result) return NextResponse.json({ success: false, error: 'Not found or not authorized' }, { status: 404 })
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('GET /api/agent/applications/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Unknown error' }, { status: 500 })
  }
}
