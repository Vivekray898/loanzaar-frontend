'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { User, Save } from 'lucide-react';

function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('https://loanzaar-react-base.onrender.com/api/user-dashboard/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('https://loanzaar-react-base.onrender.com/api/user-dashboard/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
        setProfile(data.data);
      }
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Meta 
        title="My Profile - Loanzaar Account" 
        description="Manage your Loanzaar account profile and personal information."
      />
      <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profile?.fullName || ''}
              onChange={(e) => setProfile({...profile, fullName: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profile?.phone || ''}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
            <input
              type="number"
              value={profile?.age || ''}
              onChange={(e) => setProfile({...profile, age: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
            <input
              type="text"
              value={profile?.state || ''}
              onChange={(e) => setProfile({...profile, state: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
            <input
              type="text"
              value={profile?.city || ''}
              onChange={(e) => setProfile({...profile, city: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          {saving ? 'Saving...' : (
            <>
              <Save className="w-5 h-5" />
              Update Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default UserProfilePage;

