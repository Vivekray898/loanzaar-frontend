'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  // Define logout first so it can be used in checkAuth
  const logout = () => {
    console.log('🚪 UserAuthContext: Logging out user');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    router.push('/signin');
  };

  // Check authentication status on mount and when storage changes
  useEffect(() => {
    console.log('🔍 UserAuthProvider: Checking authentication...');
    const checkAuth = () => {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');

      console.log('🔑 Token exists:', !!token);
      console.log('👤 UserData exists:', !!userData);

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('✅ User authenticated:', parsedUser.name);
          setUser(parsedUser);
          setLoading(false);
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
          logout();
          setLoading(false);
        }
      } else {
        console.log('⚠️ No auth data found');
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (in case user signs in from another tab/window)
    window.addEventListener('storage', checkAuth);
    
    // Custom event for same-tab storage changes
    window.addEventListener('userAuthChanged', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('userAuthChanged', checkAuth);
    };
  }, []);

  const login = (userData, token) => {
    console.log('🔐 UserAuthContext: Logging in user:', userData.name);
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
    
    // Dispatch custom event to trigger auth check
    window.dispatchEvent(new Event('userAuthChanged'));
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
