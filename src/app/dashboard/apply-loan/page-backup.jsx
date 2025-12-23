'use client'

import dynamic from 'next/dynamic'

const UserLoanFormPage = dynamic(() => import('@/pages/UserLoanFormPage'), { ssr: false })

export default function ApplyLoanPage() {
  return <UserLoanFormPage />
}
