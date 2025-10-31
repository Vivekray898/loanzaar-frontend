'use client'

import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { isValidPhoneNumber } from '../../utils/phone';

/**
 * EditModal - Modal for editing a single Firestore document
 * 
 * Features:
 * - Dynamic form fields based on document structure
 * - Readonly fields (id, createdAt, etc.)
 * - Status dropdown with common values
 * - Form validation
 * - Loading state
 * - Cancel/Save actions
 */

function EditModal({ document, collectionName, onSave, onClose, isLoading = false }) {
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  // Initialize form data
  useEffect(() => {
    if (document) {
      setFormData({ ...document });
      setHasChanges(false);
      setErrors({});
    }
  }, [document]);

  // Fields that should not be editable
  const readonlyFields = ['id', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'];

  // Fields that should be treated as dropdown
  const dropdownFields = {
    status: ['Pending', 'Approved', 'Rejected', 'In Progress'],
    priority: ['Low', 'Medium', 'High', 'Urgent'],
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    Object.entries(formData).forEach(([field, value]) => {
      // Email validation
      if (field.toLowerCase().includes('email') && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field] = 'Invalid email address';
        }
      }

      // Phone validation (use libphonenumber-js)
      if (field.toLowerCase().includes('phone') && value) {
        if (!isValidPhoneNumber(value, 'IN')) {
          newErrors[field] = 'Invalid phone number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-800">
            Edit {collectionName}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {Object.entries(formData).map(([field, value]) => {
            const isReadonly = readonlyFields.includes(field);
            const isDropdown = dropdownFields[field];
            const fieldError = errors[field];

            return (
              <div key={field} className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                  {isReadonly && <span className="text-slate-400 text-xs ml-2">(readonly)</span>}
                </label>

                {isReadonly ? (
                  <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 text-sm">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                ) : isDropdown ? (
                  <select
                    value={value || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      fieldError
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-rose-500'
                    }`}
                  >
                    <option value="">Select {field}</option>
                    {isDropdown.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : typeof value === 'boolean' ? (
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleFieldChange(field, e.target.checked)}
                        disabled={isLoading}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-600">Enable</span>
                    </label>
                  </div>
                ) : typeof value === 'number' ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleFieldChange(field, parseFloat(e.target.value))}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      fieldError
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-rose-500'
                    }`}
                  />
                ) : (
                  <textarea
                    value={value || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    disabled={isLoading}
                    rows={value && String(value).length > 100 ? 4 : 2}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                      fieldError
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-rose-500'
                    }`}
                  />
                )}

                {fieldError && <p className="text-red-600 text-xs">{fieldError}</p>}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
