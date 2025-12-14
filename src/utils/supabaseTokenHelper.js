/**
 * Supabase Token Helper - Frontend Utility
 * 
 * Helper functions to manage Supabase access tokens for API requests
 * Use these functions to automatically attach tokens to API headers
 * 
 * Location: frontend/src/utils/supabaseTokenHelper.js
 */

import { supabase } from '../config/supabase';

/**
 * Get a fresh Supabase access token for the current user
 * Automatically refreshes expired tokens
 * 
 * @returns {Promise<string|null>} Supabase access token or null if not authenticated
 * 
 * @example
 * const token = await getSupabaseToken();
 * fetch('/api/admin/stats', {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 */
export const getSupabaseToken = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error getting Supabase session:', error);
      return null;
    }
    
    if (!session) {
      console.warn('⚠️ No active Supabase session');
      return null;
    }

    console.log('🔑 Supabase token retrieved successfully');
    return session.access_token;
  } catch (error) {
    console.error('❌ Error in getSupabaseToken:', error);
    return null;
  }
};

/**
 * Get Supabase token and format it for Authorization header
 * 
 * @returns {Promise<string|null>} "Bearer <token>" or null
 * 
 * @example
 * const authHeader = await getSupabaseAuthHeader();
 * fetch('/api/user/profile', {
 *   headers: { Authorization: authHeader }
 * });
 */
export const getSupabaseAuthHeader = async () => {
  const token = await getSupabaseToken();
  return token ? `Bearer ${token}` : null;
};

/**
 * Check if current user is authenticated in Supabase
 * 
 * @returns {Promise<boolean>} True if authenticated
 */
export const isSupabaseAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('❌ Error checking Supabase auth:', error);
    return false;
  }
};

/**
 * Fetch helper that automatically adds Supabase auth token
 * 
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} Fetch response
 * 
 * @example
 * const response = await authenticatedFetch('/api/user/profile', {
 *   method: 'GET'
 * });
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = await getSupabaseToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  return fetch(url, {
    ...options,
    headers
  });
};

/**
 * Get current user from Supabase session
 * 
 * @returns {Promise<object|null>} User object or null
 */
export const getCurrentSupabaseUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error in getCurrentSupabaseUser:', error);
    return null;
  }
};

/**
 * Wait for Supabase auth to be ready
 * Useful during app initialization
 * 
 * @param {number} timeoutMs - Maximum wait time in milliseconds (default: 5000)
 * @returns {Promise<object|null>} Session object or null if timeout
 */
export const waitForSupabaseAuth = async (timeoutMs = 5000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ Supabase auth ready');
      return session;
    }
    
    // Wait 100ms before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.warn('⚠️ Supabase auth timeout - no session found');
  return null;
};

// Backward compatibility aliases (so existing imports don't break)
export const getFirebaseToken = getSupabaseToken;
export const getFirebaseAuthHeader = getSupabaseAuthHeader;
export const isFirebaseAuthenticated = isSupabaseAuthenticated;
export const getCurrentFirebaseUser = getCurrentSupabaseUser;
export const waitForFirebaseAuth = waitForSupabaseAuth;
