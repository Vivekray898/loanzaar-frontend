'use client'

import React, { useState, useRef } from 'react';
import Meta from '../components/Meta';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false });
import { signInWithEmailPassword } from '../services/supabaseAuthService';
import { getUserProfileByUID, createOrUpdateUserProfile } from '../services/firebaseAuthApi';

// SignInPage Component
function SignInPage() {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Validation functions
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'email':
        if (!value.trim()) return 'Email is required';

        // Check if it's a valid email
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

        if (!isValidEmail) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {};
    const fields = ['email', 'password'];

    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    console.log('✅ reCAPTCHA token received:', token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    // CAPTCHA validation
    if (!captchaToken) {
      setMessage({ type: 'error', text: 'Please complete the reCAPTCHA verification by checking the "I\'m not a robot" box' });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Clear any old tokens first
      console.log('🧹 Clearing old tokens...');
      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('userToken');

      // Step 2: Sign in with Supabase
      console.log('🔐 Signing in via Supabase...');
      const supabaseResult = await signInWithEmailPassword(formData.email, formData.password);

      if (supabaseResult.success) {
        console.log('✅ Supabase sign-in successful, UID:', supabaseResult.uid);
        console.log('🔑 Fresh token received, length:', supabaseResult.token.length);
        setMessage({ type: 'success', text: 'Sign in successful! Fetching your profile...' });

        // Step 3: Get or create user profile in MongoDB
        try {
          console.log('👤 Fetching user profile from MongoDB...');
          const profile = await getUserProfileByUID(supabaseResult.uid);

          if (profile.success) {
            console.log('✅ Profile found:', profile.data.userId);

            // Store fresh tokens and user data
            console.log('💾 Storing fresh token and user data...');
            localStorage.setItem('userToken', supabaseResult.token); // For UserAuthContext
            localStorage.setItem('userId', profile.data.userId);
            localStorage.setItem('supabaseUID', supabaseResult.uid);
            localStorage.setItem('userName', profile.data.name);
            localStorage.setItem('userRole', profile.data.role);

            // Store userData object for UserAuthContext
            const userData = {
              userId: profile.data.userId,
              supabaseUID: supabaseResult.uid,
              name: profile.data.name,
              role: profile.data.role,
              email: formData.email
            };
            localStorage.setItem('userData', JSON.stringify(userData));

            console.log('✅ Token and user data stored successfully');

            // Role-based redirection
            if (profile.data.role === 'admin') {
              console.log('✅ Admin user, redirecting to admin dashboard');
              router.push('/admin/dashboard');
            } else {
              console.log('✅ Regular user, redirecting to user dashboard');
              router.push('/dashboard');
            }
          }
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
          // Store token even if profile fetch fails - user may not have completed profile yet
          localStorage.setItem('userToken', supabaseResult.token); // For UserAuthContext
          localStorage.setItem('supabaseUID', supabaseResult.uid);
          localStorage.setItem('supabaseEmail', supabaseResult.email);

          setMessage({
            type: 'warning',
            text: 'Profile not found. Please complete your profile setup. Redirecting to profile page...'
          });

          // Redirect to dashboard profile page (where they can complete their profile)
          console.log('🔄 Redirecting to profile page');
          router.push('/dashboard/profile');
        }
      }
    } catch (error) {
      console.error('❌ Supabase sign-in error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to sign in. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 font-sans">
      <Meta title="Login | Loanzaar" description="Access your Loanzaar account securely to manage loans and updates." />
      <div className="flex justify-center min-h-screen">
        {/* Background Image/Branding Section */}
        <div
          className="hidden bg-cover lg:block lg:w-2/3"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop)' }}
        >
          <div className="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
            <div>
              <h2 className="text-4xl font-bold text-white">Welcome Back</h2>
              <p className="max-w-xl mt-3 text-gray-200">
                Your trusted partner in financial solutions. Access your account to manage loans, track applications, and explore personalized financial options.
              </p>
            </div>
          </div>
        </div>

        {/* Sign In Form Section */}
        <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-1/3">
          <div className="flex-1">
            <div className="text-center">
              <img
                src="/images/loanzaar--logo.avif"
                alt="RU LOANS Logo"
                className="w-auto h-10 sm:h-12 mx-auto"
              />
              <p className="mt-3 text-gray-500">Sign in to access your account</p>
            </div>

            <div className="mt-8">
              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-semibold text-slate-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={`block w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                      }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      ❌ {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="mt-6">
                  <div className="flex justify-between mb-2">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password *</label>
                    <Link href="/forgot-password" className="text-sm text-rose-500 focus:outline-none focus:underline hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`block w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition pr-10 ${fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-700 transition"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      ❌ {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Message display */}
                {message && (
                  <div className={`mt-4 text-sm font-medium text-center p-3 rounded-lg border ${message.type === 'error' ? 'text-red-800 bg-red-100 border-red-300' : 'text-green-800 bg-green-100 border-green-300'}`}>
                    {message.text}
                  </div>
                )}

                <div className="my-6">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LdUpOsrAAAAAKqnWvFE0MH-mgcHo8BzFohUEB5b"
                    onChange={handleCaptchaChange}
                    onExpired={() => setCaptchaToken(null)}
                  />
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading || Object.keys(fieldErrors).length > 0}
                    className="w-full px-4 py-2.5 tracking-wide text-white transition-all duration-300 transform bg-rose-500 rounded-lg hover:bg-rose-600 focus:outline-none focus:bg-rose-600 focus:ring focus:ring-rose-300 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 font-semibold"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-sm text-center text-gray-400">
                Don't have an account yet?{' '}
                <Link href="/signup" className="text-rose-500 focus:outline-none focus:underline hover:underline">
                  Sign up
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <div>
      <main>
        <SignInPage />
      </main>
    </div>
  );
}


