'use client'

import React, { useState, useEffect, useRef } from 'react';
import Meta from '../components/Meta';
import { Send, MessageSquare, ChevronDown, ChevronUp, RefreshCw, Trash2, Loader } from 'lucide-react';
import { submitSupportTicket, sendChatMessage, listenToChatMessages } from '../services/firestoreService';

function UserSupportPage() {
  const [threads, setThreads] = useState([]);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingThread, setLoadingThread] = useState(null);
  const [deletingThread, setDeletingThread] = useState(null);
  const [fetchingThreads, setFetchingThreads] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    const id = user?._id || user?.id;
    console.log('👤 User Data:', { id, name: user?.name, email: user?.email });
    setUserId(id);
    setUserData(user);
  }, []);

  // Fetch threads when userId is available
  useEffect(() => {
    if (userId) {
      fetchThreads();
      
      // Auto-refresh every 12 seconds
      refreshIntervalRef.current = setInterval(() => {
        fetchThreads();
      }, 12000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [userId]);

  const fetchThreads = async () => {
    try {
      if (!userId) return;
      
      setFetchingThreads(true);
      const token = localStorage.getItem('userToken');
      const response = await fetch(`https://loanzaar-react-base.onrender.com/api/support/user/${userId}/threads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      console.log('✅ Threads fetched:', data.data);
      console.log('📊 First thread structure:', data.data?.[0]);
      if (data.success) {
        setThreads(data.data || []);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch threads');
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      setError('Failed to fetch support threads');
    } finally {
      setFetchingThreads(false);
    }
  };

  const toggleThread = (threadId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: !prev[threadId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userId) {
        alert('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      // Submit to Firestore instead of MongoDB
      const result = await submitSupportTicket({
        subject: formData.subject,
        message: formData.message,
        userId: userId,
        senderName: userData?.name || userData?.fullName || 'User',
        senderEmail: userData?.email || ''
      });

      if (result.success) {
        alert('✅ Support ticket submitted successfully! You\'ll be notified once reviewed by our team.');
        setFormData({ subject: '', message: '' });
        await fetchThreads();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyToThread = async (threadId) => {
    if (!replyText[threadId]?.trim()) return;

    setLoadingThread(threadId);
    try {
      // Send chat message to Firestore
      const result = await sendChatMessage(
        threadId,
        replyText[threadId],
        'user',
        {
          senderName: userData?.name || userData?.fullName || 'User',
          senderEmail: userData?.email || '',
          userId: userId
        }
      );

      if (result.success) {
        setReplyText(prev => ({ ...prev, [threadId]: '' }));
        await fetchThreads();
        setError('');
      } else {
        setError(result.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply');
    } finally {
      setLoadingThread(null);
    }
  };

  const handleDeleteTicket = async (threadId) => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    setDeletingThread(threadId);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`https://loanzaar-react-base.onrender.com/api/support/ticket/${threadId}/delete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deletedBy: 'user'
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Ticket deleted:', data.message);
        await fetchThreads();
        setError('');
      } else {
        setError(data.message || 'Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setError('Failed to delete ticket');
    } finally {
      setDeletingThread(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <Meta 
        title="Support - Get Help | Loanzaar" 
        description="Contact Loanzaar support team for assistance with your loans, insurance, and account issues."
      />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Contact Support</h1>
          <p className="text-xs text-slate-500 mt-1">
            User ID: {userId} | Threads: {threads.length} 
            {fetchingThreads && <Loader size={12} className="inline animate-spin ml-2" />}
          </p>
        </div>
        <button
          onClick={fetchThreads}
          disabled={fetchingThreads}
          className="p-2 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={20} className={`text-slate-600 ${fetchingThreads ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* New Message Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Send a New Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
              placeholder="Enter subject of your query"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
              rows="5"
              placeholder="Describe your issue or question in detail"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Previous Messages / Conversations */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Your Conversations</h2>
        
        {threads.length > 0 ? (
          <div className="space-y-4">
            {threads.map((thread) => (
              <div key={thread._id} className="border border-slate-300 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Thread Header - Always Visible */}
                <div className="flex items-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <button
                    onClick={() => {
                      console.log('🧵 Thread details:', thread);
                      toggleThread(thread._id);
                    }}
                    className="flex-1 p-4 text-left flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{thread.subject}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(thread.status)}`}>
                          {thread.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Last message {formatDate(thread.lastMessageAt)} • {thread.messages?.length || thread.messageCount} message{thread.messageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {expandedThreads[thread._id] ? (
                      <ChevronUp size={20} className="text-slate-600" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-600" />
                    )}
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTicket(thread._id)}
                    disabled={deletingThread === thread._id}
                    className="px-4 py-4 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Delete ticket"
                  >
                    {deletingThread === thread._id ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>

                {/* Thread Expanded Content */}
                {expandedThreads[thread._id] && (
                  <>
                    {/* Messages */}
                    <div className="p-4 bg-white border-t border-slate-200 max-h-96 overflow-y-auto space-y-3">
                      {thread.messages && thread.messages.length > 0 ? (
                        thread.messages.map((msg) => (
                          <div key={msg._id} className={`flex ${msg.senderType === 'admin' ? 'justify-start' : 'justify-end'}`}>
                            <div
                              className={`max-w-xs px-4 py-3 rounded-lg ${
                                msg.senderType === 'admin'
                                  ? 'bg-blue-50 border-l-4 border-blue-500 text-slate-900'
                                  : 'bg-gray-100 text-slate-900'
                              }`}
                            >
                              <p className="text-xs font-semibold mb-1 opacity-75">
                                {msg.senderType === 'admin' ? '👨‍💼 Admin Response' : '👤 You'}
                              </p>
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs mt-1 opacity-70">{formatDate(msg.createdAt)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-500 text-sm py-4">
                          <p>⏳ No messages yet (count: {thread.messageCount || 0})</p>
                          {!thread.messages && <p className="text-xs mt-2 text-red-500">❌ Messages not loaded</p>}
                        </div>
                      )}
                    </div>

                    {/* Reply Input - Only if not closed */}
                    {thread.status !== 'Closed' ? (
                      <div className="p-4 bg-sky-50 border-t border-slate-200 flex gap-2">
                        <input
                          type="text"
                          value={replyText[thread._id] || ''}
                          onChange={(e) => setReplyText(prev => ({ ...prev, [thread._id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleReplyToThread(thread._id)}
                          placeholder="Type your reply..."
                          disabled={loadingThread === thread._id}
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
                        />
                        <button
                          onClick={() => handleReplyToThread(thread._id)}
                          disabled={!replyText[thread._id]?.trim() || loadingThread === thread._id}
                          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                        >
                          <Send size={18} />
                          {loadingThread === thread._id ? 'Sending...' : 'Reply'}
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-100 text-center text-slate-700 text-sm font-medium border-t border-slate-300">
                        ✓ This conversation has been closed
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-600">
            <MessageSquare size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="font-semibold">No conversations yet</p>
            <p className="text-sm mt-1">Send a message above to start a support conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserSupportPage;

