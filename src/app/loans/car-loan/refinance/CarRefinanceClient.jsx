'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const CarRefinanceFormPage = dynamic(
  () => import('@/pages/CarRefinanceFormPage'),
  { ssr: false }
)

export default function CarRefinanceClient() {
  return (
    <>
      <NavBar />
      <CarRefinanceFormPage />
      <BottomNav />
    </>
  )
}
