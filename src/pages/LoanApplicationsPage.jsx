'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { Search, Filter, Eye, Edit2, Trash2, Download, RefreshCw, FileText, CreditCard } from 'lucide-react';
import { getPendingSubmissions } from '../services/supabaseService';
import { supabase } from '../config/supabase';
import { authenticatedFetch as fetchWithFirebaseToken } from '../utils/supabaseTokenHelper';

function LoanApplicationsPage() {
  const [loans, setLoans] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCreditCardPage, setCurrentCreditCardPage] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLoansAndCreditCards();
  }, []);

  const fetchLoansAndCreditCards = async () => {
    try {
      setLoading(true);
      
      // Fetch both admin_loans and other_data collections in parallel
      await Promise.all([
        fetchLoans(),
        fetchCreditCards()
      ]);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setErrorMessage('Failed to load data');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      // Fetch from Supabase table 'admin_loans'
      const { data: rows, error } = await supabase
        .from('admin_loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (rows || []).map(r => ({
        _id: r.id,
        firestoreId: r.id,
        fullName: r.form_data?.fullName || r.full_name || r.name || '',
        email: r.form_data?.email || r.email || '',
        phone: r.form_data?.phone || r.phone || '',
        loanType: r.form_data?.loanType || r.loan_type || 'Personal',
        loanAmount: r.form_data?.loanAmount || r.loan_amount || 0,
        status: r.status || 'Pending',
        createdAt: r.created_at || r.createdAt,
        source: 'supabase'
      }));

      setLoans(mapped);
      console.log(`✅ Loaded ${mapped.length} loans from Supabase admin_loans table`);
      return;
    } catch (err) {
      console.warn('Failed to fetch loans from Firestore:', err);
    }

    // Fallback to backend API if Firestore fails
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('https://loanzaar-react-base.onrender.com/api/loans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setLoans((data.data || []).map(loan => ({
          ...loan,
          source: 'mongodb'  // Mark as MongoDB document
        })));
      }
    } catch (error) {
      console.error('Error fetching loans from backend:', error);
    }
  };

  const fetchCreditCards = async () => {
    try {
      // Fetch from Supabase table 'other_data'
      const { data: rows, error } = await supabase
        .from('other_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (rows || []).map(r => ({
        _id: r.id,
        firestoreId: r.id,
        fullName: r.form_data?.fullName || r.full_name || r.name || '',
        email: r.form_data?.email || r.email || '',
        phone: r.form_data?.phone || r.phone || '',
        cardType: r.form_data?.cardType || 'Credit Card',
        annualIncome: r.form_data?.annualIncome || r.annual_income || 0,
        status: r.status || 'Pending',
        createdAt: r.created_at || r.createdAt,
        source: 'supabase'
      }));

      setCreditCards(mapped);
      console.log(`✅ Loaded ${mapped.length} credit card applications from Supabase other_data table`);
      return;
    } catch (err) {
      console.warn('Failed to fetch credit cards from Firestore:', err);
    }
  };

  const handleStatusChange = async (itemId, newStatus, itemType = 'loan') => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      const token = localStorage.getItem('adminToken');
      
      // Always use backend API for updates (whether source is Firestore or MongoDB)
      // Backend handles auth, validation, and coordinates with Firestore
      const endpoint = itemType === 'creditCard' ? '/api/credit-cards' : '/api/loans';
      const response = await fetch(`https://loanzaar-react-base.onrender.com${endpoint}/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        if (itemType === 'creditCard') {
          setCreditCards(creditCards.map(card => 
            card._id === itemId ? { ...card, status: newStatus } : card
          ));
          setSuccessMessage(`Credit card application status updated to ${newStatus}`);
        } else {
          setLoans(loans.map(loan => 
            loan._id === itemId ? { ...loan, status: newStatus } : loan
          ));
          setSuccessMessage(`Loan status updated to ${newStatus}`);
        }
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to update status');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Failed to update status');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleDelete = async (itemId, itemType = 'loan') => {
    const itemName = itemType === 'creditCard' ? 'credit card application' : 'loan application';
    if (!window.confirm(`Are you sure you want to delete this ${itemName}?`)) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      const token = localStorage.getItem('adminToken');
      
      const endpoint = itemType === 'creditCard' ? '/api/credit-cards' : '/api/loans';
      const response = await fetch(`https://loanzaar-react-base.onrender.com${endpoint}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        if (itemType === 'creditCard') {
          setCreditCards(creditCards.filter(card => card._id !== itemId));
          setSuccessMessage('Credit card application deleted successfully');
        } else {
          setLoans(loans.filter(loan => loan._id !== itemId));
          setSuccessMessage('Loan application deleted successfully');
        }
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || `Failed to delete ${itemName}`);
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error(`Error deleting ${itemName}:`, error);
      setErrorMessage(`Failed to delete ${itemName}`);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleView = (item, itemType = 'loan') => {
    // Store both the item data and its type for the modal
    setSelectedLoan({ ...item, _itemType: itemType });
    setShowModal(true);
  };

  // Filter and search logic
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.phone?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'All' || loan.status === filterStatus;
    const matchesType = filterType === 'All' || loan.loanType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLoans = filteredLoans.slice(startIndex, startIndex + itemsPerPage);

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
      <Meta title="Loan Applications | Admin - Loanzaar" description="Review and manage loan applications submitted by users." />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Loan Applications</h1>
          <p className="text-slate-600 mt-1">Manage and track all loan applications</p>
        </div>
        <button
          onClick={fetchLoans}
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
              Loan Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option>All</option>
              <option>Personal Loan</option>
              <option>Home Loan</option>
              <option>Business Loan</option>
              <option>Gold Loan</option>
              <option>Education Loan</option>
              <option>Loan Against Property</option>
              <option>Machinery Loan</option>
              <option>Solar Loan</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
          <span>Total: <strong>{filteredLoans.length}</strong></span>
          <span>•</span>
          <span>Showing: <strong>{paginatedLoans.length}</strong> of <strong>{filteredLoans.length}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : paginatedLoans.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No loan applications found</p>
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
                      Loan Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Amount
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
                  {paginatedLoans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{loan.fullName}</div>
                          <div className="text-sm text-slate-500">{loan.email}</div>
                          <div className="text-sm text-slate-500">{loan.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {loan.loanType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          ₹{loan.loanAmount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={loan.status}
                          onChange={(e) => handleStatusChange(loan._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)} cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500`}
                        >
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(loan)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(loan._id)}
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

      {/* Credit Cards Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-slate-800">Credit Card Applications</h2>
        </div>
        
        <div className="text-sm text-slate-600 mb-4">
          <span>Total: <strong>{creditCards.length}</strong></span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : creditCards.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No credit card applications found</p>
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
                      Card Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Annual Income
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
                  {creditCards.slice(
                    (currentCreditCardPage - 1) * 10,
                    currentCreditCardPage * 10
                  ).map((card) => (
                    <tr key={card._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{card.fullName}</div>
                          <div className="text-sm text-slate-500">{card.email}</div>
                          <div className="text-sm text-slate-500">{card.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {card.cardType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          ₹{card.annualIncome?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={card.status}
                          onChange={(e) => handleStatusChange(card._id, e.target.value, 'creditCard')}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(card.status)} cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(card, 'creditCard')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(card._id, 'creditCard')}
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

            {/* Credit Card Pagination */}
            {Math.ceil(creditCards.length / 10) > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 mt-4">
                <button
                  onClick={() => setCurrentCreditCardPage(prev => Math.max(1, prev - 1))}
                  disabled={currentCreditCardPage === 1}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {currentCreditCardPage} of {Math.ceil(creditCards.length / 10)}
                </span>
                <button
                  onClick={() => setCurrentCreditCardPage(prev => Math.min(Math.ceil(creditCards.length / 10), prev + 1))}
                  disabled={currentCreditCardPage === Math.ceil(creditCards.length / 10)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Details Modal */}
      {showModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {selectedLoan._itemType === 'creditCard' ? 'Credit Card Application Details' : 'Loan Application Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Full Name:</span>
                    <p className="font-medium text-slate-900">{selectedLoan.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <p className="font-medium text-slate-900">{selectedLoan.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    <p className="font-medium text-slate-900">{selectedLoan.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Date of Birth:</span>
                    <p className="font-medium text-slate-900">{selectedLoan.dateOfBirth || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">PAN Number:</span>
                    <p className="font-medium text-slate-900">{selectedLoan.panNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Aadhaar Number:</span>
                    <p className="font-medium text-slate-900">{selectedLoan.aadhaarNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Loan Details (shown only for loans) */}
              {selectedLoan._itemType !== 'creditCard' && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Loan Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Loan Type:</span>
                      <p className="font-medium text-slate-900">{selectedLoan.loanType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Loan Amount:</span>
                      <p className="font-medium text-slate-900">₹{selectedLoan.loanAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Monthly Income:</span>
                      <p className="font-medium text-slate-900">₹{selectedLoan.monthlyIncome?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Employment Type:</span>
                      <p className="font-medium text-slate-900">{selectedLoan.employmentType || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Credit Card Details (shown only for credit cards) */}
              {selectedLoan._itemType === 'creditCard' && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Credit Card Application Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Card Type:</span>
                      <p className="font-medium text-slate-900">{selectedLoan.cardType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Annual Income:</span>
                      <p className="font-medium text-slate-900">₹{selectedLoan.annualIncome?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {selectedLoan.remarks && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Remarks</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                    {selectedLoan.remarks}
                  </p>
                </div>
              )}

              {/* Status */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Status</h4>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedLoan.status)}`}>
                  {selectedLoan.status}
                </span>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-slate-500 border-t pt-4">
                <p>Created: {selectedLoan.createdAt ? new Date(selectedLoan.createdAt).toLocaleString() : 'N/A'}</p>
                <p>Last Updated: {selectedLoan.updatedAt ? new Date(selectedLoan.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanApplicationsPage;

