import { openSignInModal } from '@/lib/openSignInModal'

export function openProtectedFlow(intent: { action: string; nextRoute?: string }) {
  try {
    sessionStorage.setItem('auth_intent', JSON.stringify(intent))
  } catch (e) {
    // ignore sessionStorage failures in very restricted environments
  }

  const qp = new URLSearchParams({ modal: 'login', intent: intent.action })
  if (intent.nextRoute) qp.set('next_route', intent.nextRoute)
  openSignInModal({ query: `?${qp.toString()}` })
}
