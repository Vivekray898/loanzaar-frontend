'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const HealthInsurancePage = dynamic(
  () => import('@/pages/HealthInsurancePage'),
  { ssr: false }
)

export default function HealthInsuranceClient() {
  return (
    <>
      <NavBar />
      <HealthInsurancePage />
      <BottomNav />
    </>
  )
}
