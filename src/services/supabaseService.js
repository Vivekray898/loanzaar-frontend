// Firestore Service for Frontend
// Handles form submissions to Firebase Firestore
// Public forms (loan, insurance, contact) write to separate collections: admin_loans, admin_insurance, admin_messages
// Authenticated submissions (chat, ticket) use data_tmp collection

import { supabase } from '../config/supabase';
import { getSupabaseToken } from '@/utils/supabaseTokenHelper';

// Client helper to resolve a profile id that represents the authenticated/OTP-verified
// profile for the current browser session. Preference order:
// 1) localStorage.lead_user_id (explicit from OTP flows)
// 2) server-verified profile for the authenticated Supabase user
export async function getClientProfileId() {
  if (typeof window === 'undefined') return undefined;
  try {
    const lead = localStorage.getItem('lead_user_id');
    if (lead) return lead;

    // If user has an active Supabase session, attempt to resolve profile id server-side
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return undefined;

    try {
      const res = await fetch(`/api/auth/profile/${encodeURIComponent(userId)}`);
      if (!res.ok) return undefined;
      const json = await res.json();
      if (json?.success && json?.data?.id) return json.data.id;
    } catch (e) {
      console.debug('getClientProfileId: failed to resolve server profile', e);
    }

    return undefined;
  } catch (e) {
    console.debug('getClientProfileId: unexpected error', e);
    return undefined;
  }
}


/**
 * Submit form data to Firestore
 * Public forms (loan, insurance, contact, creditCard) → admin_loans, admin_insurance, admin_messages, other_data
 * Authenticated user forms (userLoan, userInsurance) → loan_applications, insurance_applications
 * @param {string} type - 'loan', 'insurance', 'contact', 'creditCard', 'userLoan', 'userInsurance'
 * @param {Object} formData - Form submission data
 * @param {string} status - Optional status (default: 'pending')
 * @returns {Promise<string>} Document ID
 */
export const submitToFirestore = async (type, formData, status = 'pending') => {
  const publicWriteTypes = ['loan', 'insurance', 'contact', 'creditCard'];
  const userAuthTypes = ['userLoan', 'userInsurance'];
  
  // Map type to collection name
  const collectionMap = {
    loan: 'admin_loans',
    insurance: 'admin_insurance',
    contact: 'admin_messages',
    creditCard: 'other_data',
    userLoan: 'loan_applications',
    userInsurance: 'insurance_applications',
    // CIBIL score requests
    cibilScore: 'cibil_score',
  };

  try {
    const { data: { user: supaUser } } = await supabase.auth.getUser();
    const isPublicWrite = publicWriteTypes.includes(type);
    const isUserAuth = userAuthTypes.includes(type);

    // If this is a user authenticated type, require authenticated user
    if (isUserAuth && !supaUser) {
      throw new Error('User not authenticated. Please login first.');
    }

    const collectionName = collectionMap[type] || 'loan_applications';

    // Helper to get lead id from localStorage (set after OTP flows)
    const getLeadId = () => (typeof window !== 'undefined' ? (localStorage.getItem('lead_user_id') || undefined) : undefined);

    const rowData = {
      type,
      user_id: supaUser ? supaUser.id : null,
      form_data: formData,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };


    console.log(`📤 Submitting ${type} to table '${collectionName}'...`);

    // For public writes, route through a server API to use the service role key
    if (isPublicWrite) {
      // Normalize a basic application payload expected by /api/apply
      const payload = {
        type,
        fullName: formData.fullName || formData.name || formData.full_name || null,
        mobile: formData.mobile || formData.phone || formData.mobile_number || null,
        email: formData.email || null,
        city: formData.city || null,
        loanType: formData.loanType || formData.product_type || null,
        source: status || 'website',
        metadata: formData.metadata || formData || {},
        // Attach lead/profile id if available (prefer explicit client-determined id)
        profileId: formData.user_id || (await getClientProfileId()) || undefined
      };

      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        // Surface Turnstile verify details in dev to help debug mobile failures
        if (json?.verify) {
          const info = JSON.stringify(json.verify);
          throw new Error(json.error + ' — verify: ' + info);
        }
        throw new Error(json.error || 'Submission failed');
      }
      console.log(`✅ ${type} submitted successfully to ${collectionName}:`, json.id);
      return json.id;
    }

    // Fallback for authenticated writes (keep existing client-side behavior)
    const { data, error } = await supabase
      .from(collectionName)
      .insert([rowData])
      .select()
      .single();
    if (error) throw error;
    console.log(`✅ ${type} submitted successfully to ${collectionName}:`, data.id);
    return data.id;
  } catch (error) {
    console.error(`❌ Error submitting ${type}:`, error);
    // Translate permission/auth errors into friendly messages for the UI
    if (error?.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes('user not authenticated'))) {
      return Promise.reject(new Error('Submission failed: public submissions are temporarily disabled.'));
    }
    return Promise.reject(error);
  }
};

