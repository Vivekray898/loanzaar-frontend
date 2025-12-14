'use client'

import React from 'react'
import '../index.css'
import '../App.css'

// Initialize Supabase on app load
import '../config/supabase'

import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import SessionManager from '@/components/SessionManager'
import StickyCalculator from '@/components/StickyCalculator'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { UserAuthProvider } from '@/context/UserAuthContext'
import { usePathname } from 'next/navigation'

export default function Providers({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isUserRoute = pathname?.startsWith('/dashboard') ||
                      pathname === '/signin' ||
                      pathname === '/signup' ||
                      pathname === '/forgot-password' ||
                      pathname === '/finish-signup'

  let content = (
    <>
      <ScrollToTop />
      <NavBar />
      <div className="font-sans text-slate-800 antialiased">
        <main>
          {children}
        </main>
        <Footer />
      </div>
      <StickyCalculator />
    </>
  )

  if (isAdminRoute) {
    content = (
      <UserAuthProvider>
        <AdminAuthProvider>
          <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
            {content}
          </SessionManager>
        </AdminAuthProvider>
      </UserAuthProvider>
    )
  } else if (isUserRoute) {
    content = (
      <UserAuthProvider>
        <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
          {content}
        </SessionManager>
      </UserAuthProvider>
    )
  } else {
    content = (
      <UserAuthProvider>
        {content}
      </UserAuthProvider>
    )
  }

  return content
}
