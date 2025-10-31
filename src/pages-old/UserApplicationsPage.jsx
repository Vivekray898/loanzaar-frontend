'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { FileText, Search, Filter, AlertCircle } from 'lucide-react';
import { getUserSubmissions, listenToUserSubmissions } from '../services/firestoreService';
import { getAuth } from 'firebase/auth';
import { fetchWithFirebaseToken } from '../utils/firebaseTokenHelper';
import { useUserAuth } from '../context/UserAuthContext';

function UserApplicationsPage() {
  const pageMeta = { title: 'My Applications | Loanzaar', description: 'View and track your loan and insurance applications in real time.' };
  const { isAuthenticated, user: authUser } = useUserAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, loans, insurance, pending

  useEffect(() => {
    let unsubscribeFirestore = null;
    
    const setupRealTimeUpdates = async () => {
      const auth = getAuth();
      let user = auth.currentUser;
      
      // Fallback to UserAuthContext if Firebase auth not ready
      if (!user && isAuthenticated && authUser) {
        console.log('✅ Using UserAuthContext for authentication');
        user = authUser;
      }
      
      if (!user) {
        console.log('❌ User not authenticated');
        setLoading(false);
        return;
      }

      setLoading(true);

      // Set up real-time listener for Firestore submissions
      // Pass user ID to handle cases where Firebase auth isn't ready yet
      unsubscribeFirestore = listenToUserSubmissions(
        (firestoreSubmissions) => {
          updateApplications(firestoreSubmissions);
        },
        null,
        user.uid || authUser?.id  // User ID from Firebase or from UserAuthContext
      );

      // Initial fetch for MongoDB data
      await fetchMongoDBApplications();
    };

    setupRealTimeUpdates();

    // Cleanup function
    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [isAuthenticated, authUser]);

  const fetchMongoDBApplications = async () => {
    try {
      const auth = getAuth();
      let user = auth.currentUser;
      
      // Fallback to UserAuthContext if Firebase auth not ready
      if (!user && isAuthenticated && authUser) {
        user = authUser;
      }
      
      if (!user) {
        console.log('❌ User not authenticated with Firebase or UserAuthContext');
        return;
      }

      // Get fresh ID token from Firebase (if available) or use stored token
      let token = null;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
        console.log('🔑 Got fresh Firebase token for API calls');
      } else if (localStorage.getItem('userToken')) {
        token = localStorage.getItem('userToken');
        console.log('🔑 Using stored user token from localStorage');
      } else {
        console.log('❌ No token available');
        return;
      }

      // Get approved loans from MongoDB
      let mongoApps = [];
      try {
        const response = await fetchWithFirebaseToken('/user-dashboard/loans/my-applications');
        const data = await response.json();
        if (data.success && data.data) {
            mongoApps = (data.data.loans || []).map(loan => ({
              ...loan,
              type: 'Loan',
              amount: loan.loanAmount || loan.amount || 'N/A',
              source: 'mongodb'
            }));
        }
      } catch (err) {
        console.log('Error fetching MongoDB loans:', err.message);
      }

      // Get approved insurance from MongoDB
      try {
        const response = await fetchWithFirebaseToken('/user-dashboard/insurance/my-applications');
        const data = await response.json();
        if (data.success && data.data) {
          mongoApps = [...mongoApps, ...(data.data.insurances || []).map(ins => ({
            ...ins,
            type: 'Insurance',
            amount: ins.coverageAmount || ins.amount || 'N/A',
            source: 'mongodb'
          }))];
        }
      } catch (err) {
        console.log('Error fetching MongoDB insurance:', err.message);
      }

      // Update applications with MongoDB data
      setApplications(prevApps => {
        const firestoreApps = prevApps.filter(app => app.source === 'firestore');
        return [...firestoreApps, ...mongoApps];
      });
      
    } catch (error) {
      console.error('Error fetching MongoDB applications:', error);
    }
  };

  const updateApplications = async (firestoreSubmissions) => {
    const firestoreApps = firestoreSubmissions.map(sub => ({
      _id: sub.id,
      type: sub.type === 'loan' ? 'Loan' : sub.type === 'insurance' ? 'Insurance' : 'Support',
      loanType: sub.formData?.loanType || sub.formData?.insuranceType || 'N/A',
      amount: sub.formData?.loanAmount || sub.formData?.coverageAmount || 'N/A',
      fullName: sub.formData?.fullName || 'N/A',
      status: sub.status === 'pending' ? 'Pending Review' : sub.status,
      createdAt: sub.createdAt,
      source: 'firestore',
      ...sub.formData
    }));

    // When Firestore submissions change, also refresh MongoDB data
    // This handles the case where applications get approved and moved
    await fetchMongoDBApplications();

    setApplications(prevApps => {
      const mongoApps = prevApps.filter(app => app.source === 'mongodb');
      const allApps = [...firestoreApps, ...mongoApps];
      
      // Apply filters
      let filteredApps = allApps;
      
      if (filterType === 'loans') {
        filteredApps = filteredApps.filter(app => app.type === 'Loan');
      } else if (filterType === 'insurance') {
        filteredApps = filteredApps.filter(app => app.type === 'Insurance');
      } else if (filterType === 'pending') {
        filteredApps = filteredApps.filter(app => app.source === 'firestore');
      }

      if (filterStatus) {
        filteredApps = filteredApps.filter(app => 
          app.status?.toLowerCase().includes(filterStatus.toLowerCase())
        );
      }

      if (searchTerm) {
        filteredApps = filteredApps.filter(app =>
          app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.type?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return filteredApps;
    });
    
    setLoading(false);
  };

  // Remove the old fetchApplications function and useEffect that called it
  useEffect(() => {
    // This will trigger re-filtering when filters change
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      // Re-trigger the real-time update with current filters
      listenToUserSubmissions((firestoreSubmissions) => {
        updateApplications(firestoreSubmissions);
      });
    }
  }, [filterType, filterStatus, searchTerm]);

  const getStatusColor = (status) => {
    const colors = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending': 'bg-amber-100 text-amber-800',
      'Pending Review': 'bg-amber-100 text-amber-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const filteredApplications = applications.filter(app =>
    (app.loanType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Meta title={pageMeta.title} description={pageMeta.description} />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">My Applications</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="loans">Loans Only</option>
            <option value="insurance">Insurance Only</option>
            <option value="pending">Pending Review</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-6 text-slate-700 font-semibold">Type</th>
                  <th className="text-left py-4 px-6 text-slate-700 font-semibold">Name</th>
                  <th className="text-left py-4 px-6 text-slate-700 font-semibold">Amount</th>
                  <th className="text-left py-4 px-6 text-slate-700 font-semibold">Status</th>
                  <th className="text-left py-4 px-6 text-slate-700 font-semibold">Applied Date</th>
                  <th className="text-left py-4 px-6 text-slate-700 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-medium text-slate-800">{app.type}</td>
                    <td className="py-4 px-6 text-slate-800">{app.loanType || app.insuranceType || 'N/A'}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      ₹{app.amount ? (typeof app.amount === 'string' ? app.amount : app.amount.toLocaleString()) : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {
                        app.createdAt
                          ? (
                              app.createdAt.toDate
                                ? app.createdAt.toDate().toLocaleDateString()
                                : (app.createdAt instanceof Date
                                    ? app.createdAt.toLocaleDateString()
                                    : new Date(app.createdAt).toLocaleDateString())
                            )
                          : 'N/A'
                      }
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <span className={`px-2 py-1 rounded ${app.source === 'firestore' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {app.source === 'firestore' ? '⏳ Pending' : '✅ Approved'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No applications found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserApplicationsPage;

