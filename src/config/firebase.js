// Firebase Configuration and Initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase Configuration
 * 
 * All sensitive values are loaded from environment variables (process.env)
 * This prevents accidental exposure in version control while keeping the configuration flexible.
 * 
 * Environment variables used (with NEXT_PUBLIC_ prefix for client-side access):
 * - NEXT_PUBLIC_FIREBASE_API_KEY: Firebase API Key
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: Firebase Auth Domain
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID: Firebase Project ID
 * - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: Firebase Storage Bucket
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: Firebase Messaging Sender ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID: Firebase App ID
 * - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: Firebase Google Analytics Measurement ID (optional)
 * - NEXT_PUBLIC_FCM_VAPID_KEY: Firebase Cloud Messaging VAPID Key for push notifications
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Validate Firebase Configuration
 * Ensures all required environment variables are set
 */
const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

  if (missingFields.length > 0) {
    console.warn(
      '⚠️  Missing Firebase configuration values:',
      missingFields.join(', '),
      '\n📋 Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set correctly.'
    );
  }
};

// Validate configuration on initialization
validateFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// FCM Configuration
// VAPID Public Key - Get this from Firebase Console > Project Settings > Cloud Messaging
// This key enables web browsers to receive push notifications
export const FCM_VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;

// Export default app instance
export default app;