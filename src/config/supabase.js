// Supabase Configuration and Initialization
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 * 
 * All sensitive values are loaded from environment variables (process.env)
 * This prevents accidental exposure in version control while keeping the configuration flexible.
 * 
 * Environment variables used (with NEXT_PUBLIC_ prefix for client-side access):
 * - SUPABASE_URL: Supabase Project URL
 * - SUPABASE_ANON_KEY: Supabase Anonymous/Public API Key
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

/**
 * Validate Supabase Configuration
 * Ensures all required environment variables are set
 */
const validateSupabaseConfig = () => {
  const missingFields = [];
  
  if (!supabaseUrl) missingFields.push('SUPABASE_URL');
  if (!supabaseAnonKey) missingFields.push('SUPABASE_ANON_KEY');

  if (missingFields.length > 0) {
    console.warn(
      '⚠️  Missing Supabase configuration values:',
      missingFields.join(', '),
      '\n📋 Please check your .env.local file and ensure all NEXT_PUBLIC_SUPABASE_* variables are set correctly.'
    );
  }
};

// Validate configuration on initialization
validateSupabaseConfig();

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

/**
 * Get the current user's session
 * @returns {Promise<{session: Session | null, error: Error | null}>}
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session || null, error };
};

/**
 * Get the current authenticated user
 * @returns {Promise<{user: User | null, error: Error | null}>}
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user || null, error };
};

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: User | null, session: Session | null, error: Error | null}>}
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data?.user || null, session: data?.session || null, error };
};

/**
 * Sign up with email and password
 * @param {string} email 
 * @param {string} password 
 * @param {object} metadata - Additional user metadata
 * @returns {Promise<{user: User | null, session: Session | null, error: Error | null}>}
 */
export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { user: data?.user || null, session: data?.session || null, error };
};

/**
 * Sign out the current user
 * @returns {Promise<{error: Error | null}>}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Send password reset email
 * @param {string} email 
 * @returns {Promise<{error: Error | null}>}
 */
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
};

/**
 * Update user password
 * @param {string} newPassword 
 * @returns {Promise<{user: User | null, error: Error | null}>}
 */
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { user: data?.user || null, error };
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Called when auth state changes
 * @returns {object} Subscription object with unsubscribe method
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, session);
  });
};

// Export default Supabase client
export default supabase;
