'use client'

import React from 'react'

// Auth providers
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { UserAuthProvider } from '@/context/UserAuthContext'

/**
 * Providers wrapper
 * This component wraps all auth contexts and should be used at the root level.
 * 
 * Route-specific UI (NavBar, Footer, etc.) are handled by individual layout.jsx files
 * to avoid manual routing logic.
 */
export default function Providers({ children }) {
  return (
    <UserAuthProvider>
      <AdminAuthProvider>
        {children}
      </AdminAuthProvider>
    </UserAuthProvider>
  )
}
