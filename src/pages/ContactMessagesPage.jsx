'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { getPendingSubmissions } from '../services/supabaseService';
import { Search, MessageSquare, Eye, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../config/supabase';
import { authenticatedFetch as fetchWithFirebaseToken } from '../utils/supabaseTokenHelper';

function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    // Try to load all contact messages from Supabase
    const load = async () => {
      try {
        const { data: rows, error } = await supabase
          .from('admin_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (rows && rows.length) {
          const mapped = rows.map(r => ({
            _id: r.id,
            name: r.form_data?.fullName || r.name || '',
            email: r.form_data?.email || r.email || '',
            phone: r.form_data?.phone || r.phone || '',
            message: r.form_data?.message || r.message || '',
            status: r.status || 'New',
            createdAt: r.created_at || r.createdAt,
            source: 'supabase'
          }));
          setMessages(mapped);
          setLoading(false);
          return;
        }
      } catch (err) {
        // fallback to existing backend API
        console.warn('Failed to fetch admin_messages from Supabase, falling back to backend:', err);
      }

      fetchMessages();
    };

    load();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetchWithFirebaseToken('https://loanzaar-react-base.onrender.com/api/contact');

      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      console.log('📤 Updating contact status:', { messageId, newStatus });
      
      const response = await fetchWithFirebaseToken(`https://loanzaar-react-base.onrender.com/api/contact/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      console.log('📥 Contact status update response:', data);
      
      if (data.success) {
        setMessages(messages.map(msg => 
          msg._id === messageId ? { ...msg, status: newStatus } : msg
        ));
        setSuccessMessage(`Message status updated to ${newStatus}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to update status');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Failed to update message status');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');
      
      const response = await fetchWithFirebaseToken(`https://loanzaar-react-base.onrender.com/api/contact/${messageId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(messages.filter(msg => msg._id !== messageId));
        setSuccessMessage('Message deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to delete message');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setErrorMessage('Failed to delete message');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleView = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  // Filter and search logic
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.phone?.includes(searchTerm) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || msg.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Contacted': return 'bg-green-100 text-green-800 border-green-300';
      case 'Client Not Responded': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Not Interested': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Meta 
        title="Contact Messages - Admin Panel | Loanzaar" 
        description="Manage customer inquiries and support messages from the admin panel."
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Contact Messages</h1>
          <p className="text-slate-600 mt-1">View and manage customer inquiries</p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="font-bold">✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="font-bold">✗</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Search by name, email, phone, or message..."
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
              <option>New</option>
              <option>Contacted</option>
              <option>Client Not Responded</option>
              <option>Not Interested</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
          <span>Total: <strong>{filteredMessages.length}</strong></span>
          <span>•</span>
          <span>Showing: <strong>{paginatedMessages.length}</strong> of <strong>{filteredMessages.length}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : paginatedMessages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No messages found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Message Preview
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
                  {paginatedMessages.map((msg) => (
                    <tr key={msg._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{msg.name}</div>
                          <div className="text-sm text-slate-500">{msg.email}</div>
                          <div className="text-sm text-slate-500">{msg.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 line-clamp-2">
                          {msg.message}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={msg.status}
                          onChange={(e) => handleStatusChange(msg._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(msg.status)} cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500`}
                        >
                          <option>New</option>
                          <option>Contacted</option>
                          <option>Client Not Responded</option>
                          <option>Not Interested</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(msg)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Full Message"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(msg._id)}
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

      {/* View Details Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Contact Message Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Name:</span>
                    <p className="font-medium text-slate-900">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <p className="font-medium text-slate-900">
                      <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                        {selectedMessage.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    <p className="font-medium text-slate-900">
                      <a href={`tel:${selectedMessage.phone}`} className="text-blue-600 hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Message</h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Status</h4>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedMessage.status)}`}>
                  {selectedMessage.status}
                </span>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-slate-500 border-t pt-4">
                <p>Received: {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                {selectedMessage.updatedAt && (
                  <p>Last Updated: {new Date(selectedMessage.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3">
              <a
                href={`mailto:${selectedMessage.email}`}
                className="flex-1 px-4 py-2 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send Email
              </a>
              <a
                href={`tel:${selectedMessage.phone}`}
                className="flex-1 px-4 py-2 bg-green-500 text-white text-center rounded-lg hover:bg-green-600 transition-colors"
              >
                Call
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
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

export default ContactMessagesPage;

