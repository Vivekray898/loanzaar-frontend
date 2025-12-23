'use client'

import dynamic from 'next/dynamic'

const EducationLoanPage = dynamic(() => import('@/pages/EducationLoanPage'), { ssr: false })

export default function EducationLoan() {
  return <EducationLoanPage />
}
