import { useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { useRouter } from 'next/navigation';
import { useUserAuth } from '../context/UserAuthContext';

/**
 * useAdminAutoLogout Hook - Token-Based Session Management for Admins with Supabase
 * 
 * Simplified admin auto-logout system that:
 * 1. Triggers only once when an admin logs in
 * 2. Uses Supabase session expiration time
 * 3. Automatically logs out the admin when session expires
 * 4. When no admin is logged in, does nothing - no logs, no timers
 * 5. Minimal console logging (setup and logout only)
 * 6. Uses one setTimeout per admin session
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.timeoutMinutes - Logout timeout in minutes (default: 30)
 * @param {Function} options.onLogout - Callback on logout
 */
export default function useAdminAutoLogout(options = {}) {
  const {
    timeoutMinutes = 30,
    onLogout = null
  } = options;

  const router = useRouter();
  const { user, role, logout: contextLogout } = useUserAuth();
  
  const logoutTimerRef = useRef(null);
  const isLoggingOutRef = useRef(false);
  const currentAdminRef = useRef(null);

  // We'll schedule based on token expiration

  useEffect(() => {
      // Only act for logged-in admins
    if (!user || role !== 'admin') {
      currentAdminRef.current = null;
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      return;
    }

    const adminId = user.uid || user.email;
    if (!currentAdminRef.current || currentAdminRef.current !== adminId) {
      currentAdminRef.current = adminId;
      
      // Clear old timer if exists
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      // Schedule logout at Supabase session expiration time
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return;
        
        const expMs = new Date(session.expires_at * 1000).getTime();
        const now = Date.now();
        const msUntilExp = expMs - now;
        const scheduleMs = msUntilExp > 0 ? msUntilExp : 0;
        
        console.log(`✅ Admin session started for ${user.email} (Supabase)`);
        console.log(`⏱️ Auto-logout scheduled in ${(scheduleMs / 60000).toFixed(2)} min (token expiration)`);
        
        logoutTimerRef.current = setTimeout(async () => {
          if (isLoggingOutRef.current) return;
          isLoggingOutRef.current = true;

          try {
            console.log('🧹 Admin session expired — logging out (Supabase)');
            await supabase.auth.signOut();
            await contextLogout('session-timeout');
            if (onLogout) onLogout('session-timeout');
            router.push('/admin/login');
          } catch (error) {
            console.error('❌ Admin logout error (Supabase):', error);
            await contextLogout('session-timeout');
            router.push('/admin/login');
            } finally {
              isLoggingOutRef.current = false;
              currentAdminRef.current = null;
            }
          }, scheduleMs);
        })
        .catch(err => {
          console.error('Failed to get token expiration, falling back to fixed timeout:', err);
          // Fallback to fixed timeout
          const fallbackMs = timeoutMinutes * 60 * 1000;
          console.log(`⏱️ Auto-logout scheduled in ${timeoutMinutes} min (fallback)`);
          logoutTimerRef.current = setTimeout(() => contextLogout('session-timeout'), fallbackMs);
        });
    }

    // Cleanup on unmount or admin change
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [admin, router, contextLogout, onLogout, timeoutMinutes]);

  return null;
}
