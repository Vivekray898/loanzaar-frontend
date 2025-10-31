'use client'

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

/**
 * AdminDashboardService - Centralized Firestore operations for admin collections
 * 
 * All CRUD operations for admin dashboard with error handling
 */

class AdminDashboardService {
  constructor() {
    this.db = getFirestore();
    this.unsubscribers = {}; // Store listeners to clean up
  }

  /**
   * Get all documents from a collection (one-time read)
   * @param {string} collectionName - Firestore collection name
   * @returns {Promise<Array>} Array of documents with IDs
   */
  async getCollectionData(collectionName) {
    try {
      console.log(`📖 Fetching ${collectionName}...`);
      const ref = collection(this.db, collectionName);
      const snapshot = await getDocs(ref);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ Fetched ${data.length} documents from ${collectionName}`);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${collectionName}:`, error);
      throw new Error(`Failed to fetch ${collectionName}: ${error.message}`);
    }
  }

  /**
   * Listen to real-time changes in a collection (onSnapshot)
   * @param {string} collectionName - Firestore collection name
   * @param {Function} callback - Function to call with updated data
   * @param {Function} onError - Optional error callback
   * @returns {Function} Unsubscriber function to stop listening
   */
  subscribeToCollection(collectionName, callback, onError = null) {
    try {
      console.log(`🔔 Setting up real-time listener for ${collectionName}`);
      const ref = collection(this.db, collectionName);

      const unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log(`📡 Real-time update: ${collectionName} (${data.length} docs)`);
          callback(data);
        },
        (error) => {
          console.error(`❌ Listener error for ${collectionName}:`, error);
          console.error('  Error code:', error.code);
          console.error('  Error message:', error.message);
          if (onError) onError(error);
        }
      );

      // Store unsubscriber for cleanup
      this.unsubscribers[collectionName] = unsubscribe;
      return unsubscribe;
    } catch (error) {
      console.error(`❌ Error setting up listener for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Stop listening to a collection
   * @param {string} collectionName - Firestore collection name
   */
  unsubscribeFromCollection(collectionName) {
    if (this.unsubscribers[collectionName]) {
      console.log(`🧹 Unsubscribing from ${collectionName}`);
      this.unsubscribers[collectionName]();
      delete this.unsubscribers[collectionName];
    }
  }

  /**
   * Update a single document
   * @param {string} collectionName - Firestore collection name
   * @param {string} docId - Document ID
   * @param {Object} updates - Object with fields to update
   * @returns {Promise<void>}
   */
  async updateDocument(collectionName, docId, updates) {
    try {
      console.log(`✏️ Updating ${collectionName}/${docId}`, updates);
      const docRef = doc(this.db, collectionName, docId);
      
      // Add updatedAt timestamp
      const dataToUpdate = {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin' // Can be enhanced to include actual admin ID
      };

      await updateDoc(docRef, dataToUpdate);
      console.log(`✅ Document updated: ${collectionName}/${docId}`);
      return { success: true, message: 'Document updated successfully' };
    } catch (error) {
      console.error(`❌ Error updating ${collectionName}/${docId}:`, error);
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  /**
   * Update document status (common operation)
   * @param {string} collectionName - Firestore collection name
   * @param {string} docId - Document ID
   * @param {string} status - New status (e.g., 'Approved', 'Rejected', 'Pending')
   * @param {string} notes - Optional admin notes
   * @returns {Promise<Object>} Success response
   */
  async updateStatus(collectionName, docId, status, notes = '') {
    try {
      console.log(`📌 Updating status for ${collectionName}/${docId} to ${status}`);
      const updates = {
        status,
        statusUpdatedAt: new Date().toISOString()
      };

      if (notes) {
        updates.adminNotes = notes;
      }

      return await this.updateDocument(collectionName, docId, updates);
    } catch (error) {
      console.error(`❌ Error updating status:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param {string} collectionName - Firestore collection name
   * @param {string} docId - Document ID
   * @returns {Promise<Object>} Success response
   */
  async deleteDocument(collectionName, docId) {
    try {
      console.log(`🗑️ Deleting ${collectionName}/${docId}`);
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
      console.log(`✅ Document deleted: ${collectionName}/${docId}`);
      return { success: true, message: 'Document deleted successfully' };
    } catch (error) {
      console.error(`❌ Error deleting ${collectionName}/${docId}:`, error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Search documents in a collection by field
   * @param {string} collectionName - Firestore collection name
   * @param {string} field - Field to search in
   * @param {string} value - Search value
   * @returns {Promise<Array>} Matching documents
   */
  async searchDocuments(collectionName, field, value) {
    try {
      console.log(`🔍 Searching ${collectionName} where ${field} = ${value}`);
      const ref = collection(this.db, collectionName);
      const q = query(ref, where(field, '==', value));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`❌ Error searching ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   * @param {string} collectionName - Firestore collection name
   * @returns {Promise<Object>} Stats object with counts by status
   */
  async getCollectionStats(collectionName) {
    try {
      const data = await this.getCollectionData(collectionName);
      
      const stats = {
        total: data.length,
        byStatus: {}
      };

      data.forEach(doc => {
        const status = doc.status || 'Unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error(`❌ Error getting stats for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Batch update documents
   * @param {string} collectionName - Firestore collection name
   * @param {Array} docIds - Array of document IDs to update
   * @param {Object} updates - Common updates to apply to all
   * @returns {Promise<Object>} Results of batch update
   */
  async batchUpdateDocuments(collectionName, docIds, updates) {
    try {
      console.log(`🔄 Batch updating ${docIds.length} documents in ${collectionName}`);
      const results = [];

      for (const docId of docIds) {
        try {
          await this.updateDocument(collectionName, docId, updates);
          results.push({ docId, success: true });
        } catch (error) {
          results.push({ docId, success: false, error: error.message });
        }
      }

      return {
        total: docIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error(`❌ Error in batch update:`, error);
      throw error;
    }
  }

  /**
   * Clean up all listeners
   */
  unsubscribeAll() {
    console.log(`🧹 Cleaning up all listeners`);
    Object.keys(this.unsubscribers).forEach(collectionName => {
      this.unsubscribers[collectionName]();
      delete this.unsubscribers[collectionName];
    });
  }
}

// Export singleton instance
const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;
