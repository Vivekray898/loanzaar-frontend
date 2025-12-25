'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const CarLoanFormPage = dynamic(
  () => import('@/pages/CarLoanFormPage'),
  { ssr: false }
)

export default function CarLoanClient() {
  return (
    <>
      <CarLoanFormPage />
      <BottomNav />
    </>
  )
}