/**
 * Submit loan application to Firestore (for authenticated users in dashboard)
 * @param {Object} loanData - Loan form data
 * @returns {Promise<Object>} { success: true, docId, message }
 */
export const submitLoanApplication = async (loanData) => {
  try {
    // Public site loan forms should write to the public 'loan' type (admin_loans collection)
    // The prior implementation used 'userLoan' which requires an authenticated user and
    // caused public submissions to be rejected client-side. Use 'loan' for public submissions.
    const docId = await submitToFirestore('loan', loanData);
    return {
      success: true,
      docId,
      message: 'Loan application submitted successfully! You\'ll be notified once reviewed.'
    };
  } catch (error) {
    console.error('❌ Error submitting loan:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit loan application. Please try again.'
    };
  }
};

/**
 * Submit a public application record into the `applications` table.
 * Maps common personal loan form fields into the application's schema safely.
 * @param {Object} applicationData - { fullName, mobile, email?, city?, loanType, employmentType, monthlyIncome, pincode, source }
 * @returns {Promise<Object>} { success, docId, message }
 */
export const submitApplication = async (applicationData) => {
  try {
    // Proxy the application submission to the server route which uses the service role key
    // Invariant: if the client is authenticated (has a Supabase session), a profileId must be sent.
    // Client-side we prefer explicit applicationData.profileId, then resolve from localStorage or the server.
    const resolvedClientProfileId = await getClientProfileId();
    const bodyPayload = { ...applicationData, profileId: applicationData?.profileId || resolvedClientProfileId || undefined };

    // If user is signed-in with Supabase, include bearer token so server can detect authenticated requests
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Note: server will validate the presence and ownership of profileId for authenticated requests and
    // reject the request if it cannot be associated with a valid profile.
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('❌ Server rejected application:', json);
      return { success: false, message: json.error || 'Failed to submit application' };
    }
    return { success: true, docId: json.id || null, data: json.data };
  } catch (error) {
    console.error('❌ Error submitting application via server:', error);
    return { success: false, message: error.message || 'Failed to submit application' };
  }
};

/**
 * Submit insurance application to Firestore (for authenticated users in dashboard)
 * @param {Object} insuranceData - Insurance form data
 * @returns {Promise<Object>} { success: true, docId, message }
 */
export const submitInsuranceApplication = async (insuranceData) => {
  try {
    // Public insurance inquiries should write to the public 'insurance' type (admin_insurance collection)
    const docId = await submitToFirestore('insurance', insuranceData);
    return {
      success: true,
      docId,
      message: 'Insurance application submitted successfully! You\'ll be notified once reviewed.'
    };
  } catch (error) {
    console.error('❌ Error submitting insurance:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit insurance application. Please try again.'
    };
  }
};

/**
 * Submit credit card application to Firestore (other_data collection)
 * @param {Object} creditCardData - Credit card form data
 * @returns {Promise<Object>} { success: true, docId, message }
 */
