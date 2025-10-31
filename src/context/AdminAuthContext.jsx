'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

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
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Stays true until Firebase initializes
  const [authInitialized, setAuthInitialized] = useState(false); // ✅ Tracks if Firebase has checked session
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();

  // Listen to Firebase Auth state changes
  useEffect(() => {
    console.log('🔍 Setting up Firebase auth listener for admin...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔔 Firebase auth state changed:', user ? `Admin logged in: ${user.email}` : 'Admin logged out');
      console.log(`📊 Auth initialization complete - loading will set to false`);
      
      
      if (user) {
        // User is signed in - fetch or create admin data from Firestore
        try {
          const adminDocRef = doc(db, 'admin_users', user.uid);
          let adminDoc = await getDoc(adminDocRef);
          
          // If admin document doesn't exist, create it automatically
          if (!adminDoc.exists()) {
            console.warn('⚠️ Admin document not found during auth state check, creating one automatically...');
            const newAdminData = {
              fullName: user.email.split('@')[0],
              email: user.email,
              phone: '',
              role: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            try {
              await setDoc(adminDocRef, newAdminData);
              console.log('✅ Admin document created automatically');
              
              // Fetch the newly created document
              adminDoc = await getDoc(adminDocRef);
            } catch (createError) {
              console.error('⚠️ Error creating admin document:', createError);
              // Even if creation fails, continue to allow login
              const adminData = {
                uid: user.uid,
                email: user.email,
                fullName: user.email.split('@')[0],
                role: 'admin'
              };
              setAdmin(adminData);
              setFirebaseUser(user);
              setLoading(false);
              return;
            }
          }
          
          if (adminDoc.exists()) {
            const adminData = {
              uid: user.uid,
              email: user.email,
              ...adminDoc.data()
            };
            setAdmin(adminData);
            setFirebaseUser(user);
            console.log('✅ Admin data loaded from Firestore');
          } else {
            console.warn('⚠️ Admin document still not found after creation attempt');
            setAdmin(null);
            setFirebaseUser(null);
          }
        } catch (error) {
          console.error('❌ Error fetching/creating admin data:', error);
          // Even if Firestore fails, allow basic authentication
          if (error.code === 'permission-denied') {
            console.warn('⚠️ Permission denied - allowing login anyway');
            const adminData = {
              uid: user.uid,
              email: user.email,
              fullName: user.email.split('@')[0],
              role: 'admin'
            };
            setAdmin(adminData);
            setFirebaseUser(user);
          } else {
            setAdmin(null);
            setFirebaseUser(null);
          }
        }
      } else {
        // User is signed out
        setAdmin(null);
        setFirebaseUser(null);
      }
      
      // ✅ CRITICAL: Set loading=false AFTER Firebase finishes checking session
      // This ensures components don't make API calls before auth is ready
      setLoading(false);
      setAuthInitialized(true);
      console.log('✅ Firebase auth check complete - loading state now false');
    });

    return () => {
      console.log('🧹 Cleaning up Firebase auth listener');
      unsubscribe();
    };
  }, [auth, db]);

  /**
   * Login admin using Firebase Authentication
   */
  const login = async (email, password) => {
    try {
      console.log('🔐 Logging in admin via Firebase...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch or create admin data in Firestore
      const adminDocRef = doc(db, 'admin_users', user.uid);
      let adminDoc = await getDoc(adminDocRef);
      
      // If admin document doesn't exist, create it automatically
      if (!adminDoc.exists()) {
        console.warn('⚠️ Admin document not found, creating one automatically...');
        const newAdminData = {
          fullName: email.split('@')[0],  // Use email prefix as default name
          email: user.email,
          phone: '',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(adminDocRef, newAdminData);
        console.log('✅ Admin document created automatically');
        
        // Fetch the newly created document
        adminDoc = await getDoc(adminDocRef);
      }
      
      const adminData = {
        uid: user.uid,
        email: user.email,
        ...adminDoc.data()
      };
      
      setAdmin(adminData);
      setFirebaseUser(user);
      
      console.log('✅ Admin logged in successfully');
      return { success: true, admin: adminData };
    } catch (error) {
      console.error('❌ Login error:', error);
      let message = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
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
      console.log('� Creating admin account via Firebase...');
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store admin data in Firestore
      const adminData = {
        fullName,
        email,
        phone,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const adminDocRef = doc(db, 'admin_users', user.uid);
      await setDoc(adminDocRef, adminData);
      
      console.log('✅ Admin account created successfully');
      return { success: true, uid: user.uid };
    } catch (error) {
      console.error('❌ Signup error:', error);
      let message = 'Signup failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email already registered';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 8 characters.';
      }
      
      return { success: false, error: message };
    }
  };

  /**
   * Logout admin - Firebase sign out
   */
  const logout = async (reason = 'manual') => {
    try {
      console.log(`🚪 Logging out admin (reason: ${reason})...`);
      
      await firebaseSignOut(auth);
      
      setAdmin(null);
      setFirebaseUser(null);
      
      console.log('✅ Admin logout complete');
      router.push('/admin/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout even if there's an error
      setAdmin(null);
      setFirebaseUser(null);
      router.push('/admin/login');
    }
  };

  /**
   * Check if admin is authenticated
   */
  const isAuthenticated = () => {
    return !!admin && !!firebaseUser;
  };

  /**
   * Get current admin Firebase token
   */
  const getAdminToken = async () => {
    if (firebaseUser) {
      try {
        return await firebaseUser.getIdToken();
      } catch (error) {
        console.error('❌ Error getting token:', error);
        return null;
      }
    }
    return null;
  };

  /**
   * Update admin profile in Firestore
   */
  const updateAdminProfile = async (newAdminData) => {
    if (!admin || !firebaseUser) {
      console.error('❌ No admin logged in');
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const adminDocRef = doc(db, 'admin_users', firebaseUser.uid);
      const updatedData = {
        ...newAdminData,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(adminDocRef, updatedData, { merge: true });
      
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
    firebaseUser,
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
