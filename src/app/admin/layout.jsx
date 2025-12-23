'use client'

import SessionManager from '@/components/SessionManager'

/**
 * Admin Layout
 * Wraps all admin routes with admin-specific styling, SessionManager, and no public UI components
 */
export default function AdminLayout({ children }) {
  return (
    <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </SessionManager>
  )
}
