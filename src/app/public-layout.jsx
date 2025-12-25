'use client'

import React from 'react'
import BottomNav from '@/components/BottomNav'
import ScrollToTop from '@/components/ScrollToTop'
import StickyCalculator from '@/components/StickyCalculator'
import SessionManager from '@/components/SessionManager'
import { usePathname } from 'next/navigation'

/**
 * Public Layout
 * Wraps public routes with NavBar, Footer, BottomNav, and SessionManager
 */
export default function PublicLayout({ children }) {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith('/signin') ||
                      pathname?.startsWith('/signup') ||
                      pathname?.startsWith('/forgot-password') ||
                      pathname?.startsWith('/finish-signup') ||
                      pathname?.startsWith('/complete-profile')

  return (
    <>
      <ScrollToTop />
      <div className="font-sans text-slate-800 antialiased pb-20 md:pb-0">
        <main>
          {isAuthRoute ? (
            <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
              {children}
            </SessionManager>
          ) : (
            children
          )}
        </main>
      </div>
      <BottomNav />
      <StickyCalculator />
    </>
  )
}
