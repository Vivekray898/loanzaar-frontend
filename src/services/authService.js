// Firebase Authentication Service
// Handles all authentication operations - replaces JWT

import {
  supabase,
  getSession,
  getCurrentUser as getCurrentUserFromSupabase,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  resetPassword as supabaseResetPassword,
  onAuthStateChange,
} from '../config/supabase';

// Helper wrappers where necessary

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User's full name
 * @returns {Promise<Object>} User credential
 */
export const signUp = async (email, password, displayName = '') => {
  try {
    console.log('📝 Creating new user account...');
    const { user, session, error } = await supabaseSignUp(email, password, { displayName });
    if (error) throw error;

    console.log('✅ User account created:', user?.id);
    return {
      success: true,
      user: {
        uid: user?.id,
        email: user?.email,
        displayName: user?.user_metadata?.displayName || displayName || '',
      },
      message: 'Account created successfully. Please check your email for verification.',
      token: session?.access_token || null,
    };
  } catch (error) {
    console.error('❌ Sign up error:', error.message);
    
    // Handle specific errors
    let message = 'Failed to create account';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      default:
        message = error.message;
    }
    
    throw new Error(message);
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User credential
 */
export const signIn = async (email, password) => {
  try {
    console.log('🔐 Signing in...');
    const { user, session, error } = await supabaseSignIn(email, password);
    if (error) throw error;

    const token = session?.access_token || null;

    console.log('✅ Sign in successful:', user?.email);

    return {
      success: true,
      user: {
        uid: user?.id,
        email: user?.email,
        displayName: user?.user_metadata?.displayName || null,
        emailVerified: user?.email_confirmed || false,
      },
      token,
    };
  } catch (error) {
    console.error('❌ Sign in error:', error.message);
    
    let message = 'Failed to sign in';
    
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        message = 'Invalid email or password';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Try again later.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      default:
        message = error.message;
    }
    
    throw new Error(message);
  }
};

/**
 * Sign out current user
 * @returns {Promise<Object>} Success response
 */
export const logOut = async () => {
  try {
    await supabaseSignOut();
    console.log('👋 User signed out');
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    return { success: true, message: 'Signed out successfully' };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<Object>} Success response
 */
export const resetPassword = async (email) => {
  try {
    console.log('📧 Sending password reset email...');
    const { error } = await supabaseResetPassword(email);
    if (error) throw error;

    console.log('✅ Password reset email sent');
    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    };
  } catch (error) {
    console.error('❌ Password reset error:', error);
    
    let message = 'Failed to send password reset email';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      default:
        message = error.message;
    }
    
    throw new Error(message);
  }
};

/**
 * Resend email verification
 * @returns {Promise<Object>} Success response
 */
export const resendVerificationEmail = async () => {
  try {
    // Supabase handles email verification during sign-up via email links.
    const { user, error } = await getCurrentUserFromSupabase();
    if (error) throw error;
    if (!user) throw new Error('No user signed in');
    if (user.email_confirmed) {
      return { success: true, message: 'Email is already verified' };
    }
    return { success: false, message: 'Please check your inbox for the verification email' };
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    throw error;
  }
};

/**
 * Send sign-in link to email (passwordless login)
 * @param {string} email - User email
 * @returns {Promise<Object>} Success response
 */
export const sendSignInLink = async (email) => {
  try {
    // Use Supabase magic link for passwordless sign-in
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/complete-signin` } });
    if (error) throw error;

    window.localStorage.setItem('emailForSignIn', email);
    console.log('✅ Sign-in link (magic link) sent to:', email);
    return { success: true, message: 'Sign-in link sent to your email. Please check your inbox.' };
  } catch (error) {
    console.error('❌ Send sign-in link error:', error);
    throw error;
  }
};

/**
 * Complete sign-in with email link
 * @returns {Promise<Object>} User credential
 */
export const completeSignInWithEmailLink = async () => {
  try {
    // After redirect from Supabase magic link, session should be available
    const { session, error } = await getSession();
    if (error) throw error;
    if (!session?.user) throw new Error('No active session found after magic link sign-in');

    window.localStorage.removeItem('emailForSignIn');

    const user = session.user;
    console.log('✅ Email link sign-in successful');
    return {
      success: true,
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.displayName || null,
        emailVerified: user.email_confirmed || false,
      },
      token: session.access_token,
    };
  } catch (error) {
    console.error('❌ Email link sign-in error:', error);
    throw error;
  }
};

/**
 * Get current user's Firebase ID token
 * @returns {Promise<string>} ID token
 */
export const getCurrentUserToken = async () => {
  const { session, error } = await getSession();
  if (error) throw error;
  if (!session) throw new Error('No active session');
  return session.access_token;
};

/**
 * Get current user info
 * @returns {Object|null} User info or null
 */
export const getCurrentUser = () => {
  return (async () => {
    const { user, error } = await getCurrentUserFromSupabase();
    if (error) throw error;
    if (!user) return null;
    return {
      uid: user.id,
      email: user.email,
      displayName: user.user_metadata?.displayName || null,
      emailVerified: user.email_confirmed || false,
      photoURL: user.user_metadata?.avatar_url || null,
      phoneNumber: user.user_metadata?.phone || null,
    };
  })();
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function (user) => {}
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChange((user) => {
    if (user) {
      callback({
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.displayName || null,
        emailVerified: user.email_confirmed || false,
        photoURL: user.user_metadata?.avatar_url || null,
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is signed in
 */
export const isAuthenticated = () => {
  try {
    if (typeof window === 'undefined') return false;
    // Supabase persists session in localStorage under 'supabase.auth.token'
    const token = window.localStorage.getItem('supabase.auth.token');
    return !!token;
  } catch (e) {
    return false;
  }
};

export default {
  signUp,
  signIn,
  logOut,
  resetPassword,
  resendVerificationEmail,
  sendSignInLink,
  completeSignInWithEmailLink,
  getCurrentUserToken,
  getCurrentUser,
  onAuthChange,
  isAuthenticated
};
