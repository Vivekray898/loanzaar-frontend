'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface AuthUser {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string;
  role: 'user' | 'agent' | 'admin';
  photoUrl: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  role: 'guest' | 'user' | 'agent' | 'admin';
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<'guest' | 'user' | 'agent' | 'admin'>('guest');
  const [loading, setLoading] = useState(true);

  /**
   * Check and restore session from auth_session cookie
   * Called on app load and after OTP verification
   */
  const checkSession = useCallback(async (opts?: { skipRedirect?: boolean }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        setUser(null);
        setRole('guest');
        return false;
      }

      const json = await res.json();
      if (!json.success || !json.profile) {
        setUser(null);
        setRole('guest');
        return false;
      }

      const profile = json.profile;
      const userRole = (profile.role || 'user') as 'user' | 'agent' | 'admin';

      setUser({
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        role: userRole,
        photoUrl: profile.photoUrl,
      });

      setRole(userRole);

      // If not explicitly skipped, perform role-based redirect to dashboard
      if (!opts?.skipRedirect && (userRole === 'admin' || userRole === 'agent')) {
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
        if (!pathname.startsWith(`/${userRole}`)) {
          const dashboard = userRole === 'admin' ? '/admin' : '/agent';
          try { setTimeout(() => router.push(dashboard), 100); } catch (e) {}
        }
      }

      return true;
    } catch (err) {
      console.error('[Auth] Session check failed:', err);
      setUser(null);
      setRole('guest');
      return false;
    }
  }, [router]);

  /**
   * Restore session on app load
   */
  useEffect(() => {
    const restoreSession = async () => {
      setLoading(true);
      await checkSession({ skipRedirect: false });
      setLoading(false);
    };

    restoreSession();
  }, [checkSession]);

  // Listen for OTP verified events (cross-tab or in-page) and restore session
  useEffect(() => {
    const onOtpVerified = () => {
      try { checkSession(); } catch (e) {}
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('otp-verified', onOtpVerified);
    }

    return () => {
      try { if (typeof window !== 'undefined') window.removeEventListener('otp-verified', onOtpVerified); } catch (e) {}
    };
  }, [checkSession]);

  /**
   * Handle post-login redirect
   * Called after OTP verification when SignInModal closes
   */
  useEffect(() => {
    if (!loading && user) {
      // Check for next_route in query params (set by middleware on redirect)
      const nextRoute = searchParams?.get('next_route');
      if (nextRoute) {
        try {
          const decoded = decodeURIComponent(nextRoute);
          // Validate route starts with /
          if (decoded.startsWith('/')) {
            router.push(decoded);
          }
        } catch (e) {
          console.warn('Invalid next_route:', e);
        }
      }
    }
  }, [user, loading, searchParams, router]);

  /**
   * Logout: clear session and redirect to home
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('[Auth] Logout failed:', err);
    } finally {
      setUser(null);
      setRole('guest');
      router.push('/');
    }
  }, [router]);

  const value: AuthContextType = {
    user,
    role,
    isAuthenticated: !!user,
    loading,
    isLoading: loading, // Alias for loading
    logout,
    checkSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
