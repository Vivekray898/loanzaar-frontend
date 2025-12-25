'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const MachineryLoanPage = dynamic(
  () => import('@/pages/MachineryLoanPage'),
  { ssr: false }
)

export default function MachineryLoanClient() {
  return (
    <>
      <MachineryLoanPage />
      <BottomNav />
    </>
  )
}
