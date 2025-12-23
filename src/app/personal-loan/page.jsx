'use client'

import dynamic from 'next/dynamic'

const PersonalLoanFormPage = dynamic(() => import('@/pages/PersonalLoanFormPage'), { ssr: false })

export default function PersonalLoanPage() {
  return <PersonalLoanFormPage />
}
