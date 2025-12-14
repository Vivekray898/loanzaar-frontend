// Firebase Authentication Service
// Handles all authentication operations - replaces JWT

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '../config/firebase';
import app from '../config/firebase';

const auth = getAuth(app);

// Temporary stubs for unimplemented Firebase helpers
const updateProfile = async () => {};
const sendPasswordResetEmail = async () => {};
const sendEmailVerification = async () => {};
const signInWithEmailLink = async () => {};
const sendSignInLinkToEmail = async () => {};
const isSignInWithEmailLink = () => false;

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
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Send email verification
    await sendEmailVerification(user);
    
    console.log('✅ User account created:', user.uid);
    console.log('📧 Verification email sent to:', email);
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      },
      message: 'Account created successfully. Please check your email for verification.'
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
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get Firebase ID token
    const idToken = await user.getIdToken();
    
    console.log('✅ Sign in successful:', user.email);
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      },
      token: idToken
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
    await signOut(auth);
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
    
    await sendPasswordResetEmail(auth, email);
    
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
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user signed in');
    }
    
    if (user.emailVerified) {
      return {
        success: true,
        message: 'Email is already verified'
      };
    }
    
    await sendEmailVerification(user);
    
    console.log('✅ Verification email sent');
    return {
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    };
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
    const actionCodeSettings = {
      url: `${window.location.origin}/complete-signin`,
      handleCodeInApp: true
    };
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Save email to localStorage for completion
    window.localStorage.setItem('emailForSignIn', email);
    
    console.log('✅ Sign-in link sent to:', email);
    return {
      success: true,
      message: 'Sign-in link sent to your email. Please check your inbox.'
    };
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
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error('Invalid sign-in link');
    }
    
    let email = window.localStorage.getItem('emailForSignIn');
    
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    
    const userCredential = await signInWithEmailLink(auth, email, window.location.href);
    
    window.localStorage.removeItem('emailForSignIn');
    
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    
    console.log('✅ Email link sign-in successful');
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      },
      token: idToken
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
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user signed in');
  }
  
  const token = await user.getIdToken(true); // Force refresh
  return token;
};

/**
 * Get current user info
 * @returns {Object|null} User info or null
 */
export const getCurrentUser = () => {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber
  };
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function (user) => {}
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL
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
  return auth.currentUser !== null;
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
