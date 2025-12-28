'use client'

import React from 'react'

// Unified Auth provider
import { UserAuthProvider } from '@/context/UserAuthContext'

export default function Providers({ children }) {
  return (
    <UserAuthProvider>
      {children}
    </UserAuthProvider>
  )
}
