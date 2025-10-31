// Custom React Hook for Firebase Cloud Messaging (FCM)
// Manages FCM setup, message listening, and notification display

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  setupFCMForUser,
  checkFCMStatus,
  onMessageListener,
  clearFCMSetup,
  refreshFCMToken
} from './firebaseMessaging';

/**
 * useFCM Hook - Set up FCM for a user and listen for notifications
 * 
 * Usage in component:
 * ```
 * const { fcmSetup, fcmError, isListening } = useFCM({
 *   userId: 'user_123',
 *   role: 'user',
 *   authToken: 'jwt_token_123',
 *   enabled: true
 * });
 * ```
 * 
 * @param {Object} options - Configuration object
 * @param {string} options.userId - Firebase UID of the user
 * @param {string} options.role - User role: 'admin' or 'user'
 * @param {string} options.authToken - User's JWT authentication token
 * @param {boolean} options.enabled - Enable/disable FCM setup (default: true)
 * @param {Function} options.onNotification - Callback when notification received (optional)
 * @returns {Object} {fcmSetup, fcmError, isListening, setupFCM, clearFCM, refreshToken}
 */
export const useFCM = ({
  userId,
  role,
  authToken,
  enabled = true,
  onNotification = null
} = {}) => {
  const [fcmSetup, setFcmSetup] = React.useState(false);
  const [fcmError, setFcmError] = React.useState(null);
  const [isListening, setIsListening] = React.useState(false);
  const unsubscribeRef = useRef(null);
  const tokenRefreshIntervalRef = useRef(null);

  /**
   * Setup FCM for the user
   */
  const setupFCM = useCallback(async () => {
    if (!enabled || !userId || !role || !authToken) {
      console.warn('⚠️ FCM setup skipped: missing required parameters', {
        enabled,
        userId,
        role,
        authToken: !!authToken
      });
      return;
    }

    try {
      setFcmError(null);
      console.log('🚀 Starting FCM setup for user:', userId);

      // Check if already set up
      const status = checkFCMStatus();
      if (status.isSetup) {
        console.log('✅ FCM already set up for this user');
        setFcmSetup(true);
        return;
      }

      // Setup FCM
      const result = await setupFCMForUser(userId, role, authToken);
      
      if (result.success) {
        console.log('✅ FCM setup successful');
        setFcmSetup(true);
        setFcmError(null);
      } else {
        console.error('❌ FCM setup failed:', result.message);
        setFcmSetup(false);
        setFcmError(result.message);
      }
    } catch (error) {
      console.error('❌ Error during FCM setup:', error);
      setFcmSetup(false);
      setFcmError(error.message || 'Failed to setup FCM');
    }
  }, [userId, role, authToken, enabled]);

  /**
   * Start listening for foreground messages
   */
  const startListening = useCallback(() => {
    if (!fcmSetup) {
      console.warn('⚠️ Cannot start listening: FCM not set up');
      return;
    }

    if (isListening) {
      console.log('ℹ️ Already listening for messages');
      return;
    }

    try {
      console.log('👂 Starting to listen for foreground FCM messages...');
      
      unsubscribeRef.current = onMessageListener((payload) => {
        console.log('📬 Foreground notification received:', payload);

        // Call user's callback if provided
        if (onNotification && typeof onNotification === 'function') {
          onNotification(payload);
        }

        // Show toast notification
        const title = payload.title || 'Notification';
        const body = payload.body || 'You have a new message';
        
        toast.info(
          <div>
            <strong>{title}</strong>
            <p>{body}</p>
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          }
        );
      });

      setIsListening(true);
      console.log('✅ Listening for FCM messages');
    } catch (error) {
      console.error('❌ Error starting message listener:', error);
      setFcmError(error.message);
    }
  }, [fcmSetup, isListening, onNotification]);

  /**
   * Stop listening for foreground messages
   */
  const stopListening = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      setIsListening(false);
      console.log('⏹️ Stopped listening for FCM messages');
    }
  }, []);

  /**
   * Refresh the FCM token
   */
  const refreshToken = useCallback(async () => {
    try {
      console.log('🔄 Refreshing FCM token...');
      const newToken = await refreshFCMToken(userId);
      
      if (newToken) {
        console.log('✅ FCM token refreshed');
        return newToken;
      } else {
        console.warn('⚠️ Could not refresh FCM token');
        return null;
      }
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      setFcmError(error.message);
      return null;
    }
  }, [userId]);

  /**
   * Clear FCM setup (for logout)
   */
  const clearFCM = useCallback(async () => {
    try {
      console.log('🧹 Clearing FCM setup...');
      stopListening();
      await clearFCMSetup(authToken);
      setFcmSetup(false);
      setFcmError(null);
      console.log('✅ FCM setup cleared');
    } catch (error) {
      console.error('❌ Error clearing FCM:', error);
    }
  }, [authToken, stopListening]);

  /**
   * Setup effect: Initialize FCM on mount
   */
  useEffect(() => {
    if (enabled && userId && role && authToken) {
      setupFCM();
    }

    return () => {
      // Cleanup on unmount
      stopListening();
    };
  }, [enabled, userId, role, authToken, setupFCM, stopListening]);

  /**
   * Start listening when FCM setup is complete
   */
  useEffect(() => {
    if (fcmSetup && !isListening) {
      startListening();
    }

    return () => {
      // Cleanup on unmount
      stopListening();
    };
  }, [fcmSetup, isListening, startListening, stopListening]);

  /**
   * Setup token refresh interval (refresh every 24 hours)
   * FCM tokens can expire, so we refresh periodically
   */
  useEffect(() => {
    if (fcmSetup) {
      // Refresh token every 24 hours
      const refreshInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      tokenRefreshIntervalRef.current = setInterval(async () => {
        console.log('⏰ FCM token refresh scheduled');
        await refreshToken();
      }, refreshInterval);

      return () => {
        if (tokenRefreshIntervalRef.current) {
          clearInterval(tokenRefreshIntervalRef.current);
        }
      };
    }
  }, [fcmSetup, refreshToken]);

  return {
    fcmSetup,      // Boolean: FCM is set up and ready
    fcmError,      // String: Error message if setup failed
    isListening,   // Boolean: Currently listening for foreground messages
    setupFCM,      // Function: Manually setup FCM
    clearFCM,      // Function: Clear FCM setup (logout)
    refreshToken,  // Function: Manually refresh FCM token
    startListening, // Function: Start listening for messages
    stopListening   // Function: Stop listening for messages
  };
};

// Also export as default for backward compatibility
import * as React from 'react';

export default useFCM;
