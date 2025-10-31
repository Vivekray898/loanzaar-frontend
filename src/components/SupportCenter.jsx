'use client'

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, AlertCircle, Check, Clock, RefreshCw, Trash2, Loader } from 'lucide-react';
import { fetchWithFirebaseToken } from '../utils/firebaseTokenHelper';

function SupportCenter() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteOption, setDeleteOption] = useState('admin'); // 'admin', 'user', 'both'
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    fetchThreads();
    fetchUnreadCount();
    
    // Auto-refresh every 12 seconds
    refreshIntervalRef.current = setInterval(() => {
      if (selectedThread) {
        fetchThreadMessages(selectedThread._id);
      }
      fetchUnreadCount();
    }, 12000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [page, statusFilter, selectedThread]);

  const fetchThreads = async () => {
    setLoading(true);
    setError('');

    try {
  let url = `/support/threads?page=${page}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;

      console.log('📡 Fetching threads from:', url);
      const response = await fetchWithFirebaseToken(url);

      const data = await response.json();
      console.log('📊 Threads response:', data);
      
      if (data.success) {
        console.log('✅ Threads fetched:', data.data?.length || 0);
        console.log('📋 Thread structure sample:', data.data?.[0]);
        setThreads(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setError(data.message || 'Failed to fetch threads');
        console.error('❌ Error:', data.message);
      }
    } catch (err) {
      console.error('❌ Error fetching threads:', err);
      setError('Failed to fetch support threads');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
  const response = await fetchWithFirebaseToken('/support/unread-count');
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.totalUnread);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchThreadMessages = async (threadId) => {
    try {
  const response = await fetchWithFirebaseToken(`/support/thread/${threadId}`);

      const data = await response.json();
      if (data.success) {
        console.log('✅ Messages fetched:', data.data.messages);
        console.log('📊 Message structure sample:', data.data.messages?.[0]);
        
        // Process messages to ensure proper date field
        const processedMessages = (data.data.messages || []).map((msg) => ({
          ...msg,
          // Use timestamp if available (Firestore), otherwise createdAt (MongoDB)
          displayDate: msg.timestamp || msg.createdAt,
          _id: msg._id || Math.random().toString(36).substr(2, 9)
        }));
        
        setMessages(processedMessages);
        console.log('✅ Processed messages:', processedMessages);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch messages');
        console.error('❌ Error fetching messages:', data.message);
      }
    } catch (err) {
      console.error('❌ Error fetching thread messages:', err);
      setError('Failed to fetch messages');
    }
  };

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    setMessages([]);
    setError('');
    await fetchThreadMessages(thread._id);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
  const response = await fetchWithFirebaseToken('/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThread._id,
          message: replyText
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Reply sent successfully');
        setReplyText('');
        setError('');

        // Refresh messages to show new reply
        await fetchThreadMessages(selectedThread._id);
        
        // Update thread status
        setSelectedThread({ ...selectedThread, status: 'Replied' });
        
        // Refresh threads list to update preview and status
        fetchThreads();
        fetchUnreadCount();
      } else {
        setError(data.message || 'Failed to send reply');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply');
    }
  };

  const handleCloseThread = async () => {
    try {
      console.log(`🔒 Attempting to close thread: ${selectedThread._id}`);
      
      const response = await fetchWithFirebaseToken(
        `/support/thread/${selectedThread._id}/close`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: 'Closed by admin'
          })
        }
      );

      const data = await response.json();
      console.log('📊 Close response:', data);
      
      if (data.success) {
        console.log('✅ Thread closed successfully');
        setSelectedThread({ ...selectedThread, status: 'Closed' });
        fetchThreads();
      } else {
        console.error('❌ Failed to close:', data.message);
        setError(data.message || 'Failed to close thread');
      }
    } catch (err) {
      console.error('❌ Error closing thread:', err);
      setError(`Failed to close thread: ${err.message}`);
    }
  };

  const handleDeleteTicket = () => {
    // Show delete options dialog
    setShowDeleteDialog(true);
    setDeleteOption('admin'); // Default selection
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setShowDeleteDialog(false);
    
    try {
      // If "both" is selected, we'll send two requests
      if (deleteOption === 'both') {
        // First delete from admin side
        const adminResponse = await fetchWithFirebaseToken(
          `/support/ticket/${selectedThread._id}/delete`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deletedBy: 'admin'
            })
          }
        );

        const adminData = await adminResponse.json();
        if (!adminData.success) {
          throw new Error(adminData.message || 'Failed to delete from admin side');
        }

        // Then delete from user side
        const userResponse = await fetchWithFirebaseToken(
          `/support/ticket/${selectedThread._id}/delete`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            deletedBy: 'user'
          })
        });

        const userData = await userResponse.json();
        if (!userData.success) {
          throw new Error(userData.message || 'Failed to delete from user side');
        }
      } else {
        // Single deletion request
        const response = await fetchWithFirebaseToken(
          `/support/ticket/${selectedThread._id}/delete`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deletedBy: deleteOption === 'user' ? 'user' : 'admin'
            })
          }
        );

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to delete ticket');
        }
      }

      console.log('✅ Ticket deleted successfully');
      setSelectedThread(null);
      setMessages([]);
      await fetchThreads();
      setError('');
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError(err.message || 'Failed to delete ticket');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Replied':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New':
        return <AlertCircle size={16} />;
      case 'Replied':
        return <Check size={16} />;
      case 'Closed':
        return <Clock size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle Firestore Timestamp objects (has toDate method)
      let date = dateString;
      if (dateString && typeof dateString === 'object' && dateString.toDate) {
        date = dateString.toDate();
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formatting date:', dateString, err);
      return 'N/A';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Thread List */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-rose-600 to-rose-700 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare size={24} />
            Support Threads
          </h2>
          {unreadCount > 0 && (
            <div className="mt-2 text-sm">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Replied">Replied</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Threads List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-4 text-center text-slate-500">Loading threads...</div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No threads found</div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread._id}
                onClick={() => handleSelectThread(thread)}
                className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${
                  selectedThread?._id === thread._id
                    ? 'bg-rose-50 border-l-4 border-l-rose-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{thread.userName}</p>
                    <p className="text-xs text-slate-600 truncate">{thread.userEmail}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(thread.status)}`}>
                    {getStatusIcon(thread.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mb-1 line-clamp-1">{thread.subject}</p>
                <p className="text-xs text-slate-600 line-clamp-2">{thread.lastMessagePreview}</p>
                <p className="text-xs text-slate-500 mt-2">{formatDate(thread.lastMessageAt)}</p>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex-1 px-2 py-1 bg-slate-200 text-sm rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex-1 px-2 py-1 bg-rose-600 text-white text-sm rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Message View */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
        {selectedThread ? (
          <>
            {/* Header with Refresh Button */}
            <div className="p-6 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedThread.subject}</h3>
                  <p className="text-sm text-slate-600">From: {selectedThread.userName} ({selectedThread.userEmail})</p>
                  <p className="text-xs text-slate-500 mt-1">Message Count: {selectedThread.messageCount}</p>
                </div>
                <div className="flex gap-2 items-start">
                  <button
                    onClick={() => fetchThreadMessages(selectedThread._id)}
                    disabled={refreshing}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh messages"
                  >
                    <RefreshCw size={18} className={`text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusBadge(selectedThread.status)}`}>
                      {getStatusIcon(selectedThread.status)}
                      {selectedThread.status}
                    </span>
                    {selectedThread.status !== 'Closed' && (
                      <button
                        onClick={handleCloseThread}
                        className="px-3 py-1 bg-slate-200 text-slate-800 text-sm rounded hover:bg-slate-300"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={handleDeleteTicket}
                      disabled={deleting}
                      className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Delete ticket"
                    >
                      {deleting ? (
                        <>
                          <Loader size={14} className="animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={14} />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No messages in this conversation yet
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg ${
                        msg.senderType === 'admin'
                          ? 'bg-rose-600 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-75">{msg.senderName || (msg.senderType === 'admin' ? 'Admin' : 'User')}</p>
                      <p className="text-sm">{msg.message || msg.text || '(No message content)'}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatDate(msg.displayDate || msg.timestamp || msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            {selectedThread.status !== 'Closed' && (
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={18} />
                    Reply
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
              <MessageSquare size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 font-semibold">Select a thread to view messages</p>
              <p className="text-slate-500 text-sm mt-1">Click on a support thread from the list</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog Modal */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Delete Support Ticket</h2>
            
            <p className="text-sm text-slate-600 mb-6">
              Choose how you want to delete this ticket:
            </p>

            <div className="space-y-3 mb-6">
              {/* Option 1: Delete from Admin only */}
              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="deleteOption"
                  value="admin"
                  checked={deleteOption === 'admin'}
                  onChange={(e) => setDeleteOption(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Delete from Admin side only</p>
                  <p className="text-xs text-slate-600 mt-1">This ticket will be removed from your view, but users will still see it</p>
                </div>
              </label>

              {/* Option 2: Delete from User only */}
              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="deleteOption"
                  value="user"
                  checked={deleteOption === 'user'}
                  onChange={(e) => setDeleteOption(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Delete from User side only</p>
                  <p className="text-xs text-slate-600 mt-1">This ticket will be removed from user view, but you'll still see it</p>
                </div>
              </label>

              {/* Option 3: Delete from Both */}
              <label className="flex items-start gap-3 p-3 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer bg-red-50">
                <input
                  type="radio"
                  name="deleteOption"
                  value="both"
                  checked={deleteOption === 'both'}
                  onChange={(e) => setDeleteOption(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-red-900 text-sm">Delete from Both sides</p>
                  <p className="text-xs text-red-700 mt-1">This will permanently remove the ticket from both admin and user views</p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {deleting ? (
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
      )}
    </div>
  );
}

export default SupportCenter;

