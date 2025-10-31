import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, AlertCircle, Plus, RefreshCw } from 'lucide-react';

function UserSupportChat() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadData, setNewThreadData] = useState({ subject: '', message: '' });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData._id || userData.id;
    setUserId(userId);
    if (userId) {
      fetchUserThreads(userId);
    }
  }, []);

  const fetchUserThreads = async (userId) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`https://loanzaar-react-base.onrender.com/api/support/user/${userId}/threads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setThreads(data.data || []);
        // Select first thread if available
        if (data.data && data.data.length > 0) {
          handleSelectThread(data.data[0]);
        }
      } else {
        setError(data.message || 'Failed to fetch threads');
      }
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Failed to fetch support threads');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    setMessages([]);
    setShowNewThreadForm(false);
    await fetchThreadMessages(thread._id);
  };

  const fetchThreadMessages = async (threadId) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`https://loanzaar-react-base.onrender.com/api/support/thread/${threadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        console.log('Messages fetched:', data.data.messages);
        setMessages(data.data.messages || []);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
    }
  };

  const handleStartNewThread = async () => {
    if (!newThreadData.subject.trim() || !newThreadData.message.trim()) {
      setError('Please fill in both subject and message');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      const response = await fetch('https://loanzaar-react-base.onrender.com/api/support/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          subject: newThreadData.subject,
          message: newThreadData.message,
          senderType: 'user',
          senderName: userData.name || 'User',
          senderEmail: userData.email
        })
      });

      const data = await response.json();
      if (data.success) {
        // Reset form
        setNewThreadData({ subject: '', message: '' });
        setShowNewThreadForm(false);
        // Refresh threads
        fetchUserThreads(userId);
      } else {
        setError(data.message || 'Failed to create thread');
      }
    } catch (err) {
      console.error('Error creating thread:', err);
      setError('Failed to create thread');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('userToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      const response = await fetch('https://loanzaar-react-base.onrender.com/api/support/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          threadId: selectedThread._id,
          message: newMessage,
          senderType: 'user',
          senderName: userData.name || 'User',
          senderEmail: userData.email
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        // Refresh messages to show the new message
        await fetchThreadMessages(selectedThread._id);
        // Refresh threads to update status
        fetchUserThreads(userId);
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-rose-600 to-rose-700 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare size={28} />
          Support & Help
        </h2>
        <p className="text-rose-100 mt-1">Get help from our admin team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Threads List */}
        <div className="lg:col-span-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Conversations</h3>
            <button
              onClick={() => setShowNewThreadForm(true)}
              className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              title="Start new conversation"
            >
              <Plus size={18} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2"></div>
              Loading threads...
            </div>
          ) : threads.length === 0 && !showNewThreadForm ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new one to contact us</p>
            </div>
          ) : (
            <>
              {threads.map((thread) => (
                <div
                  key={thread._id}
                  onClick={() => handleSelectThread(thread)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-all border ${
                    selectedThread?._id === thread._id
                      ? 'bg-white border-rose-500 shadow-md'
                      : 'border-transparent hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-slate-900 text-sm line-clamp-1">
                      {thread.subject}
                    </p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getStatusBadge(thread.status)}`}>
                      {thread.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-1">
                    {thread.lastMessagePreview}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(thread.lastMessageAt)}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Message View */}
        <div className="lg:col-span-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-col">
          {showNewThreadForm ? (
            <div className="p-6 flex flex-col h-full">
              <h3 className="font-bold text-slate-900 mb-4">Start a New Conversation</h3>

              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm flex gap-2">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newThreadData.subject}
                    onChange={(e) => setNewThreadData({ ...newThreadData, subject: e.target.value })}
                    placeholder="e.g., Question about my loan application"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Message
                  </label>
                  <textarea
                    value={newThreadData.message}
                    onChange={(e) => setNewThreadData({ ...newThreadData, message: e.target.value })}
                    placeholder="Describe your issue or ask your question in detail..."
                    rows="6"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleStartNewThread}
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowNewThreadForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedThread ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{selectedThread.subject}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Started {formatDate(selectedThread.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => fetchThreadMessages(selectedThread._id)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Refresh messages"
                >
                  <RefreshCw size={18} className="text-slate-600" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm flex gap-2">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <p>No messages in this conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-4 py-3 rounded-lg ${
                          msg.senderType === 'user'
                            ? 'bg-rose-600 text-white rounded-br-none'
                            : 'bg-green-50 border-2 border-green-500 text-slate-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1 opacity-75">
                          {msg.senderName} {msg.senderType === 'admin' ? '(Admin)' : ''}
                        </p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">{formatDate(msg.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              {selectedThread.status !== 'Closed' ? (
                <div className="p-4 bg-gradient-to-r from-rose-50 to-rose-100 border-t-2 border-rose-500">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Reply to Admin</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your reply here..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                    >
                      <Send size={18} />
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 text-center text-slate-700 text-sm font-medium border-t border-slate-300">
                  ✓ This conversation has been closed
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 font-semibold">Select a conversation</p>
                <p className="text-slate-500 text-sm mt-1">Or start a new one to contact us</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserSupportChat;
