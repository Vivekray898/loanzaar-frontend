'use client'

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function NewsletterForm() {
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const toast = useToast();

  // Prevent duplicate subscription for same email (local cache)
  const hasLocalSubscription = (e: string) => {
    try { return !!localStorage.getItem(`newsletter_subscribed:${e.toLowerCase()}`); } catch { return false; }
  };

  const markLocalSubscribed = (e: string) => {
    try { localStorage.setItem(`newsletter_subscribed:${e.toLowerCase()}`, String(Date.now())); } catch {}
  };

  const validateEmail = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim());

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setMessage(null);

    const value = email.trim().toLowerCase();
    if (!validateEmail(value)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    if (hasLocalSubscription(value)) {
      setStatus('success');
      setMessage('You are already subscribed');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: value }),
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        markLocalSubscribed(value);
        setEmail('');
        toast.success('Thank you for subscribing!');
        return;
      }

      if (res.status === 429) {
        setStatus('error');
        setMessage(data?.error || 'Rate limit exceeded. Please try again later.');
        return;
      }

      setStatus('error');
      setMessage(data?.error || 'Subscription failed. Please try again.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Network error. Please try again.');
    }
  };

  const disabled = status === 'loading' || status === 'success';

  return (
    <form onSubmit={handleSubmit} className="relative" aria-live="polite">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status !== 'idle') { setStatus('idle'); setMessage(null); } }}
        className={`w-full bg-slate-900 border ${status === 'error' ? 'border-red-500' : 'border-slate-800'} rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12`}
        required
        aria-invalid={status === 'error'}
      />

      <button
        type="submit"
        disabled={disabled}
        className={`absolute right-1.5 top-1.5 ${disabled ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white p-1.5 rounded-lg transition-colors flex items-center gap-2 px-3`}
        aria-label="Subscribe"
      >
        {status === 'loading' ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
        ) : (
          <Send className="w-4 h-4" />
        )}
        <span className="sr-only">Subscribe</span>
      </button>

      {message && (
        <p className={`mt-2 text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>
      )}
    </form>
  );
}
