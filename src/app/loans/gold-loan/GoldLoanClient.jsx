'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const GoldLoanFormPage = dynamic(
  () => import('@/pages/GoldLoanFormPage'),
  { ssr: false }
)

export default function GoldLoanClient() {
  return (
    <>
      <NavBar />
      <GoldLoanFormPage />
      <BottomNav />
    </>
  )
}
