'use client'

import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

function UserSupportChat() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadData, setNewThreadData] = useState({ subject: '', message: '' });
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [unsubscribeThreads, setUnsubscribeThreads] = useState(null);
  const [unsubscribeMessages, setUnsubscribeMessages] = useState(null);

  // Initialize and get user data from Firebase Auth with fallback to localStorage
  useEffect(() => {
    console.log('🔐 Initializing user authentication...');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase Auth
        const uid = firebaseUser.uid;
        const userInfo = {
          uid: uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || ''
        };
        
        setUserId(uid);
        setUserData(userInfo);
        console.log('✅ User authenticated via Firebase Auth:', { 
          id: uid, 
          name: userInfo.name, 
          email: userInfo.email 
        });
        
        // Update localStorage for consistency
        const existingUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = { 
          ...existingUserData, 
          ...userInfo, 
          firebaseUID: uid,
          _id: uid 
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserLoading(false);
      } else {
        // User is not signed in - try localStorage fallback
        console.log('⚠️ No Firebase Auth user. Checking localStorage...');
        const storedUserData = localStorage.getItem('userData');
        
        if (storedUserData) {
          try {
            const parsed = JSON.parse(storedUserData);
            const uid = parsed._id || parsed.id || parsed.uid;
            
            if (uid) {
              setUserId(uid);
              setUserData(parsed);
              console.log('✅ User loaded from localStorage:', { 
                id: uid, 
                name: parsed.name, 
                email: parsed.email 
              });
              setUserLoading(false);
            } else {
              console.warn('❌ No valid user ID found in localStorage');
              setUserId(null);
              setUserData(null);
              setUserLoading(false);
            }
          } catch (e) {
            console.error('❌ Error parsing localStorage user data:', e);
            setUserId(null);
            setUserData(null);
            setUserLoading(false);
          }
        } else {
          console.warn('⚠️ No user authenticated and no localStorage data found');
          setUserId(null);
          setUserData(null);
          setUserLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to user's threads with real-time listener
  useEffect(() => {
    if (!userId || userLoading) {
      console.log('⏳ Waiting for userId to be available...');
      return;
    }

    console.log('📡 Setting up real-time thread listener for user:', userId);
    
    try {
      const db = getFirestore();
      const threadsRef = collection(db, 'support_chats');
      const q = query(
        threadsRef,
        where('userId', '==', userId),
        orderBy('lastMessageAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const threadList = [];
        snapshot.forEach(doc => {
          threadList.push({
            _id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            lastMessageAt: doc.data().lastMessageAt?.toDate?.() || new Date()
          });
        });
        setThreads(threadList);
        console.log('✅ Threads updated:', threadList.length);

        // Auto-select first thread if none selected
        if (threadList.length > 0 && !selectedThread) {
          handleSelectThread(threadList[0]);
        }
      });

      setUnsubscribeThreads(() => unsubscribe);
      return () => unsubscribe();
    } catch (err) {
      console.error('❌ Error setting up thread listener:', err);
      setError('Failed to load conversations');
    }
  }, [userId, userLoading]);

  // Subscribe to selected thread's messages with real-time listener
  useEffect(() => {
    if (!selectedThread?._id) {
      setMessages([]);
      if (unsubscribeMessages) unsubscribeMessages();
      return;
    }

    console.log('📡 Setting up real-time message listener for thread:', selectedThread._id);

    try {
      const db = getFirestore();
      const messagesRef = collection(db, 'support_chats', selectedThread._id, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messageList = [];
        snapshot.forEach(doc => {
          messageList.push({
            _id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date()
          });
        });
        setMessages(messageList);
        console.log('✅ Messages updated:', messageList.length);
      });

      setUnsubscribeMessages(() => unsubscribe);
      return () => unsubscribe();
    } catch (err) {
      console.error('❌ Error setting up message listener:', err);
      setError('Failed to load messages');
    }
  }, [selectedThread?._id]);

  const handleSelectThread = (thread) => {
    setSelectedThread(thread);
    setShowNewThreadForm(false);
    setError('');
  };

  const handleStartNewThread = async () => {
    if (!newThreadData.subject.trim() || !newThreadData.message.trim()) {
      setError('Please fill in both subject and message');
      return;
    }

    if (!userId) {
      setError('❌ User information not available. Loading user data...');
      console.warn('⚠️ handleStartNewThread called but userId is not set. userLoading:', userLoading);
      
      // Retry after a delay
      setTimeout(() => {
        if (!userId) {
          setError('❌ Failed to load user information. Please refresh the page.');
        } else {
          setError('');
        }
      }, 2000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('userToken');

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
          senderName: userData?.name || 'User',
          senderEmail: userData?.email || ''
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ New thread created:', data.data.threadId);
        setNewThreadData({ subject: '', message: '' });
        setShowNewThreadForm(false);
        // Threads will update automatically via real-time listener
      } else {
        setError(data.message || 'Failed to create thread');
      }
    } catch (err) {
      console.error('❌ Error creating thread:', err);
      setError('Failed to create thread. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    if (!userId) {
      setError('❌ User information not available. Loading user data...');
      console.warn('⚠️ handleSendMessage called but userId is not set. userLoading:', userLoading);
      
      // Retry after a delay
      setTimeout(() => {
        if (!userId) {
          setError('❌ Failed to load user information. Please refresh the page.');
        } else {
          setError('');
        }
      }, 2000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('userToken');

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
          senderName: userData?.name || 'User',
          senderEmail: userData?.email || ''
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Message sent:', data.data.messageId);
        setNewMessage('');
        // Messages will update automatically via real-time listener
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
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

  const formatDate = (dateObj) => {
    if (!dateObj) return 'N/A';
    const date = dateObj instanceof Date ? dateObj : dateObj.toDate?.() || new Date(dateObj);
    return date.toLocaleString('en-IN', {
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

      {/* User Loading State */}
      {userLoading ? (
        <div className="flex items-center justify-center h-96 bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-slate-700 font-semibold">Loading user information...</p>
            <p className="text-slate-500 text-sm mt-2">Please wait while we authenticate you</p>
          </div>
        </div>
      ) : !userId ? (
        <div className="flex items-center justify-center h-96 bg-red-50">
          <div className="text-center p-6 max-w-sm">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-slate-900 font-semibold mb-2">Authentication Required</p>
            <p className="text-slate-600 text-sm mb-4">
              Unable to load your user information. Please sign in to access support chat.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Render chat UI only when user is authenticated */}
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

          {loading && !threads.length ? (
            <div className="text-center py-8 text-slate-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2"></div>
              Loading conversations...
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
                    {thread.lastMessage}
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
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Message'}
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
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">{formatDate(msg.timestamp)}</p>
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
                      disabled={loading}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || loading}
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
      </>
      )}
    </div>
  );
}

export default UserSupportChat;
