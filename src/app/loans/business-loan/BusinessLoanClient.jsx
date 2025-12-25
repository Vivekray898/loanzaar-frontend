'use client'

import dynamic from 'next/dynamic'
import BottomNav from '@/components/BottomNav'

const BusinessLoanFormPage = dynamic(
  () => import('@/pages/BusinessLoanFormPage'),
  { ssr: false }
)

export default function BusinessLoanClient() {
  return (
    <>
      <BusinessLoanFormPage />
      <BottomNav />
    </>
  )
}
