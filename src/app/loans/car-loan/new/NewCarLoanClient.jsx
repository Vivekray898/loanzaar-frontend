'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const NewCarLoanFormPage = dynamic(
  () => import('@/pages/NewCarLoanFormPage'),
  { ssr: false }
)

export default function NewCarLoanClient() {
  return (
    <>
      <NewCarLoanFormPage />
      <BottomNav />
    </>
  )
}
