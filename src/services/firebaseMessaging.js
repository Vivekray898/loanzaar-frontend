// Firebase Cloud Messaging Service
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app, FCM_VAPID_KEY } from '../config/firebase';
import { doc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

let messaging = null;

// Initialize messaging (only in browser with service worker support)
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
    
    // Register Firebase Messaging Service Worker
    navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    }).then((registration) => {
      console.log('✅ Firebase Messaging Service Worker registered:', registration);
    }).catch((error) => {
      console.warn('⚠️ Service Worker registration failed:', error);
    });
  }
} catch (error) {
  console.warn('Firebase Messaging not supported:', error);
}

/**
 * Request notification permission and get FCM token
 * Saves token to both localStorage and Firestore
 * @param {string} userId - Firebase UID for Firestore storage
 * @returns {Promise<string|null>} FCM registration token
 */
export const requestNotificationPermission = async (userId) => {
  try {
    if (!messaging) {
      console.warn('Firebase Messaging not initialized');
      return null;
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    console.log('🔔 Requesting notification permission...');
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get FCM registration token
      const token = await getToken(messaging, {
        vapidKey: FCM_VAPID_KEY
      });

      if (token) {
        console.log('🔑 FCM Token obtained:', token.substring(0, 20) + '...');
        
        // Save token to localStorage
        localStorage.setItem('fcmToken', token);
        
        // Save token to Firestore (in user document)
        if (userId) {
          try {
            await updateDoc(doc(db, 'users', userId), {
              fcmToken: token,
              fcmTokenUpdatedAt: new Date(),
              isNotificationsEnabled: true
            });
            console.log('💾 FCM token saved to Firestore for user:', userId);
          } catch (firestoreError) {
            console.warn('⚠️ Could not save token to Firestore (user may not exist yet):', firestoreError.message);
          }
        }
        
        return token;
      }
    } else if (permission === 'denied') {
      console.warn('❌ Notification permission denied');
      return null;
    } else {
      console.log('⚠️ Notification permission dismissed');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    return null;
  }
};

/**
 * Subscribe device token to FCM topic via backend API
 * @param {string} token - FCM registration token
 * @param {string} topic - Topic name (e.g., 'admin_notifications' or 'user_123')
 * @param {string} authToken - User's authentication token
 * @returns {Promise<boolean>} Success status
 */
export const subscribeToTopic = async (token, topic, authToken) => {
  try {
    console.log(`📡 Subscribing to topic: ${topic}`);
    
    const response = await fetch('https://loanzaar-react-base.onrender.com/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ token, topic })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Subscribed to topic: ${topic}`);
      
      // Save topic to localStorage
      localStorage.setItem(`fcmTopic_${topic}`, 'subscribed');
      
      return true;
    } else {
      console.error('❌ Subscription failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error subscribing to topic:', error);
    return false;
  }
};

/**
 * Unsubscribe device token from FCM topic via backend API
 * @param {string} token - FCM registration token
 * @param {string} topic - Topic name
 * @param {string} authToken - User's authentication token
 * @returns {Promise<boolean>} Success status
 */
export const unsubscribeFromTopic = async (token, topic, authToken) => {
  try {
    console.log(`📡 Unsubscribing from topic: ${topic}`);
    
    const response = await fetch('https://loanzaar-react-base.onrender.com/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ token, topic })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Unsubscribed from topic: ${topic}`);
      
      // Remove from localStorage
      localStorage.removeItem(`fcmTopic_${topic}`);
      
      return true;
    } else {
      console.error('❌ Unsubscription failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error unsubscribing from topic:', error);
    return false;
  }
};

/**
 * Listen for foreground messages (when app is open in browser tab)
 * Triggered for messages received while the web app has focus
 * @param {Function} callback - Function to call when message received, receives payload
 * @returns {Function} Unsubscribe function
 */
export const onMessageListener = (callback) => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return () => {};
  }

  console.log('👂 Listening for FCM messages in foreground...');
  
  return onMessage(messaging, (payload) => {
    console.log('📬 Foreground message received:', payload);
    
    // Call the callback with notification data
    if (callback && typeof callback === 'function') {
      callback({
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data || {}
      });
    }
  });
};

/**
 * Setup complete FCM for a user (request permission, get token, subscribe to topic)
 * @param {string} userId - Firebase UID for topic subscription and Firestore
 * @param {string} role - User role ('admin' or 'user')
 * @param {string} authToken - User's authentication token
 * @returns {Promise<Object>} {success, token, topic}
 */
export const setupFCMForUser = async (userId, role, authToken) => {
  try {
    console.log('🚀 Setting up FCM for user:', userId);

    // Step 1: Request permission and get token
    const fcmToken = await requestNotificationPermission(userId);
    if (!fcmToken) {
      return { success: false, message: 'Failed to get FCM token' };
    }

    // Step 2: Determine topic based on role
    const topic = role === 'admin' ? 'admin_notifications' : `user_${userId}`;

    // Step 3: Subscribe to topic
    const subscribed = await subscribeToTopic(fcmToken, topic, authToken);
    if (!subscribed) {
      return { success: false, message: 'Failed to subscribe to topic' };
    }

    // Step 4: Save setup status to localStorage
    localStorage.setItem('fcmSetup', 'true');
    localStorage.setItem('fcmRole', role);
    localStorage.setItem('fcmUserId', userId);

    console.log('✅ FCM setup complete for user:', userId);
    return { success: true, token: fcmToken, topic };
  } catch (error) {
    console.error('❌ Error setting up FCM:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Check if FCM is already set up (has valid token and topic)
 * @returns {Object} {isSetup, token, topic, role, userId}
 */
export const checkFCMStatus = () => {
  const isSetup = localStorage.getItem('fcmSetup') === 'true';
  const token = localStorage.getItem('fcmToken');
  const role = localStorage.getItem('fcmRole');
  const userId = localStorage.getItem('fcmUserId');
  
  return {
    isSetup,
    token,
    role,
    userId,
    topic: role === 'admin' ? 'admin_notifications' : `user_${userId}`
  };
};

/**
 * Refresh FCM token (useful when token expires)
 * @param {string} userId - Firebase UID
 * @returns {Promise<string|null>} New token or null if failed
 */
export const refreshFCMToken = async (userId) => {
  try {
    console.log('🔄 Refreshing FCM token...');
    
    if (!messaging) {
      console.warn('Firebase Messaging not initialized');
      return null;
    }

    const newToken = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready
    });

    if (newToken) {
      localStorage.setItem('fcmToken', newToken);
      
      if (userId) {
        await updateDoc(doc(db, 'users', userId), {
          fcmToken: newToken,
          fcmTokenUpdatedAt: new Date()
        }).catch(() => {
          // User doc may not exist yet, silently fail
        });
      }
      
      console.log('✅ FCM token refreshed:', newToken.substring(0, 20) + '...');
      return newToken;
    }
  } catch (error) {
    console.error('❌ Error refreshing FCM token:', error);
    return null;
  }
};

/**
 * Clear FCM setup (logout scenario)
 * @param {string} authToken - User's authentication token (optional)
 */
export const clearFCMSetup = async (authToken) => {
  const { token, topic, isSetup } = checkFCMStatus();
  
  if (isSetup && token && topic && authToken) {
    console.log('🧹 Clearing FCM setup...');
    try {
      await unsubscribeFromTopic(token, topic, authToken);
    } catch (error) {
      console.warn('⚠️ Error unsubscribing during cleanup:', error);
    }
  }
  
  // Clear all FCM-related localStorage items
  localStorage.removeItem('fcmToken');
  localStorage.removeItem('fcmSetup');
  localStorage.removeItem('fcmRole');
  localStorage.removeItem('fcmUserId');
  
  // Remove all topic subscriptions
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('fcmTopic_')) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ FCM setup cleared');
};

/**
 * Show a toast notification in the browser
 * Called when foreground message is received
 * @param {Object} notification - {title, body, data}
 */
export const showNotificationToast = (notification) => {
  if (typeof window !== 'undefined' && Notification) {
    const { title, body } = notification;
    
    // Create a custom notification in the UI (you can use react-toastify)
    console.log('🔔 Showing notification toast:', title);
    
    // Dispatch custom event that components can listen to
    window.dispatchEvent(new CustomEvent('fcmNotification', {
      detail: notification
    }));
  }
};

export default {
  requestNotificationPermission,
  subscribeToTopic,
  unsubscribeFromTopic,
  onMessageListener,
  setupFCMForUser,
  checkFCMStatus,
  refreshFCMToken,
  clearFCMSetup,
  showNotificationToast
};
