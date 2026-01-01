import { AUTH_GATED_CTAS } from '@/config/authGateConfig'

export function getAuthGateForCTA(label: string, pathname: string) {
  return AUTH_GATED_CTAS.find(cta =>
    cta.label === label &&
    cta.protectedPages.some(p => pathname.startsWith(p))
  )
}
