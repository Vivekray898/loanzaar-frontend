'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../context/AdminAuthContext';

function ProtectedAdminRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/admin/login');
    return null;
  }

  return children;
}

export default ProtectedAdminRoute;