export const submitCreditCardApplication = async (creditCardData) => {
  try {
    const docId = await submitToFirestore('creditCard', creditCardData);
    return {
      success: true,
      docId,
      message: 'Credit card application submitted successfully! You\'ll be notified once reviewed.'
    };
  } catch (error) {
    console.error('❌ Error submitting credit card application:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit credit card application. Please try again.'
    };
  }
};

/**
 * Submit support ticket to Firestore
 * @param {Object} ticketData - Ticket form data
 * @returns {Promise<Object>} { success: true, docId, message }
 */
export const submitSupportTicket = async (ticketData) => {
  try {
    const docId = await submitToFirestore('ticket', ticketData);
    return {
      success: true,
      docId,
      message: 'Support ticket submitted successfully! You\'ll be notified once reviewed.'
    };
  } catch (error) {
    console.error('❌ Error submitting ticket:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit support ticket. Please try again.'
    };
  }
};

/**
 * Get user's submissions from Firestore (both loan_applications and insurance_applications)
 * @param {string} type - Optional: filter by type ('loan' or 'insurance')
 * @returns {Promise<Array>} Array of submissions
 */
export const getUserSubmissions = async (type = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    let submissions = [];
    
    // Fetch from loan_applications if type is null or 'loan'
    if (!type || type === 'loan') {
      const { data: loans, error } = await supabase
        .from('loan_applications')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      (loans || []).forEach(row => {
        submissions.push({
          id: row.id,
          ...row,
          applicationType: 'loan'
        });
      });
    }
    
    // Fetch from insurance_applications if type is null or 'insurance'
    if (!type || type === 'insurance') {
      const { data: ins, error } = await supabase
        .from('insurance_applications')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      (ins || []).forEach(row => {
        submissions.push({
          id: row.id,
          ...row,
          applicationType: 'insurance'
        });
      });
    }
    
    // Sort by createdAt descending (newest first)
    submissions.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
    
    console.log(`📋 Found ${submissions.length} user submissions`);
    return submissions;
  } catch (error) {
    console.error('❌ Error fetching submissions:', error);
    throw error;
  }
};

/**
 * Get all pending submissions from the appropriate collection
 * - loan → admin_loans
 * - insurance → admin_insurance
 * - contact → admin_messages
 * - null → data_tmp (for tickets, etc.)
 * @param {string} type - Optional: filter by type
 * @returns {Promise<Array>} Array of pending submissions
 */
export const getPendingSubmissions = async (type = null) => {
  try {
    // Map type to collection name
    const collectionMap = {
      loan: 'admin_loans',
      insurance: 'admin_insurance',
      contact: 'admin_messages'
    };

    const tableName = collectionMap[type] || 'data_tmp';
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('status', 'pending');
    if (error) throw error;
    const submissions = (data || []).map(row => ({ id: row.id, ...row }));

    // Sort client-side by createdAt descending
    submissions.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime() || a.created_at || 0;
      const timeB = new Date(b.created_at).getTime() || b.created_at || 0;
      return timeB - timeA;
    });

    console.log(`📋 Found ${submissions.length} pending submissions in '${collectionName}'`);
    return submissions;
  } catch (error) {
    console.error('❌ Error fetching pending submissions:', error);
    throw error;
  }
};

/**
 * Listen to real-time updates for user's submissions (both loan and insurance applications)
 * @param {Function} callback - Callback function to handle updates
 * @param {string} type - Optional: filter by type ('loan' or 'insurance')
 * @param {string} userId - Optional: user ID (falls back to auth.currentUser.uid if not provided)
 * @returns {Function} Unsubscribe function
 */
