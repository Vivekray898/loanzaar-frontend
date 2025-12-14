'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../config/supabase';

export const UserAuthContext = createContext();

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
};

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 UserAuthProvider: Setting up Supabase auth listener...');

    // Listen for Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        console.log('✅ User authenticated via Supabase:', session.user.id);

        // Store token
        localStorage.setItem('userToken', session.access_token);
        localStorage.setItem('supabaseUID', session.user.id);

        // Try to get extended user data from localStorage
        const storedUserData = localStorage.getItem('userData');
        let parsedUserData = null;

        if (storedUserData) {
          try {
            parsedUserData = JSON.parse(storedUserData);
          } catch (e) {
            console.error('Error parsing stored user data', e);
          }
        }

        // Construct user object
        const userObj = {
          uid: session.user.id,
          email: session.user.email,
          emailVerified: session.user.email_confirmed_at !== null,
          name: session.user.user_metadata?.full_name || (parsedUserData ? parsedUserData.name : 'User'),
          displayName: session.user.user_metadata?.full_name || null,
          photoURL: session.user.user_metadata?.avatar_url || null,
          role: parsedUserData ? parsedUserData.role : 'user',
          getIdToken: async () => session.access_token,
          ...parsedUserData
        };

        setUser(userObj);

        // Update localStorage if needed
        if (!storedUserData) {
          localStorage.setItem('userData', JSON.stringify(userObj));
        }
        } else {
        console.log('❌ No authenticated user');
        setUser(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('supabaseUID');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (userData, token) => {
    // This is now mostly a fallback or for setting initial local state
    // The real work happens in onAuthStateChanged
    console.log('🔐 Manual login trigger:', userData.name);
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async (reason = 'user-action') => {
    console.log(`🚪 Logging out user (reason: ${reason})`);
    try {
      // Clear local storage
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('supabaseUID');
      localStorage.removeItem('supabaseEmail');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Reset state
      setUser(null);
      
      // Redirect to login
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};
