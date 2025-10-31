'use client'

import React, { useState } from 'react';
import Meta from '../components/Meta';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, UserPlus, Mail, Phone, User, Lock } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

function AdminSignupPage() {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const { signup } = useAdminAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      // Use Firebase Authentication via context
      const result = await signup(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone,
        'admin' // default role
      );

      if (result.success) {
        // Show success message and redirect to login
        alert('Admin account created successfully! Please login.');
        navigate('/admin/login');
      } else {
        setServerError(result.error || 'Failed to create admin account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Meta title="Create Admin | Loanzaar" description="Create an admin account to manage LoanZaar operations." />
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-rose-500 p-3 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Create Admin Account</h2>
          <p className="text-slate-600 mt-2">Join the LoanZaar admin team</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {serverError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <span className="text-xl mr-2">❌</span>
              <span className="text-sm">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${
                    errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">❌</span>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition`}
                  placeholder="admin@loanzaar.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">❌</span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  className={`block w-full pl-10 pr-3 py-2.5 border ${
                    errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition`}
                  placeholder="9876543210"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">❌</span>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition`}
                  placeholder="Enter password (min 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">❌</span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition`}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">❌</span>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 rounded-lg font-semibold 
                       hover:from-rose-600 hover:to-rose-700 transform hover:scale-[1.02] transition-all duration-200 
                       shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Admin Account
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an admin account?{' '}
              <Link href="/admin/login" className="text-rose-500 hover:text-rose-600 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>🔒 Admin accounts are secured with enterprise-level encryption</p>
        </div>
      </div>
    </div>
  );
}

export default AdminSignupPage;

