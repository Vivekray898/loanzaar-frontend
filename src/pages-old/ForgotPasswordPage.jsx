'use client'

import React, { useState, useRef } from 'react';
import Meta from '../components/Meta';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false });
import { resetPassword } from '../services/firebaseAuthService';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [currentStep, setCurrentStep] = useState(1); // 1: Request Reset, 2: Check Email
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    email: ''
  });

  // Validation functions
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    console.log('✅ reCAPTCHA token received');
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validate email field
    if (!validateStep1()) {
      return;
    }

    // CAPTCHA validation
    if (!captchaToken) {
      setMessage({ 
        type: 'error', 
        text: 'Please complete the reCAPTCHA verification by checking the "I\'m not a robot" box' 
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call Firebase to send password reset email
      const response = await resetPassword(formData.email.trim());
      
      if (response.success) {
        console.log('✅ Password reset email sent to:', formData.email);
        setMessage({ 
          type: 'success', 
          text: `Password reset link sent to ${formData.email}. Please check your email and spam folder.` 
        });
        setResetEmailSent(true);
        setCurrentStep(2);
      } else {
        console.error('❌ Failed to send reset email:', response.error);
        setMessage({ 
          type: 'error', 
          text: response.error || 'Failed to send password reset email. Please try again.' 
        });
      }

    } catch (error) {
      console.error('❌ Error sending reset email:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate('/signin');
  };

  const resendResetEmail = async () => {
    setIsLoading(true);
    try {
      const response = await resetPassword(formData.email.trim());
      
      if (response.success) {
        console.log('✅ Password reset email resent');
        setMessage({ 
          type: 'success', 
          text: 'Password reset link resent. Please check your email.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: response.error || 'Failed to resend email.'
        });
      }
    } catch (error) {
      console.error('❌ Resend error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to resend. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-screen">
      <Meta 
        title="Forgot Password - Reset Account | Loanzaar" 
        description="Reset your Loanzaar account password securely. Enter your email and we'll send you a password reset link."
      />
      <div className="flex justify-center min-h-screen">
        {/* Background Section */}
        <div className="hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 lg:block lg:w-2/3">
          <div className="flex items-center h-full px-20">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Reset Your Password</h2>
              <p className="max-w-xl mt-3 text-gray-600">
                Securely reset your password with Firebase. We'll send you a password reset link to your email address.
              </p>

              {/* Progress Indicator */}
              <div className="mt-8">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    1
                  </div>
                  <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    2
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Enter Email</span>
                  <span>Check Email</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
          <div className="flex-1">
            <div className="text-center">
              <Link href="/" className="flex justify-center mx-auto">
                <img
                  className="w-auto h-7 sm:h-8"
                  src="/Loanzaar-logo.png"
                  alt="Loanzaar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect width=%2240%22 height=%2240%22 fill=%22%23ef4444%22></rect><text x=%2210%22 y=%2226%22 font-size=%2210%22 fill=%22white%22>LO</text></svg>';
                  }}
                />
              </Link>
              <p className="mt-3 text-gray-500">
                {currentStep === 1 && 'Enter your email address to receive a password reset link'}
                {currentStep === 2 && 'Check your email for the password reset link'}
              </p>
            </div>

            <div className="mt-8">
              {/* Step 1: Send Reset Email */}
              {currentStep === 1 && (
                <form onSubmit={handleSendResetEmail}>
                  <div className="space-y-4">
                    {/* Email Address */}
                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-semibold text-slate-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className={`block w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${
                          fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          ❌ {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Message display */}
                    {message && (
                      <div className={`text-sm font-medium text-center p-3 rounded-lg border ${message.type === 'error' ? 'text-red-800 bg-red-100 border-red-300' : 'text-green-800 bg-green-100 border-green-300'}`}>
                        {message.text}
                      </div>
                    )}

                    <div className="my-4">
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
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 tracking-wide text-white transition-all duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 focus:ring focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-semibold"
                      >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </div>

                    <p className="text-center text-sm text-slate-600 mt-4">
                      Remember your password? <Link href="/signin" className="text-blue-500 font-semibold hover:underline">Sign in</Link>
                    </p>
                  </div>
                </form>
              )}

              {/* Step 2: Check Email */}
              {currentStep === 2 && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Check Your Email</h3>
                    <p className="text-slate-600 mt-2">
                      We've sent a password reset link to <span className="font-semibold text-slate-800">{formData.email}</span>
                    </p>
                    <p className="text-slate-600 text-sm mt-3">
                      Please check your email (and spam folder) and click the reset link to set your new password.
                    </p>
                  </div>

                  {message && (
                    <div className={`text-sm font-medium p-3 rounded-lg border ${message.type === 'error' ? 'text-red-800 bg-red-100 border-red-300' : 'text-green-800 bg-green-100 border-green-300'}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="space-y-3 pt-4">
                    <button
                      onClick={resendResetEmail}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 tracking-wide text-blue-600 transition-all duration-300 border-2 border-blue-500 rounded-lg hover:bg-blue-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                    >
                      {isLoading ? 'Sending...' : 'Didn\'t receive the email? Resend'}
                    </button>
                    <button
                      onClick={handleBackToSignIn}
                      className="w-full px-4 py-2.5 tracking-wide text-white transition-all duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 shadow-md hover:shadow-lg font-semibold"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

