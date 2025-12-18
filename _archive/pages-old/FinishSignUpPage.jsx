'use client'

import React, { useEffect, useState, Suspense } from 'react';
import Meta from '../components/Meta';
import { useRouter } from 'next/navigation';
import { completeSignInWithEmailLink } from '../services/supabaseAuthService';
import { createOrUpdateUserProfile } from '../services/firebaseAuthApi';

const FinishSignUpPageContent = () => {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing sign-in...');
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    income: '',
    occupation: ''
  });
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    handleEmailLinkSignIn();
  }, []);

  const handleEmailLinkSignIn = async () => {
    try {
      // Get email from localStorage
      let email = window.localStorage.getItem('emailForSignIn');
      
      // If email is not in localStorage, prompt user
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }

      if (!email) {
        setStatus('error');
        setMessage('Email is required to complete sign-in');
        return;
      }

      // Get the full URL including query parameters
      const emailLink = window.location.href;

      // Complete sign-in with email link
      const result = await completeSignInWithEmailLink(email, emailLink);

      if (result.success) {
        setFirebaseUser(result.user);
        
        // Check if this is a new user
        if (result.isNewUser) {
          setStatus('needs-profile');
          setMessage('Please complete your profile');
          setShowProfileForm(true);
        } else {
          // Existing user - redirect to dashboard
          setStatus('success');
          setMessage('Sign-in successful! Redirecting...');
          
          // Store token if needed (keep Supabase-managed session via `userToken` elsewhere)
          localStorage.setItem('supabaseUID', result.uid);
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Email link sign-in error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to complete sign-in. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setStatus('processing');
      setMessage('Creating your profile...');

      // Create profile in MongoDB
      const profileData = {
        supabaseUID: firebaseUser.uid,
        email: firebaseUser.email,
        ...formData
      };

      const response = await createOrUpdateUserProfile(profileData);

      if (response.success) {
        setStatus('success');
        setMessage('Profile created successfully! Redirecting...');
        
        // Store supabase UID locally
        localStorage.setItem('supabaseUID', response.data.supabaseUID || firebaseUser.uid);
        localStorage.setItem('userId', response.data.userId);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to create profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <Meta 
        title="Complete Sign Up - Loanzaar" 
        description="Finish setting up your Loanzaar account and start exploring financial products."
      />
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {showProfileForm ? 'Complete Your Profile' : 'Finishing Sign-In'}
          </h1>
          
          {status === 'processing' && (
            <div className="flex items-center justify-center mt-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          <p className={`mt-4 text-lg ${
            status === 'error' ? 'text-red-600' : 
            status === 'success' ? 'text-green-600' : 
            'text-gray-600'
          }`}>
            {message}
          </p>
        </div>

        {showProfileForm && status === 'needs-profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10-digit mobile number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="18"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Income
              </label>
              <select
                name="income"
                value={formData.income}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Income Range</option>
                <option value="<₹2L">Less than ₹2 Lakhs</option>
                <option value="₹2-5L">₹2-5 Lakhs</option>
                <option value="₹5-10L">₹5-10 Lakhs</option>
                <option value=">₹10L">More than ₹10 Lakhs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation
              </label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Occupation</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Student">Student</option>
                <option value="Retired">Retired</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              Complete Profile
            </button>
          </form>
        )}

        {status === 'error' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/signin')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function FinishSignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <FinishSignUpPageContent />
    </Suspense>
  );
}

