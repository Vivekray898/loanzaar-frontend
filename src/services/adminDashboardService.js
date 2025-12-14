'use client'

import { supabase } from '../config/supabase';

/**
 * AdminDashboardService - Centralized Firestore operations for admin collections
 * 
 * All CRUD operations for admin dashboard with error handling
 */

class AdminDashboardService {
  constructor() {
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
      const { data, error } = await supabase
        .from(collectionName)
        .select('*');
      if (error) throw error;

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
    console.warn(`⚠️ Realtime subscription not implemented. Using poll as placeholder for ${collectionName}.`);
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.from(collectionName).select('*');
        if (error) throw error;
        callback(data || []);
      } catch (err) {
        console.error(`❌ Poll error for ${collectionName}:`, err);
        if (onError) onError(err);
      }
    }, 5000);
    this.unsubscribers[collectionName] = () => clearInterval(interval);
    return this.unsubscribers[collectionName];
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
      const dataToUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: 'admin'
      };

      const { error } = await supabase
        .from(collectionName)
        .update(dataToUpdate)
        .eq('id', docId);
      if (error) throw error;
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
      const { error } = await supabase
        .from(collectionName)
        .delete()
        .eq('id', docId);
      if (error) throw error;
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
      const { data, error } = await supabase
        .from(collectionName)
        .select('*')
        .eq(field, value);
      if (error) throw error;
      return (data || []).map(row => ({ id: row.id, ...row }));
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
