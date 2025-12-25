'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const UsedCarLoanFormPage = dynamic(
  () => import('@/pages/UsedCarLoanFormPage'),
  { ssr: false }
)

export default function UsedCarLoanClient() {
  return (
    <>
      <UsedCarLoanFormPage />
      <BottomNav />
    </>
  )
}
