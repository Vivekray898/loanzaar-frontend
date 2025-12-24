'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const CarLoanFormPage = dynamic(
  () => import('@/pages/CarLoanFormPage'),
  { ssr: false }
)

export default function CarLoanClient() {
  return (
    <>
      <NavBar />
      <CarLoanFormPage />
      <BottomNav />
    </>
  )
}
