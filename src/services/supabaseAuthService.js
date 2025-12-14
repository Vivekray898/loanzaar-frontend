// Pure Supabase Authentication Service
import { supabase } from '../config/supabase';

/**
 * Sign up with Email and Password
 * @param {string} email 
 * @param {string} password 
 * @param {Object} metadata - Optional user profile data (name, phone, age, gender, income, occupation)
 * @returns {Promise<Object>} User credential
 */
export const signUpWithEmailPassword = async (email, password, metadata = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: metadata.name || '',
          phone: metadata.phone || '',
          age: metadata.age || '',
          gender: metadata.gender || '',
          income: metadata.income || '',
          occupation: metadata.occupation || ''
        }
      }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      user: data.user,
      session: data.session,
      message: "Account created successfully! Please check your email to verify your account."
    };
  } catch (error) {
    console.error("❌ Signup error (Supabase):", error);
    throw {
      success: false,
      message: error.message || "Error creating account"
    };
  }
};

/**
 * Sign in with Email and Password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User credential
 */
export const signInWithEmailPassword = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Force fresh token
    console.log('🔄 Getting fresh Supabase token...');
    console.log('✅ Fresh token obtained, length:', data.session.access_token.length);
    
    return {
      success: true,
      user: data.user,
      session: data.session,
      uid: data.user.id,
      email: data.user.email,
      token: data.session.access_token
    };
  } catch (error) {
    console.error("❌ Sign-in error (Supabase):", error);
    throw {
      success: false,
      message: error.message || "Failed to sign in"
    };
  }
};

/**
 * Send Password Reset Email
 * @param {string} email 
 * @returns {Promise<Object>}
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: "Password reset email sent. Please check your inbox."
    };
  } catch (error) {
    console.error("❌ Password reset error (Supabase):", error);
    throw {
      success: false,
      message: error.message || "Error sending reset email"
    };
  }
};

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
 * Get Current User
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

/**
 * Resend Email Verification
 * @returns {Promise<Object>}
 */
export const resendVerificationEmail = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: "Verification email sent. Please check your inbox."
    };
  } catch (error) {
    console.error("❌ Resend verification error (Supabase):", error);
    throw {
      success: false,
      message: error.message || "Error resending verification"
    };
  }
};

/**
 * Sign in with Magic Link (Email Link)
 * @param {string} email
 * @returns {Promise<Object>}
 */
export const sendSignInLink = async (email) => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: "Sign-in link sent to your email. Please check your inbox."
    };
  } catch (error) {
    console.error("❌ Email link error (Supabase):", error);
    throw {
      success: false,
      message: error.message || "Error sending sign-in link"
    };
  }
};

/**
 * Complete Sign-In with Email Link
 * Note: Supabase handles this automatically via callback URL
 * This is a compatibility stub
 */
export const completeSignInWithEmailLink = async (email, emailLink) => {
  console.log('ℹ️ Supabase handles email link verification automatically via callback');
  return {
    success: true,
    message: "Email link will be verified automatically"
  };
};

/**
 * Update User Profile Metadata
 * @param {Object} metadata - User profile data to update
 * @returns {Promise<Object>} Updated user
 */
export const updateUserProfile = async (metadata) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: metadata.fullName || '',
        phone: metadata.phone || '',
        age: metadata.age || '',
        state: metadata.state || '',
        city: metadata.city || ''
      }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      user: data.user,
      message: "Profile updated successfully"
    };
  } catch (error) {
    console.error("❌ Update profile error (Supabase):", error);
    throw {
      success: false,
      message: error.message || "Error updating profile"
    };
  }
};

export default {
  signUpWithEmailPassword,
  signInWithEmailPassword,
  resetPassword,
  logOut,
  getCurrentUser,
  getIdToken,
  onAuthStateChange,
  resendVerificationEmail,
  sendSignInLink,
  completeSignInWithEmailLink,
  updateUserProfile,
};
