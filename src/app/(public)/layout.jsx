'use client'

import React from 'react'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import StickyCalculator from '@/components/StickyCalculator'

/**
 * Public Route Group Layout
 * Provides shared UI for all public routes: home, loans, insurance, etc.
 */
export default function PublicLayout({ children }) {
  return (
    <>
      <ScrollToTop />
      <div className="font-sans text-slate-800 antialiased pb-20 md:pb-0">
        <main>
          {children}
        </main>
      </div>
      <BottomNav />
      <StickyCalculator />
    </>
  )
}
