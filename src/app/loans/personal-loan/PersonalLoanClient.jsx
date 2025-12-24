'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const PersonalLoanFormPage = dynamic(
  () => import('@/pages/PersonalLoanFormPage'),
  { ssr: false }
)

export default function PersonalLoanClient() {
  return (
    <>
      <NavBar />
      <PersonalLoanFormPage />
      <BottomNav />
    </>
  )
}
