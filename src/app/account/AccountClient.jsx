'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const AccountPage = dynamic(() => import('@/pages/_legacy/account'), { ssr: false })

export default function AccountClient() {
  return (
    <>
      <NavBar />
      <AccountPage />
      <BottomNav />
    </>
  )
}
