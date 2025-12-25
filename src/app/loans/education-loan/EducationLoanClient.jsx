'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const EducationLoanPage = dynamic(
  () => import('@/pages/EducationLoanPage'),
  { ssr: false }
)

export default function EducationLoanClient() {
  return (
    <>
      <EducationLoanPage />
      <BottomNav />
    </>
  )
}
