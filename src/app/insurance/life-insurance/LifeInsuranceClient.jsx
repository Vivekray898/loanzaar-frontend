'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const LifeInsurancePage = dynamic(
  () => import('@/pages/LifeInsurancePage'),
  { ssr: false }
)

export default function LifeInsuranceClient() {
  return (
    <>
      <LifeInsurancePage />
      <BottomNav />
    </>
  )
}
