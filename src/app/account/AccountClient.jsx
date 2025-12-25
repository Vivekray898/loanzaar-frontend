'use client'

import dynamic from 'next/dynamic'
import BottomNav from '@/components/BottomNav'

const AccountPage = dynamic(() => import('@/pages/_legacy/account'), { ssr: false })

export default function AccountClient() {
  return (
    <>
      <AccountPage />
      <BottomNav />
    </>
  )
}
