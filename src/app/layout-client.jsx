'use client'

import React from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { UserAuthProvider } from '@/context/UserAuthContext'
import SessionManager from '@/components/SessionManager'
import { usePathname } from 'next/navigation'

export default function RootLayoutClient({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isUserRoute = pathname?.startsWith('/dashboard') ||
                      pathname?.startsWith('/user-dashboard') ||
                      pathname?.includes('/signin') ||
                      pathname?.includes('/signup') ||
                      pathname?.includes('/forgot-password')

  if (isAdminRoute) {
    return (
      <AdminAuthProvider>
        <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
          {children}
        </SessionManager>
      </AdminAuthProvider>
    )
  }

  if (isUserRoute) {
    return (
      <UserAuthProvider>
        <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
          {children}
        </SessionManager>
      </UserAuthProvider>
    )
  }

  return <>{children}</>
}
