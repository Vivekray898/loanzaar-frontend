// Profile API using Supabase `profiles` table
import { supabase } from '../config/supabase';

/**
 * Create or update user profile in Supabase `profiles` table.
 * Accepts multiple UID field names (supabaseUID, uid, id, userId).
 * @param {Object} profileData - { supabaseUID|uid|id|userId, name, email, phone, ... }
 * @returns {Promise<Object>} - { success: true, data }
 */
export const createOrUpdateUserProfile = async (profileData) => {
  try {
    const supabaseUID = profileData.supabaseUID || profileData.uid || profileData.id || profileData.userId;

    // Accept either a profile id, legacy supabase UID, or a phone number as identifier
    const profileId = profileData.id || profileData.supabaseUID || profileData.uid || profileData.userId || null;
    const phone = profileData.phone || null;

    if (!profileId && !phone) {
      throw new Error('Please provide a profile id, supabaseUID, or phone');
    }

    const payload = {
      full_name: profileData.name || null,
      email: profileData.email || null,
      phone: phone,
      address: profileData.address || null,
      photo_url: profileData.photoUrl || profileData.photo_url || null,
      updated_at: new Date().toISOString(),
    };

    // Prefer upserting by phone (primary identity) if phone is available; otherwise, fallback to legacy user_id
    let data, error;
    if (phone) {
      const res = await supabase.from('profiles').upsert({ ...payload }, { onConflict: 'phone' }).select();
      data = res.data; error = res.error;
    } else {
      // No phone: upsert by canonical profile id
      const res = await supabase.from('profiles').upsert({ id: profileId, ...payload }, { onConflict: 'id' }).select();
      data = res.data; error = res.error;
    }

    if (error) {
      console.error('Supabase upsert error (profiles):', error);
      throw error;
    }

    if (error) {
      console.error('Supabase upsert error (profiles):', error);
      throw error;
    }

    return { success: true, data: data?.[0] || null };
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
    if (!supabaseUID) throw new Error('supabaseUID is required');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`id.eq.${supabaseUID},phone.eq.${supabaseUID}`)
      .limit(1);

    if (error) {
      console.error('Supabase select error (profiles):', error);
      throw error;
    }

    return { success: true, data: data?.[0] || null };
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
  // Supabase manages sessions/tokens on the client; this stub remains for compatibility.
  // If server-side verification is needed, implement an API route that verifies the token with Supabase.
  throw new Error('verifyTokenAndGetProfile is not implemented for Supabase; use Supabase client auth methods');
};

/**
 * Delete user profile
 * @param {string} supabaseUID 
 * @param {string} idToken - Auth token for authentication
 * @returns {Promise<Object>}
 */
export const deleteUserProfile = async (supabaseUID) => {
  try {
    if (!supabaseUID) throw new Error('supabaseUID is required');
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .or(`id.eq.${supabaseUID},phone.eq.${supabaseUID}`);

    if (error) {
      console.error('Supabase delete error (profiles):', error);
      throw error;
    }

    return { success: true, data };
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
