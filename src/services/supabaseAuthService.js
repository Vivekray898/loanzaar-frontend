// Supabase auth utilities (trimmed for phone-only OTP setup)
import { supabase } from '../config/supabase';

/**
 * Sign Out
 * @returns {Promise<Object>}
 */
export const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true, message: "Signed out successfully" };
  } catch (error) {
    console.error("❌ Sign-out error (Supabase):", error);
    throw {
      success: false,
      message: "Error signing out"
    };
  }
};

/**
 * Get Current User (via Supabase session)
 * @returns {Promise<Object|null>} Current authenticated user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Get ID Token for Current User
 * @returns {Promise<string|null>} Supabase session token
 */
export const getIdToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

/**
 * Auth State Observer
 * @param {Function} callback - Called when auth state changes
 * @returns {Object} Subscription object
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, session);
  });
};

export default {
  logOut,
  getCurrentUser,
  getIdToken,
  onAuthStateChange,
};
