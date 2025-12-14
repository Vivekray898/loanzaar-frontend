'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../config/supabase';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Stays true until Supabase initializes
  const [authInitialized, setAuthInitialized] = useState(false); // ✅ Tracks if Supabase has checked session
  const router = useRouter();

  // Listen to Supabase Auth state changes
  useEffect(() => {
    console.log('🔍 Setting up Supabase auth listener for admin...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Supabase auth state changed:', session?.user ? `Admin logged in: ${session.user.email}` : 'Admin logged out');
      console.log(`📊 Auth initialization complete - loading will set to false`);
      
      
      if (session?.user) {
        const user = session.user;
        // User is signed in - fetch or create admin data from Supabase
        try {
          let { data: adminDoc, error: fetchError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          // If admin document doesn't exist, create it automatically
          if (fetchError && fetchError.code === 'PGRST116') {
            console.warn('⚠️ Admin document not found during auth state check, creating one automatically...');
            const newAdminData = {
              id: user.id,
              full_name: user.email.split('@')[0],
              email: user.email,
              phone: '',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { data: createdAdmin, error: createError } = await supabase
              .from('admin_users')
              .insert([newAdminData])
              .select()
              .single();
            
            if (createError) {
              console.error('⚠️ Error creating admin document:', createError);
              // Even if creation fails, continue to allow login
              const adminData = {
                uid: user.id,
                email: user.email,
                fullName: user.email.split('@')[0],
                role: 'admin'
              };
              setAdmin(adminData);
              setSupabaseUser(user);
              setLoading(false);
              return;
            }
            
            adminDoc = createdAdmin;
            console.log('✅ Admin document created automatically');
          }
          
          if (adminDoc) {
            const adminData = {
              uid: user.id,
              email: user.email,
              fullName: adminDoc.full_name,
              phone: adminDoc.phone,
              role: adminDoc.role,
              createdAt: adminDoc.created_at,
              updatedAt: adminDoc.updated_at
            };
            setAdmin(adminData);
            setSupabaseUser(user);
            console.log('✅ Admin data loaded from Supabase');
          } else {
            console.warn('⚠️ Admin document still not found after creation attempt');
            setAdmin(null);
            setSupabaseUser(null);
          }
        } catch (error) {
          console.error('❌ Error fetching/creating admin data:', error);
          // Even if database fails, allow basic authentication
          const adminData = {
            uid: user.id,
            email: user.email,
            fullName: user.email.split('@')[0],
            role: 'admin'
          };
          setAdmin(adminData);
          setSupabaseUser(user);
        }
      } else {
        // User is signed out
        setAdmin(null);
        setSupabaseUser(null);
      }
      
      // ✅ CRITICAL: Set loading=false AFTER Supabase finishes checking session
      // This ensures components don't make API calls before auth is ready
      setLoading(false);
      setAuthInitialized(true);
      console.log('✅ Supabase auth check complete - loading state now false');
    });

    return () => {
      console.log('🧹 Cleaning up Supabase auth listener');
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Login admin using Supabase Authentication
   */
  const login = async (email, password) => {
    try {
      console.log('🔐 Logging in admin via Supabase...');
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) throw signInError;
      
      const user = data.user;
      
      // Fetch or create admin data in Supabase
      let { data: adminDoc, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // If admin document doesn't exist, create it automatically
      if (fetchError && fetchError.code === 'PGRST116') {
        console.warn('⚠️ Admin document not found, creating one automatically...');
        const newAdminData = {
          id: user.id,
          full_name: email.split('@')[0],  // Use email prefix as default name
          email: user.email,
          phone: '',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: createdAdmin, error: createError } = await supabase
          .from('admin_users')
          .insert([newAdminData])
          .select()
          .single();
        
        if (createError) throw createError;
        
        adminDoc = createdAdmin;
        console.log('✅ Admin document created automatically');
      }
      
      const adminData = {
        uid: user.id,
        email: user.email,
        fullName: adminDoc.full_name,
        phone: adminDoc.phone,
        role: adminDoc.role
      };
      
      setAdmin(adminData);
      setSupabaseUser(user);
      
      console.log('✅ Admin logged in successfully');
      return { success: true, admin: adminData };
    } catch (error) {
      console.error('❌ Login error:', error);
      let message = 'Login failed. Please try again.';
      
      if (error.message?.includes('Invalid login credentials')) {
        message = 'Invalid email or password';
      } else if (error.message?.includes('Email not confirmed')) {
        message = 'Please verify your email address';
      } else if (error.message?.includes('Email rate limit exceeded')) {
        message = 'Too many failed attempts. Please try again later.';
      }
      
      return { success: false, error: message };
    }
  };

  /**
   * Signup admin using Firebase Authentication
   */
  const signup = async (email, password, fullName, phone, role = 'admin') => {
    try {
      console.log('📝 Creating admin account via Supabase...');
      
      // Create Supabase Auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      const user = data.user;
      
      // Store admin data in Supabase
      const adminData = {
        id: user.id,
        full_name: fullName,
        email,
        phone,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([adminData]);
      
      if (insertError) throw insertError;
      
      console.log('✅ Admin account created successfully');
      return { success: true, uid: user.id };
    } catch (error) {
      console.error('❌ Signup error:', error);
      let message = 'Signup failed. Please try again.';
      
      if (error.message?.includes('already registered')) {
        message = 'Email already registered';
      } else if (error.message?.includes('invalid email')) {
        message = 'Invalid email address';
      } else if (error.message?.includes('Password')) {
        message = 'Password is too weak. Use at least 8 characters.';
      }
      
      return { success: false, error: message };
    }
  };

  /**
   * Logout admin - Supabase sign out
   */
  const logout = async (reason = 'manual') => {
    try {
      console.log(`🚪 Logging out admin (reason: ${reason})...`);
      
      await supabase.auth.signOut();
      
      setAdmin(null);
      setSupabaseUser(null);
      
      console.log('✅ Admin logout complete');
      router.push('/admin/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout even if there's an error
      setAdmin(null);
      setSupabaseUser(null);
      router.push('/admin/login');
    }
  };

  /**
   * Check if admin is authenticated
   */
  const isAuthenticated = () => {
    return !!admin && !!supabaseUser;
  };

  /**
   * Get current admin Supabase token
   */
  const getAdminToken = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session?.access_token || null;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  };

  /**
   * Update admin profile in Supabase
   */
  const updateAdminProfile = async (newAdminData) => {
    if (!admin || !supabaseUser) {
      console.error('❌ No admin logged in');
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const updatedData = {
        ...newAdminData,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('admin_users')
        .update(updatedData)
        .eq('id', supabaseUser.id);
      
      if (error) throw error;
      
      const updated = { ...admin, ...updatedData };
      setAdmin(updated);
      
      console.log('✅ Admin profile updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    admin,
    supabaseUser,
    login,
    signup,
    logout,
    isAuthenticated,
    getAdminToken,
    updateAdminProfile,
    loading,
    authInitialized
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
