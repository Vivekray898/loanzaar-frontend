'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import useAutoLogout from '../hooks/useAutoLogout';
import useAdminAutoLogout from '../hooks/useAdminAutoLogout';

/**
 * SessionManager Component - Simplified Token-Based Session Management
 * 
 * Manages user and admin session timeouts with a clean token-based approach:
 * - No activity tracking
 * - No repeated console logs
 * - One timer per session
 * - Minimal logging (setup and logout only)
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {number} props.userTimeoutMinutes - User session timeout (default: 30)
 * @param {number} props.adminTimeoutMinutes - Admin session timeout (default: 30)
 */
export default function SessionManager({
  children,
  userTimeoutMinutes = 30,
  adminTimeoutMinutes = 30
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isUserRoute = pathname?.startsWith('/dashboard') || 
                      pathname?.includes('/signin') || 
                      pathname?.includes('/signup') ||
                      pathname?.includes('/forgot-password') ||
                      pathname?.includes('/complete-profile');

  // Only use the relevant hook for the current route
  if (isAdminRoute) {
    useAdminAutoLogout({
      timeoutMinutes: adminTimeoutMinutes,
      onLogout: (reason) => {}
    });
  } else if (isUserRoute) {
    useAutoLogout({
      timeoutMinutes: userTimeoutMinutes,
      onLogout: (reason) => {}
    });
  }

  return <>{children}</>;
}
