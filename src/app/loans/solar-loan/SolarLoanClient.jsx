'use client'

import dynamic from 'next/dynamic'
import BottomNav from '@/components/BottomNav'

const SolarLoanPage = dynamic(
  () => import('@/pages/SolarLoanPage'),
  { ssr: false }
)

export default function SolarLoanClient() {
  return (
    <>
      
      <SolarLoanPage />
      <BottomNav />
    </>
  )
}
