'use client'

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { listenToPendingSubmissions, getPendingSubmissions } from '../services/supabaseService';
import { authenticatedFetch as fetchWithFirebaseToken } from '../utils/supabaseTokenHelper';

function InsuranceApplicationsTab() {
  const [activeTab, setActiveTab] = useState('firestore-pending'); // Changed default to show Firestore pending
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch pending submissions (server-side when adminToken exists, otherwise client listener)
  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const docs = await getPendingSubmissions('insurance');
          const formatted = (docs || []).map(sub => ({
            _id: sub.id,
            firestoreId: sub.id,
            fullName: sub.formData?.fullName || sub.fullName || 'N/A',
            email: sub.formData?.email || 'N/A',
            phoneNumber: sub.formData?.phone || sub.formData?.phone || 'N/A',
            insuranceType: sub.formData?.insuranceType || 'N/A',
            status: sub.status,
            createdAt: sub.createdAt,
            source: 'firestore',
            ...sub.formData
          }));
          setInsurances(formatted);
        } else {
          setLoading(true);
          setError('');
          const unsubscribe = listenToPendingSubmissions((submissions) => {
            const formattedInsurances = submissions
              .map(sub => ({
                _id: sub.id,
                firestoreId: sub.id,
                fullName: sub.formData.fullName || 'N/A',
                email: sub.formData.email || 'N/A',
                phoneNumber: sub.formData.phoneNumber || 'N/A',
                insuranceType: sub.formData.insuranceType || 'N/A',
                status: sub.status,
                createdAt: sub.createdAt,
                source: 'firestore',
                ...sub.formData
              }));

            setInsurances(formattedInsurances);
            setLoading(false);
          }, 'insurance');

          return () => unsubscribe();
        }
      } catch (err) {
        console.error('Error fetching pending insurances:', err);
        setError('Failed to load pending insurances');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'firestore-pending') fetchPending();
    else fetchInsurances();
  }, [activeTab, page, statusFilter, refreshTrigger]);

  const fetchInsurances = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = activeTab === 'admin-created'
        ? '/api/insurance/filter/admin-created'
        : '/api/insurance/filter/user-created';

      let url = `https://loanzaar-react-base.onrender.com${endpoint}?page=${page}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setInsurances(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setError(data.message || 'Failed to fetch insurances');
      }
    } catch (err) {
      console.error('Error fetching insurances:', err);
      setError('Failed to fetch insurance applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (insuranceId, newStatus, isFirestore = false) => {
    try {
      const token = localStorage.getItem('adminToken');

      if (isFirestore) {
        // Firestore submissions: Call verification API
        if (newStatus === 'Approved') {
          // Approve: migrate to MongoDB
          const response = await fetch(`https://loanzaar-react-base.onrender.com/api/verify/approve-insurance/${insuranceId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminNotes: '' })
          });

          const data = await response.json();
          if (data.success) {
            alert(`✅ Insurance approved and migrated successfully!`);
            // Trigger listener refresh
            setRefreshTrigger(prev => prev + 1);
          } else {
            alert(`❌ Failed to approve insurance: ${data.message}`);
            setError(data.message || 'Failed to approve insurance');
          }
        } else if (newStatus === 'Rejected') {
          // Reject: keep in Firestore, update status
          const response = await fetch(`https://loanzaar-react-base.onrender.com/api/verify/reject-insurance/${insuranceId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rejectionReason: 'Admin rejected' })
          });

          const data = await response.json();
          if (data.success) {
            alert(`✅ Insurance rejected successfully!`);
            // Trigger listener refresh - give Firestore a moment to update
            setTimeout(() => setRefreshTrigger(prev => prev + 1), 500);
          } else {
            alert(`❌ Failed to reject insurance: ${data.message}`);
            setError(data.message || 'Failed to reject insurance');
          }
        } else if (newStatus === 'Processing') {
          // Processing: just update status in Firestore (no migration)
          const response = await fetch(`https://loanzaar-react-base.onrender.com/api/verify/update-status/${insuranceId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'processing' })
          });

          const data = await response.json();
          if (data.success) {
            alert(`✅ Status updated to Processing!`);
            // Trigger listener refresh
            setTimeout(() => setRefreshTrigger(prev => prev + 1), 500);
          } else {
            alert(`❌ Failed to update status: ${data.message}`);
            setError(data.message || 'Failed to update status');
          }
        } else if (newStatus === 'Pending') {
          // Pending: reset to pending
          const response = await fetch(`https://loanzaar-react-base.onrender.com/api/verify/update-status/${insuranceId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'pending' })
          });

          const data = await response.json();
          if (data.success) {
            alert(`✅ Status updated to Pending!`);
            // Trigger listener refresh
            setTimeout(() => setRefreshTrigger(prev => prev + 1), 500);
          } else {
            alert(`❌ Failed to update status: ${data.message}`);
            setError(data.message || 'Failed to update status');
          }
        }
      } else {
        // MongoDB insurances: Update via PATCH
        const response = await fetch(`https://loanzaar-react-base.onrender.com/api/insurance/${insuranceId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();
        if (data.success) {
          setInsurances(insurances.map(insurance =>
            insurance._id === insuranceId ? { ...insurance, status: newStatus } : insurance
          ));
          alert(`✅ Status updated successfully!`);
        } else {
          alert(`❌ Failed to update status: ${data.message}`);
          setError(data.message || 'Failed to update status');
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(`❌ Error: ${err.message}`);
      setError('Failed to update insurance status');
    }
  };

  const filteredInsurances = insurances.filter(insurance => {
    const matchesSearch = 
      insurance.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insurance.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || insurance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'Approved':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Insurance Applications</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('firestore-pending'); setPage(1); }}
          className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'firestore-pending'
              ? 'text-rose-600 border-b-2 border-rose-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          ⏱️ Pending (Real-time)
        </button>
        <button
          onClick={() => { setActiveTab('admin-created'); setPage(1); }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'admin-created'
              ? 'text-rose-600 border-b-2 border-rose-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Admin-Created
        </button>
        <button
          onClick={() => { setActiveTab('user-created'); setPage(1); }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'user-created'
              ? 'text-rose-600 border-b-2 border-rose-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          User-Created
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex gap-2">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading applications...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <>
          {filteredInsurances.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={40} className="mx-auto text-slate-400 mb-2" />
              <p className="text-slate-600">No insurance applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">App ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">User Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Insurance Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Coverage Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInsurances.map((insurance) => (
                    <tr key={insurance._id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {insurance._id?.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{insurance.fullName}</p>
                          <p className="text-xs text-slate-600">{insurance.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                          {insurance.insuranceType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-semibold">
                        {insurance.coverageAmount || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {insurance.source === 'firestore' ? (
                          // Firestore submissions: Show dropdown status selector
                          <select
                            value={insurance.status?.charAt(0).toUpperCase() + insurance.status?.slice(1) || 'Pending'}
                            onChange={(e) => handleStatusChange(insurance.firestoreId, e.target.value, true)}
                            className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        ) : (
                          // MongoDB insurances: Show status dropdown
                          <select
                            value={insurance.status || 'Pending'}
                            onChange={(e) => handleStatusChange(insurance._id, e.target.value, false)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 ${getStatusColor(insurance.status)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {formatDate(insurance.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-rose-600 hover:text-rose-800 hover:underline text-xs font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InsuranceApplicationsTab;
