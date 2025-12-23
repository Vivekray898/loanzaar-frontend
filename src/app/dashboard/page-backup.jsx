'use client'

import dynamic from 'next/dynamic'

const UserDashboardPage = dynamic(() => import('@/pages/UserDashboardPage'), { ssr: false })

export default function DashboardPage() {
  return <UserDashboardPage />
}
