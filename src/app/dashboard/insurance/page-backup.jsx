'use client'

import dynamic from 'next/dynamic'

const UserInsuranceFormPage = dynamic(() => import('@/pages/UserInsuranceFormPage'), { ssr: false })

export default function InsurancePage() {
  return <UserInsuranceFormPage />
}
