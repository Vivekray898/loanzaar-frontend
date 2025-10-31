'use client'

import React from 'react';
import { AlertTriangle, Trash2, X, Loader } from 'lucide-react';

/**
 * DeleteConfirmation - Modal for confirming document deletion
 * 
 * Shows warning about data loss and requires explicit confirmation
 */

function DeleteConfirmation({ document, collectionName, onConfirm, onCancel, isLoading = false }) {
  if (!document) return null;

  // Get display name for the document
  const getDisplayName = () => {
    return document.email || document.name || document.title || document.id.substring(0, 8);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Delete Record</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-slate-700">
              Are you sure you want to delete this record from <strong>{collectionName}</strong>?
            </p>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 space-y-1">
              <p className="text-xs text-slate-600 font-medium">Record Details:</p>
              <p className="text-sm font-semibold text-slate-800 truncate">{getDisplayName()}</p>
              <p className="text-xs text-slate-600">ID: {document.id.substring(0, 20)}...</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800 font-medium">⚠️ This action cannot be undone</p>
            <p className="text-xs text-red-700 mt-1">The data will be permanently deleted from Firestore</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmation;
