'use client'

import React, { useState, useRef } from 'react';
import Meta from '../components/Meta';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Turnstile from '../components/Turnstile';
import { signUpWithEmailPassword } from '../services/supabaseAuthService';
import { createOrUpdateUserProfile } from '../services/firebaseAuthApi';

// Use Turnstile (Cloudflare) component

// --- Icons ---
const UserIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const PhoneIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
const MailIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const LockIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);

function SignUpPage({ onShowSignin, isModal = false }) {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '',
    password: '', confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const turnstileRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Validation Logic
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'At least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only letters allowed';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone required';
        if (!/^[6-9]\d{9}$/.test(value)) return '10 digits starting 6-9';
        return '';
      case 'email':
        if (!value.trim()) return 'Email required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
        return '';
      case 'password':
        if (!value) return 'Required';
        if (value.length < 8) return 'Min 8 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Required';
        if (value !== formData.password) return 'Passwords mismatch';
        return '';
      default: return '';
    }
  };

  const validateForm = () => {
    const errors = {};
    const fields = ['name', 'phone', 'email', 'password', 'confirmPassword'];
    fields.forEach(field => {
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

  const handleCaptchaChange = (token) => {
    console.debug('Turnstile token received:', token);
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors highlighted below.' });
      return;
    }
    if (!captchaToken) {
      setMessage({ type: 'error', text: 'Please verify you are not a robot.' });
      return;
    }

    setIsLoading(true);
    try {
      console.debug('Submitting signup', { email: formData.email, captchaToken });
      const firebaseResult = await signUpWithEmailPassword(formData.email, formData.password, {
        name: formData.name, phone: formData.phone
      });
      console.debug('Supabase signup result:', firebaseResult);

      if (firebaseResult.success) {
        setFirebaseUser(firebaseResult.user);
        setCurrentStep(2);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Signup caught error (client):', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create account.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const profileData = {
        supabaseUID: firebaseUser.uid,
        name: formData.name, email: formData.email, phone: formData.phone
      };
      const response = await createOrUpdateUserProfile(profileData);

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile completed! Redirecting to sign in...' });
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('supabaseUID', response.data.supabaseUID);
        setTimeout(() => {
          if (isModal && onShowSignin) onShowSignin();
          else navigate('/signin');
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to complete profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper styles
  const inputContainerClass = "relative rounded-lg shadow-sm";
  const iconWrapperClass = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";
  const inputClass = (hasError) => `block w-full pl-11 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-offset-0 transition-all duration-200 text-base ${
    hasError 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
      : 'border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 bg-white'
  }`;
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";
  const errorClass = "mt-1.5 ml-1 text-xs text-red-600 flex items-center gap-1 font-medium";

  return (
    <div className={`bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-center ${isModal ? 'min-h-0 py-3 sm:px-4' : 'min-h-screen py-6 sm:px-6 lg:px-8'}`}>
      <Meta title="Sign Up | Loanzaar" description="Securely create your banking account." />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
            <Link href="/" className="inline-block">
                 <img
                  src="/images/loanzaar--logo.avif"
                  alt="Loanzaar"
                  className="h-10 w-auto mx-auto mb-4 object-contain"
                  onError={(e) => {
                     e.target.onerror = null;
                     e.target.src = 'https://placehold.co/150x50/f1f5f9/0f172a?text=Loanzaar';
                  }}
                />
            </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentStep === 1 ? 'Create Account' : 'Verify Identity'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
             {currentStep === 1 ? 'Start your financial journey today.' : 'One step away from securing your future.'}
          </p>
        </div>

        {/* Card Container */}
        <div className={`bg-white ${isModal ? 'py-4 px-4' : 'py-8 px-6'} shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-100`}>
            
            {/* --- STEP 1: Main Sign Up Form --- */}
            {currentStep === 1 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Personal Info Group */}
                <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                        <label className={labelClass}>Full Name</label>
                        <div className={inputContainerClass}>
                            <div className={iconWrapperClass}><UserIcon /></div>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ex. John Doe" className={inputClass(fieldErrors.name)} />
                        </div>
                        {fieldErrors.name && <p className={errorClass}>● {fieldErrors.name}</p>}
                        </div>

                        <div>
                        <label className={labelClass}>Mobile Number</label>
                        <div className={inputContainerClass}>
                            <div className={iconWrapperClass}><PhoneIcon /></div>
                            <input type="tel" name="phone" maxLength="10" value={formData.phone} onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setFormData(prev => ({...prev, phone: val}));
                            if(fieldErrors.phone) setFieldErrors(prev => ({...prev, phone: ''}));
                            }} placeholder="10-digit mobile" className={inputClass(fieldErrors.phone)} />
                        </div>
                        {fieldErrors.phone && <p className={errorClass}>● {fieldErrors.phone}</p>}
                        </div>
                    </div>

                  <div>
                    <label className={labelClass}>Email Address</label>
                    <div className={inputContainerClass}>
                       <div className={iconWrapperClass}><MailIcon /></div>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" className={inputClass(fieldErrors.email)} />
                    </div>
                    {fieldErrors.email && <p className={errorClass}>● {fieldErrors.email}</p>}
                  </div>
                </div>

                {/* Security Group */}
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Password</label>
                    <div className={inputContainerClass}>
                      <div className={iconWrapperClass}><LockIcon /></div>
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="Min 8 chars" className={inputClass(fieldErrors.password)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? (
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        ) : (
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {fieldErrors.password && <p className={errorClass}>● {fieldErrors.password}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <div className={inputContainerClass}>
                      <div className={iconWrapperClass}><LockIcon /></div>
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Retype password" className={inputClass(fieldErrors.confirmPassword)} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                         {showConfirmPassword ? (
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        ) : (
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className={errorClass}>● {fieldErrors.confirmPassword}</p>}
                  </div>
                </div>

                {message && message.type === 'error' && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{message.text}</span>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex justify-center mb-6 transform scale-95 sm:scale-100">
                    <div className="w-full max-w-[320px] mx-auto">
                      <Turnstile
                        ref={turnstileRef}
                        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '6LdUpOsrAAAAAKqnWvFE0MH-mgcHo8BzFohUEB5b'}
                        onVerify={handleCaptchaChange}
                        onExpired={() => setCaptchaToken(null)}
                      />
                    </div>
                  </div>
                  
                  <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing...
                      </span>
                    ) : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            {/* --- STEP 2: Email Verification --- */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 text-center">
                   <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto text-blue-600">
                      <MailIcon />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Check Your Inbox</h3>
                   <p className="text-slate-600 text-sm mb-4">We've sent a verification link to <span className="font-semibold text-slate-900">{formData.email}</span></p>
                   <p className="text-slate-500 text-xs">Click the link in the email to activate your account.</p>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-center"><span className="px-4 bg-white text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Pending</span></div>
                </div>

                <form onSubmit={handleCompleteProfile} className="space-y-4">
                  <div>
                    <label className={labelClass}>Confirm Name</label>
                    <input type="text" name="name" value={formData.name} readOnly className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm" />
                  </div>
                  
                  <div>
                     <label className={labelClass}>Confirm Phone</label>
                     <input type="text" name="phone" value={formData.phone} readOnly className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm" />
                  </div>

                  {message && (
                    <div className={`p-4 rounded-xl text-sm flex items-start gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                       <span>{message.text}</span>
                    </div>
                  )}

                  <button type="submit" disabled={isLoading} className="w-full mt-4 flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-200">
                    {isLoading ? 'Completing Setup...' : 'I\'ve Verified My Email'}
                  </button>
                </form>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                {onShowSignin ? (
                  <button type="button" onClick={onShowSignin} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">Sign in</button>
                ) : (
                  <Link href="/signin" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">Sign in</Link>
                )}
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;