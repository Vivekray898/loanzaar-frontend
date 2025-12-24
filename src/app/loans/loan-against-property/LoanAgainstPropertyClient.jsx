'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const LoanAgainstPropertyPage = dynamic(
  () => import('@/pages/LoanAgainstPropertyPage'),
  { ssr: false }
)

export default function LoanAgainstPropertyClient() {
  return (
    <>
      <NavBar />
      <LoanAgainstPropertyPage />
      <BottomNav />
    </>
  )
}
