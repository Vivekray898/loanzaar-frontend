'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const LoanAgainstPropertyPage = dynamic(
  () => import('@/pages/LoanAgainstPropertyPage'),
  { ssr: false }
)

export default function LoanAgainstPropertyClient() {
  return (
    <>
      <LoanAgainstPropertyPage />
      <BottomNav />
    </>
  )
}
