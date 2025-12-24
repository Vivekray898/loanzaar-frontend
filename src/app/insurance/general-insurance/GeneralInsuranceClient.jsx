'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const GeneralInsurancePage = dynamic(
  () => import('@/pages/GeneralInsurancePage'),
  { ssr: false }
)

export default function GeneralInsuranceClient() {
  return (
    <>
      <NavBar />
      <GeneralInsurancePage />
      <BottomNav />
    </>
  )
}
