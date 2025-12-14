// Firebase Auth API Service - Handles MongoDB profile creation/retrieval
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://loanzaar-react-base.onrender.com/api';

/**
 * Create or update user profile in MongoDB after Supabase authentication
 * @param {Object} profileData - User profile data including supabaseUID
 * @returns {Promise<Object>}
 */
export const createOrUpdateUserProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_URL}/auth/firebase/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create/update profile');
    }

    return data;
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    throw error;
  }
};

/**
 * Get user profile by Supabase UID
 * @param {string} supabaseUID 
 * @returns {Promise<Object>}
 */
export const getUserProfileByUID = async (supabaseUID) => {
  try {
    const response = await fetch(`${API_URL}/auth/firebase/profile/${supabaseUID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get profile');
    }

    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

/**
 * Verify Firebase token and get user profile
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<Object>}
 */
export const verifyTokenAndGetProfile = async (idToken) => {
  try {
    const response = await fetch(`${API_URL}/auth/firebase/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify token');
    }

    return data;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

/**
 * Delete user profile
 * @param {string} supabaseUID 
 * @param {string} idToken - Auth token for authentication
 * @returns {Promise<Object>}
 */
export const deleteUserProfile = async (supabaseUID, idToken) => {
  try {
    const response = await fetch(`${API_URL}/auth/firebase/profile/${supabaseUID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete profile');
    }

    return data;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
};

export default {
  createOrUpdateUserProfile,
  getUserProfileByUID,
  verifyTokenAndGetProfile,
  deleteUserProfile
};
