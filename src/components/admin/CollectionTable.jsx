'use client'

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Filter,
  X,
} from 'lucide-react';

/**
 * CollectionTable - Generic table component for displaying Firestore collection data
 * 
 * Features:
 * - Real-time data display
 * - Search functionality
 * - Status filtering
 * - Status badges with color coding
 * - Edit/Delete/View actions
 * - Responsive design
 * - Loading and empty states
 */

function CollectionTable({
  data = [],
  loading = false,
  collectionName = 'Documents',
  onEdit = null,
  onDelete = null,
  onView = null,
  visibleFields = [], // If empty, show all fields
  hideFields = ['id', 'updatedBy', 'createdBy', 'adminNotes'], // Always hide these
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Get unique statuses from data
  const statuses = useMemo(() => {
    const statusSet = new Set(data.map(item => item.status).filter(Boolean));
    return ['All', ...Array.from(statusSet)];
  }, [data]);

  // Determine visible columns
  const columns = useMemo(() => {
    if (data.length === 0) return [];

    let fields = visibleFields.length > 0 ? visibleFields : Object.keys(data[0]);
    fields = fields.filter(field => !hideFields.includes(field));
    return fields;
  }, [data, visibleFields, hideFields]);

  // Filter and search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        columns.some(col => {
          const value = item[col];
          return value && String(value).toLowerCase().includes(term);
        })
      );
    }

    // Sorting
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal === bVal) return 0;
        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, statusFilter, sortField, sortDirection, columns]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format cell value
  const formatValue = (value) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    
    // Handle Firestore timestamps
    if (value && typeof value === 'object' && value.type === 'firestore/timestamp/1.0') {
      const date = new Date(value.seconds * 1000);
      return date.toLocaleString();
    }
    
    // Handle objects and arrays
    if (typeof value === 'object') {
      // Check if it's a Firestore timestamp without type property
      if (value.seconds && value.nanoseconds !== undefined) {
        const date = new Date(value.seconds * 1000);
        return date.toLocaleString();
      }
      // For arrays, show count
      if (Array.isArray(value)) {
        return `[Array: ${value.length} items]`;
      }
      // For objects, show key count
      const objStr = JSON.stringify(value);
      return objStr.length > 100 ? objStr.substring(0, 100) + '...' : objStr;
    }
    
    if (typeof value === 'number') return value.toLocaleString();
    
    // For strings, limit to a reasonable length
    const strValue = String(value);
    return strValue.length > 100 ? strValue.substring(0, 100) + '...' : strValue;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const statusLower = String(status).toLowerCase();
    if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (statusLower.includes('approved') || statusLower.includes('success')) return 'bg-green-100 text-green-800 border-green-300';
    if (statusLower.includes('rejected') || statusLower.includes('failed')) return 'bg-red-100 text-red-800 border-red-300';
    if (statusLower.includes('draft')) return 'bg-gray-100 text-gray-800 border-gray-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-3 text-slate-600">Loading {collectionName}...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg border border-slate-200">
        <Eye className="w-12 h-12 text-slate-400 mb-3" />
        <p className="text-slate-600 font-medium">No {collectionName} yet</p>
        <p className="text-slate-500 text-sm mt-1">Data will appear here when available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Status' : status}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-600">
          {filteredData.length} of {data.length} records
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              {columns.map(field => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {field}
                    {sortField === field && (
                      sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr
                key={item.id}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-200 hover:bg-slate-100 transition-colors`}
              >
                {columns.map(field => (
                  <td key={`${item.id}-${field}`} className="px-4 py-3 text-sm text-slate-700">
                    {field === 'status' ? (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item[field])}`}>
                        {item[field]}
                      </span>
                    ) : (
                      <span className="line-clamp-2">{formatValue(item[field])}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-amber-600 hover:text-amber-800 p-1 hover:bg-amber-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No results */}
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No records match your search or filter</p>
        </div>
      )}
    </div>
  );
}

export default CollectionTable;
