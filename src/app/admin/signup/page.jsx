'use client'

import dynamic from 'next/dynamic'

const AdminSignupPage = dynamic(() => import('@/pages/AdminSignupPage'), { ssr: false })

export default function AdminSignup() {
  return <AdminSignupPage />
}
