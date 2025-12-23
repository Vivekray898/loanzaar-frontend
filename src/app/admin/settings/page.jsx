'use client'

import dynamic from 'next/dynamic'

const AdminSettingsPage = dynamic(() => import('@/pages/AdminSettingsPage'), { ssr: false })

export default function AdminSettings() {
  return <AdminSettingsPage />
}
