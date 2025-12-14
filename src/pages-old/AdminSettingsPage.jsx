'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { Settings as SettingsIcon, User, Lock, Bell, Database, CheckCircle, XCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { supabase } from '@/config/supabase';

function AdminSettingsPage() {
  const { admin, supabaseUser, updateAdminProfile } = useAdminAuth();
  
  const [adminProfile, setAdminProfile] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState({ show: false, success: false, message: '' });
  const [passwordStatus, setPasswordStatus] = useState({ show: false, success: false, message: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false
  });

  useEffect(() => {
    if (admin) {
      setAdminProfile({
        fullName: admin.fullName || '',
        email: admin.email || supabaseUser?.email || '',
        phone: admin.phone || ''
      });
      setNotificationSettings({
        emailNotifications: admin.emailNotifications !== undefined ? admin.emailNotifications : true,
        smsNotifications: admin.smsNotifications !== undefined ? admin.smsNotifications : false
      });
      setLoading(false);
    }
  }, [admin, supabaseUser]);

  const showStatus = (setter, success, message) => {
    setter({ show: true, success, message });
    setTimeout(() => {
      setter({ show: false, success: false, message: '' });
    }, 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      // Validate inputs
      if (!adminProfile.fullName.trim()) {
        showStatus(setUpdateStatus, false, 'Name is required');
        setUpdatingProfile(false);
        return;
      }

      if (adminProfile.phone && !/^\d{10}$/.test(adminProfile.phone.replace(/\D/g, ''))) {
        showStatus(setUpdateStatus, false, 'Please enter a valid 10-digit phone number');
        setUpdatingProfile(false);
        return;
      }

      // Update profile in Firestore
      const result = await updateAdminProfile({
        fullName: adminProfile.fullName.trim(),
        phone: adminProfile.phone.trim(),
        emailNotifications: notificationSettings.emailNotifications,
        smsNotifications: notificationSettings.smsNotifications
      });

      if (result.success) {
        showStatus(setUpdateStatus, true, 'Profile updated successfully!');
      } else {
        showStatus(setUpdateStatus, false, result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showStatus(setUpdateStatus, false, 'An error occurred while updating profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true);

    try {
      // Validate passwords
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        showStatus(setPasswordStatus, false, 'All password fields are required');
        setChangingPassword(false);
        return;
      }

      if (passwordData.newPassword.length < 6) {
        showStatus(setPasswordStatus, false, 'New password must be at least 6 characters');
        setChangingPassword(false);
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showStatus(setPasswordStatus, false, 'New passwords do not match!');
        setChangingPassword(false);
        return;
      }

      // Ensure Supabase session exists
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showStatus(setPasswordStatus, false, 'User not authenticated');
        setChangingPassword(false);
        return;
      }

      // Supabase: update user password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      if (error) {
        // Map common errors to friendly messages
        let errorMessage = 'Failed to change password';
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('weak')) {
          errorMessage = 'Password is too weak';
        } else if (msg.includes('requires reauthentication')) {
          // Redirect to admin login and preserve intent
          const intent = '/admin/settings';
          const redirectUrl = `/admin/login?next=${encodeURIComponent(intent)}`;
          showStatus(setPasswordStatus, false, 'Please sign in again. Redirecting to login...');
          // Use window.location to avoid router import here
          if (typeof window !== 'undefined') {
            window.location.href = redirectUrl;
          }
          setChangingPassword(false);
          return;
        } else if (msg.includes('invalid')) {
          errorMessage = 'Invalid password format';
        }
        showStatus(setPasswordStatus, false, errorMessage);
        setChangingPassword(false);
        return;
      }

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      showStatus(setPasswordStatus, true, 'Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      showStatus(setPasswordStatus, false, 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key]
    };
    setNotificationSettings(newSettings);

    // Save to Firestore
    try {
      await updateAdminProfile(newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert on error
      setNotificationSettings(notificationSettings);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Meta 
        title="Admin Settings - Loanzaar" 
        description="Configure admin account settings, security, and preferences."
      />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your admin account settings</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      ) : (
        <>
          {/* Profile Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-rose-500" />
              <h2 className="text-xl font-bold text-slate-800">Profile Settings</h2>
            </div>

            {/* Status Message for Profile Update */}
            {updateStatus.show && (
              <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                updateStatus.success 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {updateStatus.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span>{updateStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adminProfile.fullName}
                  onChange={(e) => setAdminProfile({ ...adminProfile, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={adminProfile.email}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  title="Email cannot be changed"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={adminProfile.phone}
                  onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updatingProfile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </form>
          </div>

          {/* Password Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
        </div>

        {/* Status Message for Password Change */}
        {passwordStatus.show && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            passwordStatus.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {passwordStatus.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{passwordStatus.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Enter new password (min 6 characters)"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {changingPassword ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Email Notifications</p>
              <p className="text-sm text-slate-500">Receive email notifications for new applications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationSettings.emailNotifications}
                onChange={() => handleNotificationToggle('emailNotifications')}
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">SMS Notifications</p>
              <p className="text-sm text-slate-500">Receive SMS for urgent matters</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationSettings.smsNotifications}
                onChange={() => handleNotificationToggle('smsNotifications')}
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800">System Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Platform Version:</span>
            <p className="font-medium text-slate-900">LoanZaar v1.0.0</p>
          </div>
          <div>
            <span className="text-slate-500">Database:</span>
            <p className="font-medium text-slate-900">MongoDB</p>
          </div>
          <div>
            <span className="text-slate-500">Server Status:</span>
            <p className="font-medium text-green-600">● Online</p>
          </div>
          <div>
            <span className="text-slate-500">Last Backup:</span>
            <p className="font-medium text-slate-900">2 hours ago</p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

export default AdminSettingsPage;

