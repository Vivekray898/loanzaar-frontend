'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const GeneralInsurancePage = dynamic(
  () => import('@/pages/GeneralInsurancePage'),
  { ssr: false }
)

export default function GeneralInsuranceClient() {
  return (
    <>
      <GeneralInsurancePage />
      <BottomNav />
    </>
  )
}
