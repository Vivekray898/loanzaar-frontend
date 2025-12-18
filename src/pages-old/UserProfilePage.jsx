'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { User, Save } from 'lucide-react';
import { supabase } from '../config/supabase';
import { updateUserProfile } from '../services/supabaseAuthService';

function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Load profile from Supabase user metadata
        setProfile({
          email: user.email,
          fullName: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          age: user.user_metadata?.age || '',
          state: user.user_metadata?.state || '',
          city: user.user_metadata?.city || ''
        });
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateUserProfile(profile);
      if (result.success) {
        alert('✅ Profile updated successfully!');
        // Refresh profile data
        await fetchProfile();
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert('Failed to update profile: ' + (error.message || error));
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
          className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
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

