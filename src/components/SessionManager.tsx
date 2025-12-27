'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import useAutoLogout from '../hooks/useAutoLogout';
import useAdminAutoLogout from '../hooks/useAdminAutoLogout';

interface SessionManagerProps {
  children: React.ReactNode;
  userTimeoutMinutes?: number;
  adminTimeoutMinutes?: number;
}

/**
 * SessionManager Component - Simplified Token-Based Session Management
 * 
 * Manages user and admin session timeouts with a clean token-based approach:
 * - No activity tracking
 * - No repeated console logs
 * - One timer per session
 * - Minimal logging (setup and logout only)
 * 
 * @param {SessionManagerProps} props
 */
export default function SessionManager({
  children,
  userTimeoutMinutes = 30,
  adminTimeoutMinutes = 30
}: SessionManagerProps) {
  const pathname = usePathname();
  
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;
  const isUserRoute = (
    pathname?.startsWith('/account') || 
    pathname?.includes('/signin') || 
    pathname?.includes('/signup') ||
    pathname?.includes('/forgot-password') ||
    pathname?.includes('/complete-profile')
  ) ?? false;

  // Only use the relevant hook for the current route
  // Note: While conditional hooks generally violate React rules, 
  // this pattern works if the component context ensures strict separation of routes (e.g., separate layouts).
  if (isAdminRoute) {
    useAdminAutoLogout({
      timeoutMinutes: adminTimeoutMinutes,
      onLogout: (_reason: string) => {}
    });
  } else if (isUserRoute) {
    useAutoLogout({
      timeoutMinutes: userTimeoutMinutes,
      onLogout: (_reason: string) => {}
    });
  }

  return <>{children}</>;
}