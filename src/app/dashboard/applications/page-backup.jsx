'use client'

import dynamic from 'next/dynamic'

const UserApplicationsPage = dynamic(() => import('@/pages/UserApplicationsPage'), { ssr: false })

export default function ApplicationsPage() {
  return <UserApplicationsPage />
}
