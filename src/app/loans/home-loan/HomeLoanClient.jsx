'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const HomeLoanPage = dynamic(
  () => import('@/pages/HomeLoanPage'),
  { ssr: false }
)

export default function HomeLoanClient() {
  return (
    <>
      <HomeLoanPage />
      <BottomNav />
    </>
  )
}
