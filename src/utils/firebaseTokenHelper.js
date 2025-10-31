/**
 * Firebase Token Helper - Frontend Utility
 * 
 * Helper functions to manage Firebase ID tokens for API requests
 * Use these functions to automatically attach tokens to API headers
 * 
 * Location: frontend/src/utils/firebaseTokenHelper.js
 */

import { auth } from '../config/firebase';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';

/**
 * Get a fresh Firebase ID token for the current user
 * Automatically refreshes expired tokens
 * Falls back to stored token if Firebase auth not ready
 * 
 * @param {boolean} forceRefresh - Force a new token even if one exists (default: false)
 * @returns {Promise<string|null>} Firebase ID token or null if not authenticated
 * 
 * @example
 * const token = await getFirebaseToken();
 * fetch('/api/admin/stats', {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 */
export const getFirebaseToken = async (forceRefresh = false) => {
  try {
    if (!auth.currentUser) {
      console.warn('⚠️ No user currently authenticated in Firebase');
      
      // Fallback to stored token from localStorage (UserAuthContext token)
      const storedToken = localStorage.getItem('userToken');
      if (storedToken) {
        console.log('✅ Using stored token from localStorage as fallback');
        return storedToken;
      }
      
      console.warn('⚠️ No stored token available either');
      return null;
    }

    console.log('🔑 Fetching Firebase ID token...');
    const token = await getIdToken(auth.currentUser, forceRefresh);
    console.log('✅ Firebase token fetched successfully');
    console.log('   Token length:', token.length);
    console.log('   First 30 chars:', token.substring(0, 30) + '...');
    
    return token;
  } catch (error) {
    console.error('❌ Error fetching Firebase token:', error);
    
    // Final fallback to stored token
    const storedToken = localStorage.getItem('userToken');
    if (storedToken) {
      console.log('✅ Falling back to stored token from localStorage after error');
      return storedToken;
    }
    
    throw error;
  }
};

// Base URL for API requests, configure via .env as NEXT_PUBLIC_API_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Make an authenticated API request with Firebase token
 * Automatically handles token refresh on 401 errors
 * 
 * @param {string} url - API endpoint URL (without the /api prefix - it's added by API_BASE_URL)
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} Fetch response object
 * 
 * @example
 * // API_BASE_URL is set from NEXT_PUBLIC_API_URL (e.g., http://localhost:5000/api)
 * // So just pass the endpoint without /api prefix
 * const response = await fetchWithFirebaseToken('/admin/stats', {
 *   method: 'GET'
 * });
 * const data = await response.json();
 */
export const fetchWithFirebaseToken = async (url, options = {}) => {
  try {
    // Get fresh Firebase token
    const token = await getFirebaseToken();
    
    if (!token) {
      throw new Error('No Firebase authentication token available');
    }

    // Add token to Authorization header
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`
    };

    console.log(`📡 Making authenticated request to: ${API_BASE_URL}${url}`);
    console.log('   Method:', options.method || 'GET');
    console.log('   With token: Yes');

    // Make request with token
    let response = await fetch(API_BASE_URL + url, {
      ...options,
      headers
    });

    console.log(`   Response status: ${response.status}`);

    // If 401 (Unauthorized), try refreshing token and retrying once
    if (response.status === 401) {
      console.warn('⚠️ Got 401 Unauthorized - Token may be expired');
      console.log('🔄 Attempting to refresh token and retry...');

      // Get a fresh token (force refresh)
      const newToken = await getFirebaseToken(true);

      if (!newToken) {
        throw new Error('Failed to refresh Firebase token');
      }

      // Retry request with fresh token
      const retryHeaders = {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${newToken}`
      };

      console.log('📡 Retrying request with refreshed token...');
      response = await fetch(API_BASE_URL + url, {
        ...options,
        headers: retryHeaders
      });

      console.log(`   Retry response status: ${response.status}`);
    }

    return response;

  } catch (error) {
    console.error('❌ Error in authenticated request:', error);
    throw error;
  }
};

/**
 * Hook to automatically add Firebase token to all fetch requests
 * Add this to your React component or context
 * 
 * @example
 * useEffect(() => {
 *   const unsubscribe = setupAuthHeaderInterceptor();
 *   return unsubscribe;
 * }, []);
 */
export const setupAuthHeaderInterceptor = () => {
  const originalFetch = window.fetch;

  window.fetch = function(...args) {
    const [resource, config] = args;
    
    // Only intercept API calls (not external URLs)
    if (typeof resource === 'string' && resource.startsWith('/api/')) {
      return getFirebaseToken()
        .then(token => {
          if (token) {
            if (!config) {
              args[1] = {};
            }
            if (!args[1].headers) {
              args[1].headers = {};
            }
            args[1].headers.Authorization = `Bearer ${token}`;
          }
          return originalFetch.apply(this, args);
        })
        .catch(error => {
          console.error('Failed to add auth header:', error);
          return originalFetch.apply(this, args);
        });
    }

    return originalFetch.apply(this, args);
  };

  // Return cleanup function
  return () => {
    window.fetch = originalFetch;
  };
};

/**
 * Get current admin user info from Firebase Auth
 * Returns Firebase user object, not admin profile
 * 
 * @returns {Promise<Object|null>} Firebase user or null
 */
export const getCurrentFirebaseUser = async () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Helper to check if user is authenticated
 * 
 * @returns {boolean} True if user is logged in
 */
export const isFirebaseUserAuthenticated = () => {
  return !!auth.currentUser;
};

/**
 * Get token expiration time in milliseconds
 * 
 * @param {string} token - JWT token
 * @returns {number} Milliseconds until expiration (or 0 if already expired)
 */
export const getTokenExpirationMs = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ Invalid JWT token format');
      return 0;
    }

    // Decode payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const msUntilExpiration = expirationTime - now;

    console.log(`⏱️ Token expires in: ${Math.round(msUntilExpiration / 1000)}s`);
    
    return Math.max(0, msUntilExpiration);
  } catch (error) {
    console.error('❌ Error decoding token expiration:', error);
    return 0;
  }
};

/**
 * Decode Firebase JWT token (for debugging only)
 * DO NOT use decoded token for security decisions - always verify on backend
 * 
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const decodeFirebaseToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    return null;
  }
};

export default {
  getFirebaseToken,
  fetchWithFirebaseToken,
  setupAuthHeaderInterceptor,
  getCurrentFirebaseUser,
  isFirebaseUserAuthenticated,
  getTokenExpirationMs,
  decodeFirebaseToken
};
