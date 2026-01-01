'use client'

import React from 'react'
import { UserAuthProvider } from '@/context/UserAuthContext'
import SessionManager from '@/components/SessionManager'
import StructuredData from '@/components/StructuredData'
import { generateBaseSchemas } from '@/utils/schema'
import { usePathname } from 'next/navigation'
import NextNProgress from 'nextjs-progressbar'
import GlobalModalController from '@/components/GlobalModalController'

export default function RootLayoutClient({ children }) {
  const pathname = usePathname()
  const isModalLogin = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('modal') === 'login';
  const isAdminRoute = pathname?.startsWith('/admin')
  const isUserRoute = isModalLogin || pathname?.startsWith('/account') ||
                      pathname?.includes('/signin') ||
                      pathname?.includes('/signup') ||
                      pathname?.includes('/forgot-password')

  // Inject global schema for non-admin routes
  const shouldInjectSchema = !isAdminRoute

  if (isAdminRoute) {
    return (
      <UserAuthProvider>
        <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
          {children}
          <GlobalModalController />
        </SessionManager>
      </UserAuthProvider>
    )
  }

  if (isUserRoute) {
    return (
      <UserAuthProvider>
        <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
          {shouldInjectSchema && <StructuredData schema={generateBaseSchemas()} />}
          {children}
          <GlobalModalController />
        </SessionManager>
      </UserAuthProvider>
    )
  }

  return (
    <>
      <NextNProgress color="#0ea5e9" height={3} showOnShallow={true} />
      {shouldInjectSchema && <StructuredData schema={generateBaseSchemas()} />}
      {children}
      <GlobalModalController />
    </>
  )
}
