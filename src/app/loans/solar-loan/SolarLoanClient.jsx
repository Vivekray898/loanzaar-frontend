'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const SolarLoanPage = dynamic(
  () => import('@/pages/SolarLoanPage'),
  { ssr: false }
)

export default function SolarLoanClient() {
  return (
    <>
      <NavBar />
      <SolarLoanPage />
      <BottomNav />
    </>
  )
}
