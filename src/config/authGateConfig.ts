export type AuthGateConfig = {
  label: string
  intent: string
  protectedPages: string[]
  nextRoute?: string
}

export const AUTH_GATED_CTAS: AuthGateConfig[] = [
  {
    label: 'Apply Now',
    intent: 'apply_now',
    protectedPages: ['/loans', '/credit-card', '/personal-loan'],
    nextRoute: 'sdk'
  },
  {
    label: 'Get Consultation',
    intent: 'consultation',
    protectedPages: ['/insurance', '/loans']
  },
  {
    label: 'Get Quote',
    intent: 'quote',
    protectedPages: ['/insurance']
  },
  {
    label: 'Check Score Now',
    intent: 'credit_score',
    protectedPages: ['/credit-score']
  },
  {
    label: 'Find My Card',
    intent: 'find_card',
    protectedPages: ['/credit-card']
  }
]
