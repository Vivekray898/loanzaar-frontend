'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to the top of the page whenever the route changes.
 * This component uses the `usePathname` hook from Next.js to detect
 * route changes and trigger a scroll to the top behavior.
 * 
 * Usage:
 * Place this component at the top level of your app layout
 * 
 * @returns {null} This component doesn't render anything, it only handles side effects
 */
function ScrollToTop(): null {
  const pathname = usePathname()

  useEffect(() => {
    /**
     * Scroll to top of window
     * Using window.scrollTo with smooth behavior for better UX
     */
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Use 'auto' for instant scroll if preferred
    })
  }, [pathname]) // Dependency on pathname ensures this runs whenever route changes

  // This component doesn't render anything
  return null
}

export default ScrollToTop