export const listenToUserSubmissions = (callback, type = null, userId = null) => {
  const channel = supabase.channel('user_submissions_' + (userId || 'anon'));
  const filters = [];
  const uid = userId;

  // Listen to inserts/updates for loan_applications
  if (!type || type === 'loan') {
    filters.push({ schema: 'public', table: 'loan_applications', event: '*', filter: uid ? `or(user_id.eq.${uid},id.eq.${uid})` : undefined });
  }
  // Listen to inserts/updates for insurance_applications
  if (!type || type === 'insurance') {
    filters.push({ schema: 'public', table: 'insurance_applications', event: '*', filter: uid ? `or(user_id.eq.${uid},id.eq.${uid})` : undefined });
  }

  filters.forEach(f => {
    channel.on('postgres_changes', f, async () => {
      // Fetch fresh submissions and emit
      const data = await getUserSubmissions(type);
      callback(data);
    });
  });

  channel.subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Listen to real-time updates for pending submissions
 * Maps type to collection: loan→'admin_loans', insurance→'admin_insurance', contact→'admin_messages'
 * @param {Function} callback - Callback function to handle updates
 * @param {string} type - Type of submission: 'loan', 'insurance', 'contact', or null for data_tmp
 * @returns {Function} Unsubscribe function
 */
export const listenToPendingSubmissions = (callback, type = null) => {
  // Map type to table name
  const tableMap = {
    loan: 'admin_loans',
    insurance: 'admin_insurance',
    contact: 'admin_messages'
  };
  const tableName = tableMap[type] || 'data_tmp';

  const channel = supabase.channel('pending_' + tableName);
  channel.on('postgres_changes', { schema: 'public', table: tableName, event: '*' }, async () => {
    const data = await getPendingSubmissions(type);
    callback(data);
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
};

/**
 * Send chat message to Firestore
 * @param {string} threadId - Thread ID
 * @param {string} message - Message text
 * @param {string} senderType - 'user' or 'admin'
 * @returns {Promise<string>} Document ID
 */
export const sendChatMessage = async (threadId, message, senderType = 'user') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('data_tmp')
      .insert([{ 
        type: 'chat',
        user_id: user.id,
        form_data: { threadId, message, senderType, read: false },
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    console.log(`💬 Chat message sent: ${data.id}`);
    return data.id;
  } catch (error) {
    console.error('❌ Error sending chat message:', error);
    throw error;
  }
};

/**
 * Listen to real-time chat messages for a thread
 * @param {string} threadId - Thread ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const listenToChatMessages = (threadId, callback) => {
  console.warn('⚠️ listenToChatMessages: Supabase Realtime not yet implemented here. Returning no-op unsubscribe.');
  return () => {};
};

/**
 * Submit contact message to Firestore
 * Saves contact form with proper field structure (not nested)
 * @param {Object} contactData - Contact form data
 * @returns {Promise<Object>} Result with success and docId
 */
export const submitContactMessage = async (contactData) => {
  try {
    console.log('📧 Submitting contact message to Firestore...');
    console.log('📋 Contact data fields:', {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      subject: contactData.subject,
      state: contactData.state,
      city: contactData.city,
      reason: contactData.reason,
      message: contactData.message
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    const rowData = {
      type: 'contact',
      status: 'pending',
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      subject: contactData.subject,
      state: contactData.state,
      city: contactData.city,
      reason: contactData.reason,
      message: contactData.message,
      user_id: user ? user.id : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('admin_messages')
      .insert([rowData])
      .select()
      .single();
    if (error) throw error;

    console.log('✅ Contact message submitted:', data.id);

    return {
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      firestoreDocId: data.id,
      status: 'pending'
    };
  } catch (error) {
    console.error('❌ Error submitting contact message:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit message'
    };
  }
};

/**
 * React hook for Firestore submissions
 */
export const useFirestoreSubmissions = () => {
  return {
    submitLoan: submitLoanApplication,
    submitInsurance: submitInsuranceApplication,
    submitTicket: submitSupportTicket,
    submitContact: submitContactMessage,
    getUserSubmissions,
    listenToUserSubmissions,
    sendChatMessage,
    listenToChatMessages
  };
};

export default {
  submitToFirestore,
  submitLoanApplication,
  submitInsuranceApplication,
  submitSupportTicket,
  submitContactMessage,
  getUserSubmissions,
  getPendingSubmissions,
  listenToUserSubmissions,
  listenToPendingSubmissions,
  sendChatMessage,
  listenToChatMessages,
  useFirestoreSubmissions,
  // Convenience exports
  submitApplication,
  getClientProfileId
};
