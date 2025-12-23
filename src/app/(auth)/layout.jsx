'use client'

import React from 'react'
import NavBar from '@/components/NavBar'
import ScrollToTop from '@/components/ScrollToTop'
import SessionManager from '@/components/SessionManager'

/**
 * Auth Route Group Layout
 * Provides shared UI for all auth routes: signin, signup, forgot-password, etc.
 */
export default function AuthLayout({ children }) {
  return (
    <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
      <ScrollToTop />
      <NavBar />
      <div className="font-sans text-slate-800 antialiased pb-20 md:pb-0">
        <main>
          {children}
        </main>
      </div>
    </SessionManager>
  )
}
