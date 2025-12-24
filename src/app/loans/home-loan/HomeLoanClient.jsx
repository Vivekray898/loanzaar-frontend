'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const HomeLoanPage = dynamic(
  () => import('@/pages/HomeLoanPage'),
  { ssr: false }
)

export default function HomeLoanClient() {
  return (
    <>
      <NavBar />
      <HomeLoanPage />
      <BottomNav />
    </>
  )
}
