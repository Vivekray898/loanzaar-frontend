'use client'

import dynamic from 'next/dynamic'

const UserProfilePage = dynamic(() => import('@/pages/UserProfilePage'), { ssr: false })

export default function ProfilePage() {
  return <UserProfilePage />
}
