'use client'

import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

/**
 * AdminAuthGuard - Prevents rendering protected admin content until Firebase auth finishes initializing
 * 
 * This ensures:
 * 1. No API calls fire before Firebase user session is restored
 * 2. No "unauthorized" errors during page refresh
 * 3. Clean loading UI instead of error flashes
 * 
 * Usage:
 * <AdminAuthGuard>
 *   <AdminDashboard />
 * </AdminAuthGuard>
 */
function AdminAuthGuard({ children, fallback = null }) {
  const { loading, isAuthenticated } = useAdminAuth();

  // ✅ Still initializing Firebase auth
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Initializing authentication...</p>
          <p className="text-sm text-slate-500 mt-2">Restoring your session...</p>
        </div>
      </div>
    );
  }

  // ✅ Firebase initialization complete, check if authenticated
  if (!isAuthenticated()) {
    return fallback || (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <p className="text-slate-800 font-semibold text-lg">Authentication Required</p>
          <p className="text-slate-600 text-sm mt-2">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  // ✅ Firebase ready and user authenticated - render children
  return children;
}

export default AdminAuthGuard;
