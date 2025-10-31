// Firebase Authentication Service
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from '../config/firebase';

// ActionCodeSettings for Email Link (passwordless sign-in)
// Compute at call time to avoid referencing window during server builds
const buildActionCodeSettings = () => ({
  url: (typeof window !== 'undefined' ? `${window.location.origin}/finishSignUp` : '/finishSignUp'),
  handleCodeInApp: true
});

/**
 * Sign up with Email and Password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Firebase user credential
 */
export const signUpWithEmailPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    return {
      success: true,
      user: userCredential.user,
      message: "Verification email sent. Please check your inbox."
    };
  } catch (error) {
    console.error("Firebase signup error:", error);
    throw {
      success: false,
      message: getFirebaseErrorMessage(error.code)
    };
  }
};

/**
 * Sign in with Email and Password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Firebase user credential
 */
export const signInWithEmailPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      throw {
        code: 'auth/email-not-verified',
        message: 'Please verify your email before signing in.'
      };
    }
    
    // Force fresh token (forceRefresh: true)
    console.log('🔄 Getting fresh Firebase token...');
    const freshToken = await userCredential.user.getIdToken(true);
    console.log('✅ Fresh token obtained, length:', freshToken.length);
    
    return {
      success: true,
      user: userCredential.user,
      uid: userCredential.user.uid,
      token: freshToken
    };
  } catch (error) {
    console.error("Firebase signin error:", error);
    throw {
      success: false,
      message: getFirebaseErrorMessage(error.code)
    };
  }
};

/**
 * Send Passwordless Sign-In Email Link
 * @param {string} email 
 * @returns {Promise<Object>}
 */
export const sendSignInLink = async (email) => {
  try {
    const actionCodeSettings = buildActionCodeSettings();
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Store email in localStorage for email link verification
    window.localStorage.setItem('emailForSignIn', email);
    
    return {
      success: true,
      message: "Sign-in link sent to your email. Please check your inbox."
    };
  } catch (error) {
    console.error("Firebase email link error:", error);
    throw {
      success: false,
      message: getFirebaseErrorMessage(error.code)
    };
  }
};

/**
 * Complete Sign-In with Email Link
 * @param {string} email 
 * @param {string} emailLink - The link from the email
 * @returns {Promise<Object>}
 */
export const completeSignInWithEmailLink = async (email, emailLink) => {
  try {
    if (!isSignInWithEmailLink(auth, emailLink)) {
      throw new Error('Invalid sign-in link');
    }
    
    const userCredential = await signInWithEmailLink(auth, email, emailLink);
    
    // Clear email from localStorage
    window.localStorage.removeItem('emailForSignIn');
    
    return {
      success: true,
      user: userCredential.user,
      uid: userCredential.user.uid,
      token: await userCredential.user.getIdToken(),
      isNewUser: userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime
    };
  } catch (error) {
    console.error("Firebase email link completion error:", error);
    throw {
      success: false,
      message: getFirebaseErrorMessage(error.code)
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
    await sendPasswordResetEmail(auth, email);
    
    return {
      success: true,
      message: "Password reset email sent. Please check your inbox."
    };
  } catch (error) {
    console.error("Firebase password reset error:", error);
    throw {
      success: false,
      message: getFirebaseErrorMessage(error.code)
    };
  }
};

/**
 * Sign Out
 * @returns {Promise<Object>}
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true, message: "Signed out successfully" };
  } catch (error) {
    console.error("Firebase signout error:", error);
    throw {
      success: false,
      message: "Error signing out"
    };
  }
};

/**
 * Get Current User
 * @returns {Object|null} Current Firebase user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get ID Token for Current User
 * @returns {Promise<string|null>} Firebase ID token
 */
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

/**
 * Auth State Observer
 * @param {Function} callback - Called when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Resend Email Verification
 * @returns {Promise<Object>}
 */
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    await sendEmailVerification(user);
    
    return {
      success: true,
      message: "Verification email sent. Please check your inbox."
    };
  } catch (error) {
    console.error("Firebase resend verification error:", error);
    throw {
      success: false,
      message: getFirebaseErrorMessage(error.code)
    };
  }
};

/**
 * Get user-friendly error messages for Firebase error codes
 * @param {string} errorCode 
 * @returns {string}
 */
const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/email-not-verified': 'Please verify your email before signing in.',
    'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid or has already been used.',
  };
  
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};

export default {
  signUpWithEmailPassword,
  signInWithEmailPassword,
  sendSignInLink,
  completeSignInWithEmailLink,
  resetPassword,
  logOut,
  getCurrentUser,
  getIdToken,
  onAuthStateChange,
  resendVerificationEmail
};
