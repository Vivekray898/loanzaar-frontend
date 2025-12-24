'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const NewCarLoanFormPage = dynamic(
  () => import('@/pages/NewCarLoanFormPage'),
  { ssr: false }
)

export default function NewCarLoanClient() {
  return (
    <>
      <NavBar />
      <NewCarLoanFormPage />
      <BottomNav />
    </>
  )
}
