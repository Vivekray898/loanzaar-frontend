/**
 * Collection Configuration for Admin Dashboard
 * 
 * This file defines all Firestore collections managed by the admin dashboard.
 * Easily extensible - just add new collections to the array.
 * 
 * Structure:
 * - id: Firestore collection name (must match exactly)
 * - label: Display name in UI
 * - icon: Emoji icon for tab
 * - visibleFields: Array of fields to show in table (optional - shows all if omitted)
 * - hideFields: Array of fields to hide from table (optional)
 * - readonlyFields: Fields that cannot be edited (auto-includes: id, createdAt, createdBy, updatedAt, updatedBy)
 * - dropdownFields: Object mapping field names to array of valid options
 * - description: Brief description of collection (optional)
 */

export const ADMIN_COLLECTIONS = [
  {
    id: 'admin_insurance',
    label: 'Admin Insurance',
    icon: '📋',
    description: 'Insurance inquiries from visitors',
    hideFields: ['__name__'],
    dropdownFields: {
      status: ['Pending', 'Approved', 'Rejected', 'Under Review'],
      priority: ['Low', 'Medium', 'High', 'Urgent']
    }
  },
  {
    id: 'admin_loans',
    label: 'Admin Loans',
    icon: '💰',
    description: 'Loan applications from visitors',
    hideFields: ['__name__'],
    dropdownFields: {
      status: ['Pending', 'Approved', 'Rejected', 'Under Review'],
      priority: ['Low', 'Medium', 'High', 'Urgent'],
      loanType: ['Personal', 'Home', 'Auto', 'Business']
    }
  },
  {
    id: 'admin_messages',
    label: 'Admin Messages',
    icon: '💬',
    description: 'Contact form messages from visitors',
    hideFields: ['__name__'],
    dropdownFields: {
      status: ['Pending', 'Read', 'Responded', 'Closed'],
      priority: ['Low', 'Medium', 'High', 'Urgent']
    }
  },
  {
    id: 'cibil_score',
    label: 'CIBIL Score',
    icon: '📊',
    description: 'CIBIL credit score data',
    hideFields: ['__name__'],
    dropdownFields: {
      status: ['Verified', 'Pending', 'Failed', 'Expired']
    }
  },
  {
    id: 'other_data',
    label: 'Other Data',
    icon: '📁',
    description: 'Miscellaneous form submissions',
    hideFields: ['__name__'],
    dropdownFields: {
      status: ['Pending', 'Processed', 'Archived']
    }
  },
  {
    id: 'insurance_applications',
    label: 'Insurance Applications',
    icon: '📄',
    description: 'Insurance applications from registered users',
    hideFields: ['__name__'],
    dropdownFields: {
      status: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
      priority: ['Low', 'Medium', 'High', 'Urgent']
    }
  },
  {
    id: 'loan_applications',
    label: 'Loan Applications',
    icon: '📑',
    description: 'Loan applications from registered users',
    hideFields: ['__name__'],
    dropdownFields: {
      status: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
      priority: ['Low', 'Medium', 'High', 'Urgent'],
      loanType: ['Personal', 'Home', 'Auto', 'Business']
    }
  }
];

/**
 * Helper functions for collection configuration
 */

/**
 * Get collection config by ID
 * @param {string} collectionId - Firestore collection ID
 * @returns {Object} Collection configuration
 */
export const getCollectionConfig = (collectionId) => {
  return ADMIN_COLLECTIONS.find(c => c.id === collectionId) || null;
};

/**
 * Get display label for collection
 * @param {string} collectionId - Firestore collection ID
 * @returns {string} Display label
 */
export const getCollectionLabel = (collectionId) => {
  const config = getCollectionConfig(collectionId);
  return config?.label || collectionId;
};

/**
 * Get dropdown options for a field in a collection
 * @param {string} collectionId - Firestore collection ID
 * @param {string} fieldName - Field name
 * @returns {Array} Array of valid options
 */
export const getFieldOptions = (collectionId, fieldName) => {
  const config = getCollectionConfig(collectionId);
  return config?.dropdownFields?.[fieldName] || [];
};

/**
 * Check if field should be hidden
 * @param {string} collectionId - Firestore collection ID
 * @param {string} fieldName - Field name
 * @returns {boolean} True if field should be hidden
 */
export const isFieldHidden = (collectionId, fieldName) => {
  const config = getCollectionConfig(collectionId);
  const hideFields = config?.hideFields || [];
  const systemHideFields = ['__name__'];
  
  return [...hideFields, ...systemHideFields].includes(fieldName);
};

export default ADMIN_COLLECTIONS;
