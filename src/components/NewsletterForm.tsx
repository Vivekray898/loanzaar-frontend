'use client'

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function NewsletterForm() {
  const [email, setEmail] = useState<string>('');
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
    toast.success('Thank you for subscribing!');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12"
        required
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1.5 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors"
        aria-label="Subscribe"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
