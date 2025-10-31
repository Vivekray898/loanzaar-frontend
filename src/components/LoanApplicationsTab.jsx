'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, AlertCircle } from 'lucide-react';
import { listenToPendingSubmissions } from '../services/firestoreService';
import { fetchWithFirebaseToken } from '../utils/firebaseTokenHelper';

function LoanApplicationsTab() {
  const [activeTab, setActiveTab] = useState('firestore-pending'); // Changed default to show Firestore pending
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Real-time / server-side pending applications
  useEffect(() => {
    const fetchPendingFromServer = async () => {
      setLoading(true);
      setError('');
      try {
        const url = `/verify/pending?type=loan`;
        const response = await fetchWithFirebaseToken(url);
        const data = await response.json();
          if (data.success) {
            console.debug('DEBUG: pending submissions from server:', Array.isArray(data.data) ? data.data.length : (data.loans ? data.loans.length : 0), data.data?.slice?.(0,3));
          // backend returns array of docs
          const formatted = (data.data || data.loans || []).map(sub => ({
            _id: sub.id,
            firestoreId: sub.id,
            fullName: sub.formData?.fullName || sub.fullName || 'N/A',
            email: sub.formData?.email || sub.email || 'N/A',
            phoneNumber: sub.formData?.phone || sub.formData?.phone || 'N/A',
            loanAmount: sub.formData?.loanAmount || sub.loanAmount || 0,
            loanType: sub.formData?.loanType || sub.loanType || 'N/A',
            status: sub.status,
            createdAt: sub.createdAt,
            source: 'firestore',
            ...sub.formData
          }));

          setLoans(formatted);
          console.debug('DEBUG: formatted pending loans set on UI count=', formatted.length, 'sample ids=', formatted.slice(0,3).map(f=>f._id));
        } else {
          // If backend returns not authorized or failure, fall back to client listener
          console.warn('Backend failed to return pending submissions, falling back to client listener:', data.message);
          setLoans([]);
        }
      } catch (err) {
        console.error('Error fetching pending submissions from server:', err);
        setError('Failed to load pending submissions');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'firestore-pending') {
      // Always fetch from server for authenticated admins
      fetchPendingFromServer();
    } else {
      // Fetch from MongoDB for other tabs
      fetchLoans();
    }

    // re-run when these change
  }, [activeTab, page, statusFilter, refreshTrigger]);

  const fetchLoans = async () => {
    setLoading(true);
    setError('');

    try {
      const endpoint = activeTab === 'admin-created'
        ? '/loans/filter/admin-created'
        : '/loans/filter/user-created';

      let url = `${endpoint}?page=${page}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetchWithFirebaseToken(url);

      const data = await response.json();
      if (data.success) {
        setLoans(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setError(data.message || 'Failed to fetch loans');
      }
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError('Failed to fetch loan applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (loanId, newStatus, isFirestore = false) => {
    try {
      if (isFirestore) {
        // Firestore submissions: Call verification API
        if (newStatus === 'Approved') {
          // Approve: migrate to MongoDB
          const response = await fetchWithFirebaseToken(
            `/verify/approve-loan/${loanId}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adminNotes: '' })
            }
          );

          const data = await response.json();
          if (data.success) {
            alert(`✅ Loan approved and migrated successfully!`);
            // Trigger listener refresh by changing refreshTrigger
            setRefreshTrigger(prev => prev + 1);
          } else {
            alert(`❌ Failed to approve loan: ${data.message}`);
            setError(data.message || 'Failed to approve loan');
          }
        } else if (newStatus === 'Rejected') {
          // Reject: keep in Firestore, update status
          const response = await fetchWithFirebaseToken(
            `/verify/reject-loan/${loanId}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ rejectionReason: 'Admin rejected' })
            }
          );

          const data = await response.json();
          if (data.success) {
            alert(`✅ Loan rejected successfully!`);
            // Trigger listener refresh - give Firestore a moment to update
            setTimeout(() => setRefreshTrigger(prev => prev + 1), 500);
          } else {
            alert(`❌ Failed to reject loan: ${data.message}`);
            setError(data.message || 'Failed to reject loan');
          }
        } else if (newStatus === 'Processing') {
          // Processing: just update status in Firestore (no migration)
          const response = await fetchWithFirebaseToken(
            `/verify/update-status/${loanId}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'processing' })
            }
          );

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
          const response = await fetchWithFirebaseToken(
            `/verify/update-status/${loanId}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'pending' })
            }
          );

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
        // MongoDB loans: Update via PATCH
        const response = await fetch(`https://loanzaar-react-base.onrender.com/api/loans/${loanId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();
        if (data.success) {
          // Update loan in local state
          setLoans(loans.map(loan => 
            loan._id === loanId ? { ...loan, status: newStatus } : loan
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
      setError('Failed to update loan status');
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || loan.status === statusFilter;
    
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
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Loan Applications</h2>

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

        <div className="flex gap-2">
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
          {filteredLoans.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={40} className="mx-auto text-slate-400 mb-2" />
              <p className="text-slate-600">No loan applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">App ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">User Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Loan Type</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr key={loan._id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {loan._id?.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{loan.fullName}</p>
                          <p className="text-xs text-slate-600">{loan.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-medium">
                          {loan.loanType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        ₹{(loan.loanAmount / 100000).toFixed(1)}L
                      </td>
                      <td className="px-4 py-3">
                        {loan.source === 'firestore' ? (
                          // Firestore submissions: Show dropdown status selector
                          <select
                            value={loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1) || 'Pending'}
                            onChange={(e) => handleStatusChange(loan.firestoreId, e.target.value, true)}
                            className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        ) : (
                          // MongoDB loans: Show status dropdown
                          <select
                            value={loan.status || 'Pending'}
                            onChange={(e) => handleStatusChange(loan._id, e.target.value, false)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 ${getStatusColor(loan.status)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {formatDate(loan.createdAt)}
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

export default LoanApplicationsTab;
