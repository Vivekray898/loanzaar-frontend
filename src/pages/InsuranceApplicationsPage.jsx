'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { Search, Shield, Eye, Trash2, RefreshCw } from 'lucide-react';
import { getPendingSubmissions } from '../services/firestoreService';
import { supabase } from '../config/supabase';

function InsuranceApplicationsPage() {
  const [insurance, setInsurance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInsurance, setSelectedInsurance] = useState(null);  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInsurance();
  }, []);

  const fetchInsurance = async () => {
    try {
      setLoading(true);
      // Fetch from Supabase table 'admin_insurance'
      const { data: rows, error } = await supabase
        .from('admin_insurance')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (rows || []).map(r => ({
        _id: r.id,
        firestoreId: r.id,
        fullName: r.form_data?.fullName || r.full_name || r.name || '',
        email: r.form_data?.email || r.email || '',
        phone: r.form_data?.phone || r.phone || '',
        insuranceType: r.form_data?.insuranceType || r.insurance_type || 'All Insurance',
        coverageAmount: r.form_data?.coverageAmount || r.coverage_amount || 0,
        status: r.status || 'Pending',
        createdAt: r.created_at || r.createdAt,
        source: 'supabase'
      }));
      setInsurance(mapped);
      setLoading(false);
      console.log(`✅ Loaded ${mapped.length} insurance from Supabase admin_insurance table`);
      return;
    } catch (err) {
      console.warn('Failed to fetch from Firestore, falling back to backend API:', err);
    }

    // Fallback to backend API if Firestore fails
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('https://loanzaar-react-base.onrender.com/api/insurance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setInsurance((data.data || []).map(ins => ({
          ...ins,
          source: 'mongodb'  // Mark as MongoDB document
        })));
      }
    } catch (error) {
      console.error('Error fetching insurance from backend:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (insuranceId, newStatus) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      const token = localStorage.getItem('adminToken');
      
      // Always use backend API for updates (whether source is Firestore or MongoDB)
      // Backend handles auth, validation, and coordinates with Firestore
      const response = await fetch(`https://loanzaar-react-base.onrender.com/api/insurance/${insuranceId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        setInsurance(insurance.map(ins => 
          ins._id === insuranceId ? { ...ins, status: newStatus } : ins
        ));
        setSuccessMessage(`Insurance status updated to ${newStatus}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to update status');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Failed to update insurance status');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleDelete = async (insuranceId) => {
    if (!window.confirm('Are you sure you want to delete this insurance application?')) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`https://loanzaar-react-base.onrender.com/api/insurance/${insuranceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setInsurance(insurance.filter(ins => ins._id !== insuranceId));
        setSuccessMessage('Insurance application deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to delete insurance');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error deleting insurance:', error);
      setErrorMessage('Failed to delete insurance application');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleView = (ins) => {
    setSelectedInsurance(ins);
  };

  // Filter and search logic
  const filteredInsurance = insurance.filter(ins => {
    const matchesSearch = 
      ins.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.phone?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'All' || ins.status === filterStatus;
    const matchesType = filterType === 'All' || ins.insuranceType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInsurance.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInsurance = filteredInsurance.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Meta title="Insurance Applications | Admin - Loanzaar" description="View and manage insurance applications submitted by users." />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Insurance Applications</h1>
          <p className="text-slate-600 mt-1">Manage and track all insurance inquiries</p>
        </div>
        <button
          onClick={fetchInsurance}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          ✓ {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          ✗ {errorMessage}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Insurance Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option>All</option>
              <option>Life Insurance</option>
              <option>Health Insurance</option>
              <option>General Insurance</option>
              <option>All Insurance</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
          <span>Total: <strong>{filteredInsurance.length}</strong></span>
          <span>•</span>
          <span>Showing: <strong>{paginatedInsurance.length}</strong> of <strong>{filteredInsurance.length}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : paginatedInsurance.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No insurance applications found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Insurance Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Coverage Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedInsurance.map((ins) => (
                    <tr key={ins._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{ins.fullName}</div>
                          <div className="text-sm text-slate-500">{ins.email}</div>
                          <div className="text-sm text-slate-500">{ins.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {ins.insuranceType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {ins.coverageAmount || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={ins.status}
                          onChange={(e) => handleStatusChange(ins._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ins.status)} cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500`}
                        >
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(ins.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(ins)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ins._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default InsuranceApplicationsPage;

