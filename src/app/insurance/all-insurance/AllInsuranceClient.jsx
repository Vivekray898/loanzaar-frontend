'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const AllInsurancePage = dynamic(
  () => import('@/pages/AllInsurancePage'),
  { ssr: false }
)

export default function AllInsuranceClient() {
  return (
    <>
      <AllInsurancePage />
      <BottomNav />
    </>
  )
}
