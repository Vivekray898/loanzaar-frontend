'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const UsedCarLoanFormPage = dynamic(
  () => import('@/pages/UsedCarLoanFormPage'),
  { ssr: false }
)

export default function UsedCarLoanClient() {
  return (
    <>
      <NavBar />
      <UsedCarLoanFormPage />
      <BottomNav />
    </>
  )
}
