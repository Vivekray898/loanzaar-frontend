/**
 * Firebase Compatibility Layer (Supabase-backed)
 * Temporary shim to keep existing Firebase-based code working while migrating
 * to Supabase and backend Prisma APIs.
 */

import { supabase, getSession } from './supabase';

// Wrap Supabase session into a Firebase-like user object
function wrapSessionUser(session) {
  if (!session || !session.user) return null;
  const { user, access_token, expires_at } = session;
  return {
    uid: user.id,
    email: user.email,
    // Return access token (used where getIdToken() was called)
    async getIdToken() {
      return access_token || '';
    },
    // Return token metadata (used by getIdTokenResult())
    async getIdTokenResult() {
      const expMs = (expires_at || 0) * 1000;
      return {
        token: access_token || '',
        expirationTime: new Date(expMs).toISOString(),
      };
    },
  };
}

// Mock auth object (Firebase-like)
export const auth = {
  currentUser: null,

  async getCurrentUser() {
    const { data } = await supabase.auth.getSession();
    const wrapped = wrapSessionUser(data?.session || null);
    this.currentUser = wrapped;
    return wrapped;
  },

  async signInWithEmailAndPassword(email, password) {
    // Email/password sign-in retired. Open SignIn modal to prompt OTP sign-in instead.
    try { const { open } = require('@/context/SignInModalContext').useSignInModal(); if(open) open(); } catch (e) { /* ignore */ }
    return { user: null, error: new Error('Email/password login retired. Use phone OTP.') };
  },

  async createUserWithEmailAndPassword(email, password) {
    // Email/password signup retired. Please use phone OTP flows to create accounts.
    return { user: null, error: new Error('Email/password signup retired. Use phone OTP.') };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this.currentUser = null;
  },

  onAuthStateChanged(callback) {
    // Prime with current session
    getSession().then(({ session }) => {
      const wrapped = wrapSessionUser(session || null);
      this.currentUser = wrapped;
      callback(wrapped);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const wrapped = wrapSessionUser(session || null);
      this.currentUser = wrapped;
      callback(wrapped);
    });

    return () => subscription.unsubscribe();
  },
};

// Standalone compatibility functions (mirror Firebase API signatures)
export const onAuthStateChanged = (authInstance, callback) => authInstance.onAuthStateChanged(callback);
export const signInWithEmailAndPassword = (authInstance, email, password) => authInstance.signInWithEmailAndPassword(email, password);
export const createUserWithEmailAndPassword = (authInstance, email, password) => authInstance.createUserWithEmailAndPassword(email, password);
export const signOut = (authInstance) => authInstance.signOut();
export const getAuth = () => auth;

// Minimal Firestore-like API backed by Supabase tables
export const db = {
  collection(collectionName) {
    return {
      doc(docId) {
        return {
          async get() {
            const { data } = await supabase.from(collectionName).select('*').eq('id', docId).single();
            return {
              exists: () => !!data,
              data: () => data,
              id: docId,
            };
          },
          async set(docData) {
            const { error } = await supabase.from(collectionName).upsert({ id: docId, ...docData });
            if (error) throw error;
          },
          async update(updates) {
            const { error } = await supabase.from(collectionName).update(updates).eq('id', docId);
            if (error) throw error;
          },
        };
      },
      async add(docData) {
        const { data, error } = await supabase.from(collectionName).insert(docData).select().single();
        if (error) throw error;
        return { id: data.id };
      },
    };
  },
};

// Utility helpers to match Firebase "doc/getDoc/setDoc" signatures
export const getFirestore = () => db;
export const doc = (dbInstance, collectionName, docId) => ({ _collection: collectionName, _id: docId });
export const getDoc = async (docRef) => {
  const { data } = await supabase.from(docRef._collection).select('*').eq('id', docRef._id).single();
  return { exists: () => !!data, data: () => data, id: docRef._id };
};
export const setDoc = async (docRef, docData, options = {}) => {
  const { error } = await supabase.from(docRef._collection).upsert({ id: docRef._id, ...docData }, { onConflict: 'id' });
  if (error) throw error;
};
// Additional Firestore-like helpers
export const collection = (dbInstance, name) => db.collection(name);
export const addDoc = async (collectionRef, docData) => collectionRef.add(docData);
export const updateDoc = async (docRef, updates) => {
  const { error } = await supabase.from(docRef._collection).update(updates).eq('id', docRef._id);
  if (error) throw error;
};
export const serverTimestamp = () => new Date().toISOString();
// Query builders
export const where = (field, operator, value) => ({ type: 'where', field, operator, value });
export const orderBy = (field, direction = 'asc') => ({ type: 'orderBy', field, direction });
export const query = (collectionRef, ...clauses) => ({ collection: collectionRef, clauses });
export const getDocs = async (queryRef) => {
  let q = supabase.from(queryRef.collection._collection).select('*');
  for (const c of queryRef.clauses) {
    switch (c.type) {
      case 'where':
        switch (c.operator) {
          case '==': q = q.eq(c.field, c.value); break;
          case '!=': q = q.neq(c.field, c.value); break;
          case '>': q = q.gt(c.field, c.value); break;
          case '>=': q = q.gte(c.field, c.value); break;
          case '<': q = q.lt(c.field, c.value); break;
          case '<=': q = q.lte(c.field, c.value); break;
          case 'in': q = q.in(c.field, c.value); break;
          default: break;
        }
        break;
      case 'orderBy':
        q = q.order(c.field, { ascending: c.direction !== 'desc' });
        break;
      default:
        break;
    }
  }
  const { data } = await q;
  return { docs: (data || []).map(d => ({ id: d.id, data: () => d })) };
};
export const onSnapshot = async (queryRef, callback) => {
  const res = await getDocs(queryRef);
  callback(res);
  return () => {};
};

// Export app alias and VAPID key placeholder for backward compatibility
export const app = supabase;
export const FCM_VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY || '';

export default supabase;


