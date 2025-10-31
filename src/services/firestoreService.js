// Firestore Service for Frontend
// Handles form submissions to Firebase Firestore
// Public forms (loan, insurance, contact) write to separate collections: admin_loans, admin_insurance, admin_messages
// Authenticated submissions (chat, ticket) use data_tmp collection

import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import app from '../config/firebase';
import { getAuth } from 'firebase/auth';

const db = getFirestore(app);
const auth = getAuth(app);

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
    const user = auth.currentUser;
    const isPublicWrite = publicWriteTypes.includes(type);
    const isUserAuth = userAuthTypes.includes(type);

    // If this is a user authenticated type, require authenticated user
    if (isUserAuth && !user) {
      throw new Error('User not authenticated. Please login first.');
    }

    const collectionName = collectionMap[type] || 'loan_applications';
    
    const docData = {
      type,
      userId: user ? user.uid : null,
      formData,
      status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log(`📤 Submitting ${type} to collection '${collectionName}'...`);
    const docRef = await addDoc(collection(db, collectionName), docData);
    console.log(`✅ ${type} submitted successfully to ${collectionName}:`, docRef.id);
    return docRef.id;
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
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    let submissions = [];
    
    // Fetch from loan_applications if type is null or 'loan'
    if (!type || type === 'loan') {
      const loanRef = collection(db, 'loan_applications');
      const loanQuery = query(
        loanRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const loanSnapshot = await getDocs(loanQuery);
      loanSnapshot.forEach(doc => {
        submissions.push({
          id: doc.id,
          ...doc.data(),
          applicationType: 'loan'
        });
      });
    }
    
    // Fetch from insurance_applications if type is null or 'insurance'
    if (!type || type === 'insurance') {
      const insuranceRef = collection(db, 'insurance_applications');
      const insuranceQuery = query(
        insuranceRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const insuranceSnapshot = await getDocs(insuranceQuery);
      insuranceSnapshot.forEach(doc => {
        submissions.push({
          id: doc.id,
          ...doc.data(),
          applicationType: 'insurance'
        });
      });
    }
    
    // Sort by createdAt descending (newest first)
    submissions.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
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

    const collectionName = collectionMap[type] || 'data_tmp';
    const dataRef = collection(db, collectionName);
    
    // Note: Removed orderBy to avoid composite index requirement
    // Sorting will be done client-side after fetching
    const q = query(
      dataRef,
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    const submissions = [];

    snapshot.forEach(doc => {
      submissions.push({ id: doc.id, ...doc.data() });
    });

    // Sort client-side by createdAt descending
    submissions.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || a.createdAt || 0;
      const timeB = b.createdAt?.toMillis?.() || b.createdAt || 0;
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
  let user = auth.currentUser;
  const finalUserId = userId || user?.uid;
  
  if (!finalUserId) {
    console.error('❌ User not authenticated - cannot listen to submissions');
    return () => {};
  }
  
  const unsubscribers = [];
  
  // Listen to loan_applications if type is null or 'loan'
  if (!type || type === 'loan') {
    const loanRef = collection(db, 'loan_applications');
    const loanQuery = query(
      loanRef,
      where('userId', '==', finalUserId),
      orderBy('createdAt', 'desc')
    );
    
    const loanUnsubscribe = onSnapshot(loanQuery, (snapshot) => {
      const allSubmissions = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        allSubmissions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          applicationType: 'loan',
          source: 'firestore'
        });
      });
      
      // If we're also listening to insurance, merge results
      if (!type || type === 'insurance') {
        // Callback will be triggered again by insurance listener
      } else {
        callback(allSubmissions);
      }
    }, (error) => {
      console.error('❌ Error listening to loan submissions:', error);
    });
    
    unsubscribers.push(loanUnsubscribe);
  }
  
  // Listen to insurance_applications if type is null or 'insurance'
  if (!type || type === 'insurance') {
    const insuranceRef = collection(db, 'insurance_applications');
    const insuranceQuery = query(
      insuranceRef,
      where('userId', '==', finalUserId),
      orderBy('createdAt', 'desc')
    );
    
    const insuranceUnsubscribe = onSnapshot(insuranceQuery, (snapshot) => {
      const allSubmissions = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        allSubmissions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          applicationType: 'insurance',
          source: 'firestore'
        });
      });
      
      // If listening to both, merge and sort
      if (!type) {
        // Fetch current loan apps to merge
        getUserSubmissions().then(merged => {
          callback(merged);
        }).catch(err => {
          console.error('Error merging submissions:', err);
          callback(allSubmissions);
        });
      } else {
        callback(allSubmissions);
      }
    }, (error) => {
      console.error('❌ Error listening to insurance submissions:', error);
    });
    
    unsubscribers.push(insuranceUnsubscribe);
  }
  
  console.log('🔔 Listening for real-time submission updates...');
  
  // Return combined unsubscribe function
  return () => {
    unsubscribers.forEach(unsub => unsub());
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
  // Map type to collection name
  const collectionMap = {
    loan: 'admin_loans',
    insurance: 'admin_insurance',
    contact: 'admin_messages'
  };

  const collectionName = collectionMap[type] || 'data_tmp';
  const dataRef = collection(db, collectionName);
  
  // Query for pending submissions
  const q = query(
    dataRef,
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  
  console.log(`🔔 Listening for real-time pending submissions in '${collectionName}'...`);
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const submissions = [];
    snapshot.forEach(doc => {
      const d = { id: doc.id, ...doc.data() };
      submissions.push(d);
    });
    
    console.log(`🔄 Pending submissions updated in '${collectionName}': ${submissions.length} items`);
    callback(submissions);
  }, (error) => {
    console.error(`❌ Error listening to pending submissions in '${collectionName}':`, error);
  });
  
  return unsubscribe;
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
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const docRef = await addDoc(collection(db, 'data_tmp'), {
      type: 'chat',
      userId: user.uid,
      formData: {
        threadId,
        message,
        senderType,
        read: false
      },
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`💬 Chat message sent: ${docRef.id}`);
    return docRef.id;
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
  const dataRef = collection(db, 'data_tmp');
  const q = query(
    dataRef,
    where('type', '==', 'chat'),
    where('formData.threadId', '==', threadId),
    orderBy('createdAt', 'asc')
  );
  
  console.log(`💬 Listening for messages in thread ${threadId}...`);
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`🔄 Messages updated: ${messages.length} in thread`);
    callback(messages);
  }, (error) => {
    console.error('❌ Error listening to chat messages:', error);
  });
  
  return unsubscribe;
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
    
    // Contact messages don't require authentication (public form)
    // Flatten the structure - don't nest in formData
    const user = getAuth().currentUser;
    
    const docData = {
      type: 'contact',
      status: 'pending',
      
      // Flatten all contact fields at root level
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      subject: contactData.subject,
      state: contactData.state,
      city: contactData.city,
      reason: contactData.reason,
      message: contactData.message,
      
      // Metadata
      userId: user ? user.uid : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const collectionRef = collection(db, 'admin_messages');
    const docRef = await addDoc(collectionRef, docData);
    
    console.log('✅ Contact message submitted:', docRef.id);

    return {
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      firestoreDocId: docRef.id,
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
  useFirestoreSubmissions
};
