'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const AllInsurancePage = dynamic(
  () => import('@/pages/AllInsurancePage'),
  { ssr: false }
)

export default function AllInsuranceClient() {
  return (
    <>
      <NavBar />
      <AllInsurancePage />
      <BottomNav />
    </>
  )
}
