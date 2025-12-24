'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const BusinessLoanFormPage = dynamic(
  () => import('@/pages/BusinessLoanFormPage'),
  { ssr: false }
)

export default function BusinessLoanClient() {
  return (
    <>
      <NavBar />
      <BusinessLoanFormPage />
      <BottomNav />
    </>
  )
}
