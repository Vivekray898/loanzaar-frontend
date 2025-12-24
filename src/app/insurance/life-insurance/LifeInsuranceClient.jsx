'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const LifeInsurancePage = dynamic(
  () => import('@/pages/LifeInsurancePage'),
  { ssr: false }
)

export default function LifeInsuranceClient() {
  return (
    <>
      <NavBar />
      <LifeInsurancePage />
      <BottomNav />
    </>
  )
}
