'use client'

import React, { useState, useRef } from 'react';
import Meta from '@/components/Meta';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Turnstile from '@/components/Turnstile';
import { signInWithEmailPassword } from '@/services/supabaseAuthService';
import { getUserProfileByUID } from '@/services/firebaseAuthApi';

// Use Turnstile (Cloudflare) component

// --- Icon Components ---
const MailIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

// --- SignInPage Component ---
function SignInPage({ onShowSignup, onShowForgot, isModal = false }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const turnstileRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Validation functions
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        return !isValidEmail ? 'Please enter a valid email address' : '';
      case 'password':
        if (!value) return 'Password is required';
        return value.length < 6 ? 'Password must be at least 6 characters' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {};
    ['email', 'password'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCaptchaChange = (token) => setCaptchaToken(token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) return;

    if (!captchaToken) {
      setMessage({ type: 'error', text: 'Please verify you are human' });
      return;
    }

    setIsLoading(true);

    try {
      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('userToken');

      const supabaseResult = await signInWithEmailPassword(formData.email, formData.password);

      if (supabaseResult.success) {
        try {
          const profile = await getUserProfileByUID(supabaseResult.uid);

          if (profile.success) {
            localStorage.setItem('userToken', supabaseResult.token);
            localStorage.setItem('userId', profile.data.userId);
            localStorage.setItem('supabaseUID', supabaseResult.uid);
            localStorage.setItem('userName', profile.data.name);
            localStorage.setItem('userRole', profile.data.role);

            const userData = {
              userId: profile.data.userId,
              supabaseUID: supabaseResult.uid,
              name: profile.data.name,
              role: profile.data.role,
              email: formData.email
            };
            localStorage.setItem('userData', JSON.stringify(userData));

            if (profile.data.role === 'admin') {
              router.push('/admin/account');
            } else {
              router.push('/account');
            }
          }
        } catch (profileError) {
          localStorage.setItem('userToken', supabaseResult.token);
          localStorage.setItem('supabaseUID', supabaseResult.uid);
          localStorage.setItem('supabaseEmail', supabaseResult.email);
          setMessage({ type: 'warning', text: 'Profile incomplete. Redirecting...' });
          router.push('/account/profile');
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Authentication failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper styles
  const inputContainerClass = "relative rounded-lg shadow-sm";
  const iconWrapperClass = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";
  const inputClass = (hasError) => `block w-full pl-11 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-offset-0 transition-all duration-200 text-base ${hasError ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 bg-red-50/50' : 'border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500 bg-white'}`;
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";
  const errorClass = "mt-1.5 ml-1 text-xs text-red-600 font-medium";

  return (
    <div className={`bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-center ${isModal ? 'min-h-0 py-3 sm:px-4' : 'min-h-screen py-12 sm:px-6 lg:px-8'}`}>
      <Meta title="Secure Login | Loanzaar" description="Securely access your Loanzaar financial dashboard." />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
            <Link href="/" className="inline-block">
                <img
                    src="/images/loanzaar--logo.avif"
                    alt="Loanzaar"
                    className="h-12 w-auto mx-auto mb-6 object-contain"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x50/f1f5f9/0f172a?text=Loanzaar'; }}
                />
            </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">
             Securely access your financial dashboard
          </p>
        </div>

        {/* Card */}
        <div className={`bg-white ${isModal ? 'py-4 px-4' : 'py-8 px-6'} shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-100`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <div className={inputContainerClass}>
                <div className={iconWrapperClass}><MailIcon /></div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClass(fieldErrors.email)}
                  placeholder="name@example.com"
                />
              </div>
              {fieldErrors.email && <p className={errorClass}>● {fieldErrors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 ml-1">Password</label>
                {onShowForgot ? (
                  <button type="button" onClick={onShowForgot} className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">Forgot password?</button>
                ) : (
                  <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">Forgot password?</Link>
                )}
              </div>
              <div className={inputContainerClass}>
                <div className={iconWrapperClass}><LockIcon /></div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={inputClass(fieldErrors.password)}
                  placeholder="Enter your password"
                />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && <p className={errorClass}>● {fieldErrors.password}</p>}
            </div>

            {/* Status Message */}
            {message && (
                <div className={`p-4 rounded-xl text-sm flex items-start gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {message.type === 'error' ? (
                       <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                       <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="space-y-4">
               {/* Turnstile */}
               <div className="flex justify-center transform scale-95 sm:scale-100">
                <div className="w-full max-w-[320px] mx-auto">
                    <Turnstile
                      ref={turnstileRef}
                      sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '6LdUpOsrAAAAAKqnWvFE0MH-mgcHo8BzFohUEB5b'}
                      onVerify={handleCaptchaChange}
                      onExpired={() => setCaptchaToken(null)}
                    />
                </div>
               </div>

               {/* Submit Button */}
               <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
               >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Verifying...
                    </span>
                ) : 'Sign In Securely'}
               </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-sm text-slate-500">
                New to Loanzaar?{' '}
                {onShowSignup ? (
                  <button type="button" onClick={onShowSignup} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">Create an account</button>
                ) : (
                  <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">Create an account</Link>
                )}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;