'use client'

import React from 'react'

// Unified Auth provider - MUST BE OUTERMOST for SignInModal to work
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { SignInModalProvider } from '@/context/SignInModalContext'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <SignInModalProvider>
          {children}
        </SignInModalProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
