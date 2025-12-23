'use client'

import dynamic from 'next/dynamic'

const AdminForgotPasswordPage = dynamic(() => import('@/pages/AdminForgotPasswordPage'), { ssr: false })

export default function AdminForgotPassword() {
  return <AdminForgotPasswordPage />
}
