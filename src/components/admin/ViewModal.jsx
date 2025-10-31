'use client'

import React, { useState } from 'react';
import { X, Copy, Download, Eye, EyeOff } from 'lucide-react';

/**
 * ViewModal - Display detailed, formatted view of a Firestore document
 */
function ViewModal({ document, collectionName, onClose }) {
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  if (!document) return null;

  // Sensitive fields that should be hidden or truncated by default
  const sensitiveFields = ['captcha', 'captchaToken', 'otp', 'password', 'token', 'secret', 'apiKey', 'privateKey'];
  
  // Fields that should be hidden completely
  const hiddenFields = ['__v', 'createdBy', 'updatedBy'];

  const isSensitiveField = (key) => sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()));
  const isHiddenField = (key) => hiddenFields.includes(key);

  const formatTimestamp = (value) => {
    if (value && typeof value === 'object') {
      if (value.type === 'firestore/timestamp/1.0' || (value.seconds && value.nanoseconds !== undefined)) {
        const seconds = value.seconds || value._seconds;
        const date = new Date(seconds * 1000);
        return date.toLocaleString('en-IN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
      }
    }
    return value;
  };

  const formatCurrency = (value) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(value);
    }
    return value;
  };

  const formatValue = (value, key) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? '✓ Yes' : '✗ No';
    
    // Check if field is sensitive
    const isSensitive = isSensitiveField(key);
    if (isSensitive && !showSensitiveData) {
      return <span className="text-amber-600 font-medium">🔒 Hidden (Enable to view)</span>;
    }

    // Truncate sensitive data like captcha tokens
    if (isSensitive && typeof value === 'string' && value.length > 50) {
      return (
        <code className="bg-amber-50 px-2 py-1 rounded text-xs break-all border border-amber-200">
          {value.substring(0, 30)}...{value.substring(value.length - 20)}
        </code>
      );
    }
    
    // Handle timestamps
    if (value && typeof value === 'object' && (value.seconds || value.type === 'firestore/timestamp/1.0')) {
      return formatTimestamp(value);
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return '— (Empty array)';
      return (
        <div className="space-y-2">
          {value.map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200 text-sm">
              {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
            </div>
          ))}
        </div>
      );
    }
    
    // Handle nested objects - expand them as key-value pairs
    if (typeof value === 'object' && !Array.isArray(value)) {
      const entries = Object.entries(value);
      if (entries.length === 0) return '— (Empty object)';
      
      return (
        <div className="space-y-3 mt-2">
          {entries.map(([nestedKey, nestedValue]) => (
            <div key={nestedKey} className="bg-white border border-slate-200 rounded p-3">
              <div className="text-xs font-semibold text-slate-600 mb-1">
                {nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </div>
              <div className="text-slate-800 text-sm font-medium">
                {formatNestedValue(nestedValue, nestedKey)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'number') {
      // Check if it looks like a currency amount (large number or field name suggests currency)
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price') || key.toLowerCase().includes('salary') || key.toLowerCase().includes('turnover') || key.toLowerCase().includes('income')) {
        return formatCurrency(value);
      }
      return value.toLocaleString('en-IN');
    }

    // Format ISO dates in strings
    const strValue = String(value);
    if (strValue.match(/^\d{4}-\d{2}-\d{2}T/)) {
      try {
        const date = new Date(strValue);
        return date.toLocaleString('en-IN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit'
        });
      } catch (e) {
        return strValue;
      }
    }

    return strValue.length > 200 ? strValue.substring(0, 200) + '...' : strValue;
  };

  // Format nested values within objects
  const formatNestedValue = (value, key) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? '✓ Yes' : '✗ No';
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price') || key.toLowerCase().includes('salary') || key.toLowerCase().includes('income') || key.toLowerCase().includes('coverage')) {
        return formatCurrency(value);
      }
      return value.toLocaleString('en-IN');
    }
    if (typeof value === 'object') return JSON.stringify(value);
    
    const strValue = String(value);
    if (strValue.match(/^\d{4}-\d{2}-\d{2}T/)) {
      try {
        const date = new Date(strValue);
        return date.toLocaleString('en-IN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit'
        });
      } catch (e) {
        return strValue;
      }
    }
    return strValue;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    alert('✓ Copied to clipboard!');
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(document, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${collectionName}-${document.id || 'document'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get categorized fields
  const getFieldCategory = (key) => {
    const lower = key.toLowerCase();
    if (lower.includes('status') || lower.includes('state')) return 'Status';
    if (lower.includes('date') || lower.includes('at') || lower.includes('time')) return 'Dates & Time';
    if (lower.includes('amount') || lower.includes('price') || lower.includes('salary') || lower.includes('turnover')) return 'Financial';
    if (lower.includes('phone') || lower.includes('email') || lower.includes('address') || lower.includes('city') || lower.includes('state')) return 'Contact Info';
    if (lower.includes('name') || lower.includes('full') || lower.includes('first') || lower.includes('last')) return 'Personal Info';
    if (lower.includes('pan') || lower.includes('aadhaar') || lower.includes('id') || lower.includes('number')) return 'Identity';
    if (lower.includes('captcha') || lower.includes('token') || lower.includes('otp') || lower.includes('password')) return 'Security';
    return 'Other';
  };

  // Group fields by category
  const groupedFields = {};
  Object.entries(document)
    .filter(([key]) => !isHiddenField(key))
    .forEach(([key, value]) => {
      // Special handling for formData - expand it
      if (key === 'formData' && typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value).forEach(([formKey, formValue]) => {
          const category = getFieldCategory(formKey);
          if (!groupedFields[category]) {
            groupedFields[category] = [];
          }
          groupedFields[category].push([formKey, formValue]);
        });
      } else {
        const category = getFieldCategory(key);
        if (!groupedFields[category]) {
          groupedFields[category] = [];
        }
        groupedFields[category].push([key, value]);
      }
    });

  // Category order
  const categoryOrder = ['Personal Info', 'Contact Info', 'Identity', 'Financial', 'Dates & Time', 'Status', 'Other', 'Security'];

  const getCategoryIcon = (category) => {
    const icons = {
      'Personal Info': '👤',
      'Contact Info': '📞',
      'Identity': '🆔',
      'Financial': '💰',
      'Dates & Time': '📅',
      'Status': '🔔',
      'Other': '📋',
      'Security': '🔒'
    };
    return icons[category] || '📌';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800">
              {collectionName} - Document Details
            </h2>
            <p className="text-sm text-slate-600 mt-1">ID: <code className="bg-slate-200 px-2 py-0.5 rounded">{document.id}</code></p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800 p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="sticky top-[80px] bg-white border-b border-slate-200 p-4 flex gap-2 flex-wrap">
          <button
            onClick={() => copyToClipboard(document)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <Copy size={16} />
            Copy JSON
          </button>
          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
          >
            {showSensitiveData ? <EyeOff size={16} /> : <Eye size={16} />}
            {showSensitiveData ? 'Hide Sensitive' : 'Show Sensitive'}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Categorized Fields */}
          {categoryOrder.map(category => {
            if (!groupedFields[category] || groupedFields[category].length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-200">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedFields[category].map(([key, value]) => (
                    <div key={key} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <div className="mt-2 text-slate-800 wrap-break-word text-sm">
                        {formatValue(value, key)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Raw JSON Section */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 mb-3">📋 Raw JSON Data</h3>
            <div className="bg-slate-900 text-slate-50 p-4 rounded font-mono text-xs overflow-auto max-h-64">
              <pre>{JSON.stringify(document, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 p-6 flex justify-between items-center">
          <p className="text-xs text-slate-600">
            {Object.keys(document).length} fields • Last updated: {document.updatedAt ? formatValue(document.updatedAt, 'updatedAt') : 'N/A'}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;
