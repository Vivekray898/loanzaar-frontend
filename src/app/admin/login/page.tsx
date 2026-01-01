"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [profileId, setProfileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const lead = (typeof window !== 'undefined') ? localStorage.getItem('lead_user_id') : null;
      if (lead) setProfileId(lead);
    } catch (e) {}
  }, []);

  const handleLogin = async () => {
    if (!profileId) {
      setMessage('Missing profile id');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profileId }) });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json?.error || 'Login failed');
        return;
      }
      // Success — redirect to admin
      window.location.href = '/admin';
    } catch (e: any) {
      setMessage(e.message || 'Network error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-md border border-slate-100">
        <h2 className="text-xl font-bold mb-4">Admin Login via Profile</h2>
        <p className="text-sm text-slate-500 mb-4">If you logged in via OTP and your profile has admin rights, paste the profile id or press "Use my profile" to use it for admin session.</p>

        <label className="block text-sm font-medium text-slate-700 mb-2">Profile ID</label>
        <input value={profileId} onChange={e => setProfileId(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg mb-4" />

        <div className="flex gap-3">
          <button onClick={handleLogin} disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg disabled:opacity-60">{loading ? 'Signing in...' : 'Sign in as Admin'}</button>
          <Link href="/signin" className="px-4 py-3 bg-white border border-slate-200 rounded-lg">Sign in</Link>
        </div>
        {message && <div className="mt-4 text-sm text-red-500">{message}</div>}
      </div>
    </div>
  );
}
