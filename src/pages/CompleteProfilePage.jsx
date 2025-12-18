'use client'

import React, { useEffect, useState } from 'react';
import Meta from '../components/Meta';
import { useRouter } from 'next/navigation';
import { createOrUpdateUserProfile } from '../services/firebaseAuthApi';

const CompleteProfilePage = () => {
  const router = useRouter();
  const [status, setStatus] = useState('form');
  const [message, setMessage] = useState('');
  const [supabaseUID, setSupabaseUID] = useState('');
  const [supabaseEmail, setSupabaseEmail] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    income: '',
    occupation: ''
  });

  useEffect(() => {
    // Get Firebase UID and Email from localStorage (set during signin)
    const uid = localStorage.getItem('supabaseUID');
    const email = localStorage.getItem('supabaseEmail');
    
    if (!uid || !email) {
      setStatus('error');
      setMessage('Session expired. Please sign in again.');
      setTimeout(() => router.push('/signin'), 3000);
      return;
    }
    
    setSupabaseUID(uid);
    setSupabaseEmail(email);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!formData.age) return 'Age is required';
    if (!formData.gender) return 'Gender is required';
    if (!formData.income) return 'Income is required';
    if (!formData.occupation.trim()) return 'Occupation is required';
    return '';
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      setStatus('processing');
      setMessage('Creating your profile...');

      // Create profile in MongoDB
      const profileData = {
        supabaseUID: supabaseUID,
        email: supabaseEmail,
        ...formData
      };

      console.log('📝 Creating profile with data:', profileData);
      const response = await createOrUpdateUserProfile(profileData);

      if (response.success) {
        console.log('✅ Profile created successfully');
        setStatus('success');
        setMessage('Profile created successfully! Redirecting to dashboard...');
        
        // Store user data
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userName', response.data.name);
        localStorage.setItem('userData', JSON.stringify(response.data));
        
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          console.log('🔄 Redirecting to dashboard');
          router.push('/dashboard');
        }, 1500);
      } else {
        setStatus('error');
        setMessage(response.message || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to create profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <Meta 
        title="Complete Your Profile - Loanzaar" 
        description="Complete your profile to access your Loanzaar account."
      />
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-sm">
            Please provide your details to get started
          </p>
        </div>

        {status === 'processing' && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-600 font-semibold">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{message}</p>
            {message.includes('Session expired') && (
              <button 
                onClick={() => router.push('/signin')}
                className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Return to Sign In
              </button>
            )}
          </div>
        )}

        {status === 'form' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Email Display (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input 
                type="email"
                value={supabaseEmail}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input 
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter your age"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Income *
              </label>
              <select 
                name="income"
                value={formData.income}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Income Range</option>
                <option value="0-3lakh">₹0 - 3 Lakhs</option>
                <option value="3-5lakh">₹3 - 5 Lakhs</option>
                <option value="5-10lakh">₹5 - 10 Lakhs</option>
                <option value="10-25lakh">₹10 - 25 Lakhs</option>
                <option value="25+lakh">₹25+ Lakhs</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation *
              </label>
              <input 
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                placeholder="Enter your occupation"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Error Message */}
            {message && status === 'form' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Complete Profile
            </button>

            <p className="text-center text-xs text-gray-500">
              Your information is secure and won't be shared
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompleteProfilePage;

