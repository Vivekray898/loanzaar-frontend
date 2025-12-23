'use client'

import dynamic from 'next/dynamic'

const UserSupportPage = dynamic(() => import('@/pages/UserSupportPage'), { ssr: false })

export default function SupportPage() {
  return <UserSupportPage />
}
