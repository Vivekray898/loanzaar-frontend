'use client'

import React, { useState, useRef } from 'react';
import Meta from '../components/Meta';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { resetPassword } from '../services/supabaseAuthService';

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false });

export default function ForgotPasswordPage({ onBackToSignin, isModal = false }) {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [currentStep, setCurrentStep] = useState(1); // 1: Request Reset, 2: Check Email
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [formData, setFormData] = useState({ email: '' });

  const validateField = (fieldName, value) => {
    if (fieldName === 'email') {
      if (!value.trim()) return 'Email address is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
      return '';
    }
    return '';
  };

  const validateStep1 = () => {
    const error = validateField('email', formData.email);
    if (error) {
      setFieldErrors({ email: error });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateStep1()) return;

    if (!captchaToken) {
      setMessage({
        type: 'error',
        text: 'Please complete the reCAPTCHA verification.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(formData.email.trim());

      if (response.success) {
        setMessage({
          type: 'success',
          text: `Reset link sent to ${formData.email}.`
        });
        setCurrentStep(2);
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Failed to send reset link. Try again.'
        });
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Network error. Try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    if (onBackToSignin) return onBackToSignin();
    navigate('/signin');
  };

  const resendResetEmail = async () => {
    setIsLoading(true);
    try {
      const response = await resetPassword(formData.email.trim());
      if (response.success) {
        setMessage({ type: 'success', text: 'Link resent successfully.' });
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to resend.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to resend. Try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col justify-center bg-slate-50 ${isModal ? 'min-h-0 py-3 sm:px-4' : 'min-h-screen py-12 sm:px-6 lg:px-8'}`}>
      <Meta title="Reset Password | Loanzaar" description="Recover your account access." />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
            <img
                className="h-10 w-auto"
                src="/images/loanzaar--logo.avif"
                alt="Loanzaar"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x50/f1f5f9/0f172a?text=Loanzaar'; }}
            />
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
            {currentStep === 1 ? 'Forgot Password?' : 'Check Your Mail'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
             {currentStep === 1 ? 'No worries, we\'ll send you reset instructions.' : `We sent a link to ${formData.email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`bg-white ${isModal ? 'py-4 px-4' : 'py-8 px-6'} shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-100`}>
          
          {currentStep === 1 && (
            <form onSubmit={handleSendResetEmail} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`block w-full pl-11 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-offset-0 transition-all text-base ${fieldErrors.email ? 'border-red-300 focus:ring-red-500 bg-red-50/50' : 'border-slate-200 focus:ring-rose-500 bg-white'}`}
                        placeholder="Enter your email"
                    />
                </div>
                {fieldErrors.email && <p className="mt-1.5 ml-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>}
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-sm flex items-start gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    <span>{message.text}</span>
                </div>
              )}

              <div className="flex justify-center transform scale-95 sm:scale-100">
                <div className="w-full max-w-[320px] mx-auto">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LdUpOsrAAAAAKqnWvFE0MH-mgcHo8BzFohUEB5b"
                    onChange={handleCaptchaChange}
                    onExpired={() => setCaptchaToken(null)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-rose-500/20 text-base font-semibold text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Sending...' : 'Reset Password'}
              </button>
            </form>
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              
              <div className="text-sm text-slate-600">
                 <p>Did not receive the email? Check your spam filter.</p>
              </div>

              {message && (
                 <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {message.text}
                 </div>
              )}

              <div className="flex flex-col gap-3">
                  <button
                    onClick={resendResetEmail}
                    disabled={isLoading}
                    className="w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                  >
                    {isLoading ? 'Resending...' : 'Click to Resend'}
                  </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-sm text-slate-500">
                Remember your password?{' '}
                <button 
                  onClick={handleBackToSignIn} 
                  className="font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Back to Sign In
                </button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}