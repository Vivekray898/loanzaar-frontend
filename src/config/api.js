/**
 * API Configuration for LoanZaar Frontend
 * Centralized API endpoint management
 * 
 * UPDATED: Now uses Firebase Firestore for temporary storage
 * Loans/Insurance/Contact submissions go to Firestore data_tmp collection
 * Admin approves → Backend migrates to MongoDB
 */

import { 
  submitLoanApplication as fireLoanSubmit,
  submitInsuranceApplication as fireInsuranceSubmit,
} from '../services/firestoreService';

// Base API URL - Change this in production
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://loanzaar-react-base.onrender.com/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Loan endpoints
  LOANS: `${API_BASE_URL}/loans`,
  LOAN_BY_ID: (id) => `${API_BASE_URL}/loans/${id}`,
  
  // Contact endpoint
  CONTACT: `${API_BASE_URL}/contact`,
  
  // User/Auth endpoints
  SIGNUP: `${API_BASE_URL}/users/signup`,
  SIGNIN: `${API_BASE_URL}/users/signin`,
  PROFILE: `${API_BASE_URL}/users/profile`,
  
  // Insurance endpoints
  INSURANCE: `${API_BASE_URL}/insurance`,
  INSURANCE_SUBMIT: `${API_BASE_URL}/insurance/submit`,
  INSURANCE_BY_ID: (id) => `${API_BASE_URL}/insurance/${id}`,
  
  // Ticket endpoints (Admin)
  TICKETS: `${API_BASE_URL}/admin/tickets`,
  TICKET_BY_ID: (id) => `${API_BASE_URL}/admin/tickets/${id}`,
};

/**
 * Submit loan application to Firestore (temporary storage)
 * Admin will review and approve before migrating to MongoDB
 * @param {Object} loanData - Loan form data
 * @returns {Promise} - API response with Firestore document ID
 */
export const submitLoanApplication = async (loanData) => {
  try {
    console.log('📤 Submitting loan to Firestore admin_loans...');
    
    // Submit to Firestore using the proper wrapper function
    const result = await fireLoanSubmit(loanData);
    
    console.log('✅ Loan submitted to Firestore:', result.docId);
    
    return { 
      success: true, 
      data: { 
        message: result.message,
        firestoreDocId: result.docId,
        status: 'pending'
      } 
    };
  } catch (error) {
    console.error('❌ Loan submission error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Submit contact form to Firestore (temporary storage)
 * Admin will review and respond before archiving
 * @param {Object} contactData - Contact form data
 * @returns {Promise} - API response with Firestore document ID
 */
export const submitContactForm = async (contactData) => {
  try {
    console.log('📤 Submitting contact message to server /api/contact');

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Contact submission failed');
    }

    console.log('✅ Contact form submitted via server API:', data);

    return { success: true, data };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Submit insurance inquiry to Firestore (temporary storage)
 * Admin will review and approve before migrating to MongoDB
 * @param {Object} insuranceData - Insurance form data
 * @returns {Promise} - API response with Firestore document ID
 */
export const submitInsuranceInquiry = async (insuranceData) => {
  try {
    console.log('📤 Submitting insurance to Firestore admin_insurance...');
    
    // Submit to Firestore using the proper wrapper function
    const result = await fireInsuranceSubmit(insuranceData);
    
    console.log('✅ Insurance submitted to Firestore:', result.docId);
    
    return { 
      success: true, 
      data: { 
        message: result.message,
        firestoreDocId: result.docId,
        status: 'pending'
      } 
    };
  } catch (error) {
    console.error('❌ Insurance submission error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * User signup
 * @param {Object} userData - User registration data
 * @returns {Promise} - API response with token
 */
export const signUp = async (userData) => {
  try {
    const response = await fetch(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('loanzaar_token', data.token);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * User signin
 * @param {Object} credentials - Email and password
 * @returns {Promise} - API response with token
 */
export const signIn = async (credentials) => {
  try {
    const response = await fetch(API_ENDPOINTS.SIGNIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signin failed');
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('loanzaar_token', data.token);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Signin error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user profile (requires authentication)
 * @returns {Promise} - User profile data
 */
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('loanzaar_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.PROFILE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get profile');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('loanzaar_token');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('loanzaar_token');
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  submitLoanApplication,
  submitContactForm,
  signUp,
  signIn,
  getUserProfile,
  logout,
  isAuthenticated,
};
