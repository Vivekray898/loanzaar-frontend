import { useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

/**
 * useAutoLogout Hook - Token-Based Session Management
 * 
 * Simplified auto-logout system that:
 * 1. Triggers only once when a user logs in
 * 2. Creates a 30-minute Firebase token session (no activity tracking)
 * 3. After 30 minutes, automatically logs out the user
 * 4. On guest visits (no user), does nothing - no logs, no timers
 * 5. Minimal console logging (setup and logout only)
 * 6. Uses one setTimeout per user session
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.timeoutMinutes - Logout timeout in minutes (default: 30)
 * @param {Function} options.onLogout - Callback when user is logged out
 */
export default function useAutoLogout(options = {}) {
  const {
    timeoutMinutes = 30,
    onLogout = null
  } = options;

  const auth = getAuth();
  const router = useRouter();
  const logoutTimerRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const isLoggingOutRef = useRef(false);
  const currentUserRef = useRef(null);

  const TIMEOUT_MS = timeoutMinutes * 60 * 1000;

  useEffect(() => {
    // Clear any existing timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    // Set up auth state listener (runs once)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Guest user - do nothing
      if (!user) {
        currentUserRef.current = null;
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
          logoutTimerRef.current = null;
        }
        return;
      }

      // User just logged in
      if (!currentUserRef.current || currentUserRef.current.uid !== user.uid) {
        currentUserRef.current = user;
        
        // Clear old timer if exists
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
        }

        // Start new 30-minute session
        console.log(`✅ Session started for ${user.email}`);
        console.log(`⏱️ Auto logout scheduled in ${timeoutMinutes} min`);

        logoutTimerRef.current = setTimeout(async () => {
          if (isLoggingOutRef.current) return;
          
          isLoggingOutRef.current = true;

          try {
            console.log('🧹 Session expired — user logged out');

            // Clear auth data
            const keysToRemove = ['userToken', 'userData', 'lastLogin', 'sessionId'];
            keysToRemove.forEach(key => {
              localStorage.removeItem(key);
              sessionStorage.removeItem(key);
            });

            // Sign out from Firebase
            await signOut(auth);

            // Call optional callback
            if (onLogout) {
              onLogout('session-timeout');
            }

            // Redirect to login
            router.push('/signin?session=expired');
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            isLoggingOutRef.current = false;
            currentUserRef.current = null;
          }
        }, TIMEOUT_MS);
      }
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [auth, router, timeoutMinutes, TIMEOUT_MS, onLogout]);

  return null;
}
