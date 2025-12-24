'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const MachineryLoanPage = dynamic(
  () => import('@/pages/MachineryLoanPage'),
  { ssr: false }
)

export default function MachineryLoanClient() {
  return (
    <>
      <NavBar />
      <MachineryLoanPage />
      <BottomNav />
    </>
  )
}
