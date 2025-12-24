'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const EducationLoanPage = dynamic(
  () => import('@/pages/EducationLoanPage'),
  { ssr: false }
)

export default function EducationLoanClient() {
  return (
    <>
      <NavBar />
      <EducationLoanPage />
      <BottomNav />
    </>
  )
}
