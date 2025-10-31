'use client'

import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import CollectionTable from './CollectionTable';
import EditModal from './EditModal';
import DeleteConfirmation from './DeleteConfirmation';
import ViewModal from './ViewModal';
import adminDashboardService from '../../services/adminDashboardService';
import { useToast } from '../../context/ToastContext';

/**
 * AdminCollectionDashboard - Main component for managing all Firestore collections
 * 
 * Features:
 * - Dynamic tabs for each collection
 * - Real-time data sync with onSnapshot
 * - Edit, Delete, View actions
 * - Status updates
 * - Comprehensive error handling
 * - Admin-only access (integrated with auth context)
 */

const COLLECTIONS = [
  { id: 'admin_insurance', label: 'Admin Insurance', icon: '📋' },
  { id: 'admin_loans', label: 'Admin Loans', icon: '💰' },
  { id: 'admin_messages', label: 'Admin Messages', icon: '💬' },
  { id: 'cibil_score', label: 'CIBIL Score', icon: '📊' },
  { id: 'other_data', label: 'Other Data', icon: '📁' },
  { id: 'insurance_applications', label: 'Insurance Applications', icon: '📄' },
  { id: 'loan_applications', label: 'Loan Applications', icon: '📑' },
];

function AdminCollectionDashboard() {
  const [activeTab, setActiveTab] = useState(COLLECTIONS[0].id);
  const [collectionData, setCollectionData] = useState({});
  const [loadingCollections, setLoadingCollections] = useState(
    new Set(COLLECTIONS.map(c => c.id))  // Initialize with all collections loading
  );
  const [errorCollections, setErrorCollections] = useState({});

  const [editingDocument, setEditingDocument] = useState(null);
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initError, setInitError] = useState(null);

  const toast = useToast();

  // Setup real-time listeners for all collections
  useEffect(() => {
    try {
      console.log('🔄 AdminCollectionDashboard: Setting up listeners for', COLLECTIONS.length, 'collections');
      
      COLLECTIONS.forEach(collection => {
        try {
          console.log(`⏳ Starting listener for: ${collection.id}`);
          adminDashboardService.subscribeToCollection(
            collection.id,
            (data) => {
              console.log(`✅ Got data for ${collection.id}:`, data.length, 'documents');
              setCollectionData(prev => ({
                ...prev,
                [collection.id]: data
              }));
              setLoadingCollections(prev => {
                const newSet = new Set(prev);
                newSet.delete(collection.id);
                return newSet;
              });
              setErrorCollections(prev => {
                const newErrors = { ...prev };
                delete newErrors[collection.id];
                return newErrors;
              });
            },
            (error) => {
              console.error(`❌ Error for ${collection.id}:`, error);
              setErrorCollections(prev => ({
                ...prev,
                [collection.id]: error.message
              }));
              setLoadingCollections(prev => {
                const newSet = new Set(prev);
                newSet.delete(collection.id);
                return newSet;
              });
            }
          );
        } catch (error) {
          console.error(`Error setting up listener for ${collection.id}:`, error);
          setInitError(error.message);
        }
      });
    } catch (error) {
      console.error('Error setting up collection listeners:', error);
      setInitError(error.message);
    }

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up listeners');
      adminDashboardService.unsubscribeAll();
    };
  }, []);

  // Handle edit
  const handleEdit = (document) => {
    setEditingDocument({ ...document, collectionId: activeTab });
  };

  // Handle save
  const handleSave = async (updatedData) => {
    if (!editingDocument) return;

    setIsProcessing(true);
    try {
      const { collectionId, id, ...dataToUpdate } = updatedData;
      await adminDashboardService.updateDocument(collectionId, id, dataToUpdate);
      toast.success('Document updated successfully!');
      setEditingDocument(null);
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (document) => {
    setDeletingDocument({ ...document, collectionId: activeTab });
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deletingDocument) return;

    setIsProcessing(true);
    try {
      await adminDashboardService.deleteDocument(deletingDocument.collectionId, deletingDocument.id);
      toast.success('Document deleted successfully!');
      setDeletingDocument(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle status update (quick action)
  const handleStatusUpdate = async (document, newStatus) => {
    setIsProcessing(true);
    try {
      await adminDashboardService.updateStatus(activeTab, document.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get current collection
  const currentCollection = COLLECTIONS.find(c => c.id === activeTab);
  const currentData = collectionData[activeTab] || [];
  const isLoading = loadingCollections.has(activeTab);
  const error = errorCollections[activeTab];

  console.log('📊 Current render:', { activeTab, currentData: currentData.length, isLoading, error });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
            <Database className="text-rose-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Collections Manager</h1>
        </div>
      </div>

      {/* Simple Status Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-sm">
          <strong>Loading Status:</strong> {loadingCollections.size === 0 ? '✅ All collections loaded' : `⏳ Loading ${loadingCollections.size} collections...`}
        </p>
        <p className="text-blue-800 text-xs mt-2">
          Collections: {Object.keys(collectionData).map(k => `${k}(${collectionData[k]?.length || 0})`).join(' | ')}
        </p>
      </div>

      {/* Debug Info */}
      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
        Active: {activeTab} | Data: {currentData.length} docs | Loading: {isLoading ? 'Yes' : 'No'} | Error: {error || 'None'}
      </div>

      {/* Init Error Alert */}
      {initError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-amber-800">Initialization Error</p>
            <p className="text-amber-700 text-sm mt-1">{initError}</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-red-800">Error loading collection</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Collection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {COLLECTIONS.map(collection => (
          <button
            key={collection.id}
            onClick={() => setActiveTab(collection.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === collection.id
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{collection.icon}</span>
            {collection.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Tab Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {currentCollection?.label}
          </h2>
          <button
            onClick={() => {
              setLoadingCollections(prev => new Set([...prev, activeTab]));
              adminDashboardService.unsubscribeFromCollection(activeTab);
              try {
                adminDashboardService.subscribeToCollection(
                  activeTab,
                  (data) => {
                    setCollectionData(prev => ({
                      ...prev,
                      [activeTab]: data
                    }));
                    setLoadingCollections(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(activeTab);
                      return newSet;
                    });
                  }
                );
              } catch (error) {
                console.error('Error refreshing:', error);
                setLoadingCollections(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(activeTab);
                  return newSet;
                });
              }
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Table */}
        <CollectionTable
          data={currentData}
          loading={isLoading}
          collectionName={currentCollection?.label || 'Collection'}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={(doc) => setViewingDocument({ ...doc, collectionId: activeTab })}
        />
      </div>

      {/* Modals */}
      <EditModal
        document={editingDocument}
        collectionName={currentCollection?.label || 'Document'}
        onSave={handleSave}
        onClose={() => setEditingDocument(null)}
        isLoading={isProcessing}
      />

      <DeleteConfirmation
        document={deletingDocument}
        collectionName={currentCollection?.label || 'Collection'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingDocument(null)}
        isLoading={isProcessing}
      />

      <ViewModal
        document={viewingDocument}
        collectionName={currentCollection?.label || 'Collection'}
        onClose={() => setViewingDocument(null)}
      />
    </div>
  );
}

export default AdminCollectionDashboard;
