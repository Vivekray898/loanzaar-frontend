import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * useAdminAutoLogout Hook - Session Management for all user types
 * 
 * Unified auto-logout system that:
 * 1. Triggers only once when a user logs in
 * 2. Uses auth_session cookie expiration time (7 days)
 * 3. Automatically logs out the user when session expires
 * 4. When no user is logged in, does nothing - no logs, no timers
 * 5. Minimal console logging (setup and logout only)
 * 6. Uses one setTimeout per session
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.timeoutMinutes - Logout timeout in minutes (default: 420 = 7 days)
 * @param {Function} options.onLogout - Callback on logout
 */
export default function useAdminAutoLogout(options = {}) {
  const {
    timeoutMinutes = 420, // 7 days default (matches 604800 seconds)
    onLogout = null
  } = options;

  const router = useRouter();
  const { user, logout: contextLogout } = useAuth();
  
  const logoutTimerRef = useRef(null);
  const isLoggingOutRef = useRef(false);
  const currentUserRef = useRef(null);

  useEffect(() => {
    // Only act for logged-in users
    if (!user) {
      currentUserRef.current = null;
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      return;
    }

    const userId = user.id;
    if (!currentUserRef.current || currentUserRef.current !== userId) {
      currentUserRef.current = userId;
      
      // Clear old timer if exists
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      // Schedule logout based on configured timeout
      const timeoutMs = timeoutMinutes * 60 * 1000;
      
      console.log(`✅ Session started for user ${user.id} (role: ${user.role})`);
      console.log(`⏱️ Auto-logout scheduled in ${(timeoutMs / 60000).toFixed(2)} min`);
      
      logoutTimerRef.current = setTimeout(async () => {
        if (isLoggingOutRef.current) return;
        isLoggingOutRef.current = true;

        try {
          console.log('🧹 Session expired — logging out');
          await contextLogout();
          if (onLogout) onLogout('session-timeout');
          router.push('/');
        } catch (error) {
          console.error('❌ Logout error:', error);
          await contextLogout();
          router.push('/');
        } finally {
          isLoggingOutRef.current = false;
          currentUserRef.current = null;
        }
      }, timeoutMs);
    }

    // Cleanup on unmount or user change
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [user, router, contextLogout, onLogout, timeoutMinutes]);

  return null;
}
