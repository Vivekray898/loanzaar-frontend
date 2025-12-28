'use client'

import React from 'react'
import { UserAuthProvider } from '@/context/UserAuthContext'
import SessionManager from '@/components/SessionManager'
import StructuredData from '@/components/StructuredData'
import { generateBaseSchemas } from '@/utils/schema'
import { usePathname } from 'next/navigation'
import NextNProgress from 'nextjs-progressbar'

export default function RootLayoutClient({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isUserRoute = pathname?.startsWith('/account') ||
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
        </SessionManager>
      </UserAuthProvider>
    )
  }

  return (
    <>
      <NextNProgress color="#0ea5e9" height={3} showOnShallow={true} />
      {shouldInjectSchema && <StructuredData schema={generateBaseSchemas()} />}
      {children}
    </>
  )
}
