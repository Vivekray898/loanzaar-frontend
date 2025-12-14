'use client'

import React, { useState, useRef } from 'react';
import Meta from '../components/Meta';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import { signUpWithEmailPassword } from '../services/supabaseAuthService';
import { createOrUpdateUserProfile } from '../services/firebaseAuthApi';

// SignUpPage Component
function SignUpPage() {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', age: '', gender: '',
    income: '', occupation: '', password: '', confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Sign Up Form, 2: Email Verification
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Validation functions
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Full name must contain only letters';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[6-9]\d{9}$/.test(value)) return 'Phone must be exactly 10 digits starting with 6-9';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'age':
        if (!value.trim()) return 'Age is required';
        const ageNum = parseInt(value, 10);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) return 'Age must be between 18 and 100';
        return '';
      case 'gender':
        if (!value) return 'Gender is required';
        return '';
      case 'income':
        if (!value) return 'Annual income is required';
        return '';
      case 'occupation':
        if (!value) return 'Occupation is required';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Confirm password is required';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {};
    const fields = ['name', 'phone', 'email', 'age', 'gender', 'income', 'occupation', 'password', 'confirmPassword'];
    
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
      setMessage({ type: 'error', text: 'Please fix the errors above and try again.' });
      return;
    }

    // CAPTCHA validation
    if (!captchaToken) {
      setMessage({ type: 'error', text: 'Please complete the reCAPTCHA verification by checking the "I\'m not a robot" box' });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create Firebase user with email and password
      console.log('📧 Creating Firebase user...');
      const firebaseResult = await signUpWithEmailPassword(formData.email, formData.password);
      
      if (firebaseResult.success) {
        setFirebaseUser(firebaseResult.user);
        setCurrentStep(2);
        setMessage({ 
          type: 'success', 
          text: `✅ Account created! Verification email sent to ${formData.email}. Please check your inbox and click the verification link.` 
        });
        console.log('✅ Firebase user created:', firebaseResult.user.uid);
      }
    } catch (error) {
      console.error('Firebase signup error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      // Step 2: Create user profile in MongoDB after Firebase signup
      console.log('💾 Creating user profile in MongoDB...');
      
      const profileData = {
        firebaseUID: firebaseUser.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || '',
        income: formData.income || '',
        occupation: formData.occupation || ''
      };

      const response = await createOrUpdateUserProfile(profileData);

      if (response.success) {
        console.log('✅ Profile created in MongoDB:', response.data.userId);
        setMessage({ type: 'success', text: 'Profile completed successfully! Redirecting to sign in...' });
        
        // Store tokens
        localStorage.setItem('firebaseToken', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('firebaseUID', response.data.firebaseUID);
        
        // Redirect to signin after 2 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to complete profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 font-sans">
      <Meta title="Sign Up | Loanzaar" description="Create a Loanzaar account to apply for loans and insurance with a streamlined process." />
      <div className="flex justify-center min-h-screen">
        {/* Background Image/Branding Section */}
        <div 
          className="hidden bg-cover lg:block lg:w-1/2" 
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop)' }}
        >
          <div className="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
            <div>
              <h2 className="text-4xl font-bold text-white">Join Us Today</h2>
              <p className="max-w-xl mt-3 text-gray-200">
                Create your account to unlock access to personalized financial solutions and start your journey towards better financial management.
              </p>
            </div>
          </div>
        </div>

        {/* Sign Up Form Section */}
        <div className="flex items-center w-full max-w-xl px-6 mx-auto lg:w-1/2">
          <div className="flex-1 py-12">
            <div className="text-center">
               <img
                  src="https://placehold.co/180x50/ef4444/white?text=RU+LOANS"
                  alt="RU LOANS Logo"
                  className="w-auto h-10 sm:h-12 mx-auto"
                />
              <p className="mt-3 text-gray-500">
                {currentStep === 1 ? 'Create your free account' : 'Verify your email'}
              </p>
            </div>

            <div className="mt-8">
              {/* Step 1: Sign Up Form */}
              {currentStep === 1 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block mb-2 text-sm font-semibold text-slate-700">Full Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        id="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        placeholder="John Doe" 
                        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                          fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block mb-2 text-sm font-semibold text-slate-700">Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        id="phone" 
                        inputMode="numeric"
                        maxLength="10"
                        value={formData.phone} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData(prev => ({ ...prev, phone: value }));
                          if (fieldErrors.phone) {
                            setFieldErrors(prev => ({ ...prev, phone: '' }));
                          }
                        }}
                        placeholder="10-digit number" 
                        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                          fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                      />
                      {fieldErrors.phone && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-semibold text-slate-700">Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      id="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="you@example.com" 
                      className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                        fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.email}</p>
                    )}
                  </div>
                  
                  {/* Age & Gender */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="age" className="block mb-2 text-sm font-semibold text-slate-700">Age *</label>
                      <input 
                        type="number" 
                        name="age" 
                        id="age" 
                        inputMode="numeric"
                        value={formData.age} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData(prev => ({ ...prev, age: value }));
                          if (fieldErrors.age) {
                            setFieldErrors(prev => ({ ...prev, age: '' }));
                          }
                        }}
                        placeholder="18-100" 
                        min="18" 
                        max="100"
                        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                          fieldErrors.age ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                      />
                      {fieldErrors.age && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.age}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="gender" className="block mb-2 text-sm font-semibold text-slate-700">Gender *</label>
                      <select 
                        name="gender" 
                        id="gender" 
                        value={formData.gender} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                          fieldErrors.gender ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {fieldErrors.gender && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.gender}</p>
                      )}
                    </div>
                  </div>

                  {/* Income & Occupation */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="income" className="block mb-2 text-sm font-semibold text-slate-700">Annual Income *</label>
                      <select 
                        name="income" 
                        id="income" 
                        value={formData.income} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                          fieldErrors.income ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                      >
                        <option value="">Select Income</option>
                        <option value="<₹2L">Under ₹2 Lakhs</option>
                        <option value="₹2-5L">₹2-5 Lakhs</option>
                        <option value="₹5-10L">₹5-10 Lakhs</option>
                        <option value=">₹10L">Above ₹10 Lakhs</option>
                      </select>
                      {fieldErrors.income && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.income}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="occupation" className="block mb-2 text-sm font-semibold text-slate-700">Occupation *</label>
                      <select 
                        name="occupation" 
                        id="occupation" 
                        value={formData.occupation} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                          fieldErrors.occupation ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                      >
                        <option value="">Select Occupation</option>
                        <option value="Salaried">Salaried</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Student">Student</option>
                        <option value="Retired">Retired</option>
                        <option value="Other">Other</option>
                      </select>
                      {fieldErrors.occupation && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.occupation}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-semibold text-slate-700">Password *</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          name="password" 
                          id="password" 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          placeholder="Min 8 characters" 
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition pr-10 ${
                            fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
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
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.password}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block mb-2 text-sm font-semibold text-slate-700">Confirm Password *</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword" 
                          id="confirmPassword" 
                          value={formData.confirmPassword} 
                          onChange={handleInputChange} 
                          placeholder="Confirm password" 
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition pr-10 ${
                            fieldErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                        >
                          {showConfirmPassword ? (
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
                      {fieldErrors.confirmPassword && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {message && (
                    <div className={`text-sm font-medium text-center p-3 rounded-lg ${message.type === 'error' ? 'text-red-800 bg-red-100 border border-red-300' : 'text-green-800 bg-green-100 border border-green-300'}`}>
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

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full px-4 py-2.5 tracking-wide text-white transition-all duration-300 transform bg-rose-500 rounded-lg hover:bg-rose-600 focus:outline-none focus:bg-rose-600 focus:ring focus:ring-rose-300 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 font-semibold"
                    >
                      {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Email Verification Confirmation */}
              {currentStep === 2 && (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg className="w-16 h-16 mx-auto text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Check Your Email</h3>
                    <p className="text-slate-600 mb-4">
                      We've sent a verification link to <span className="font-semibold">{formData.email}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      ✅ Click the link in your email to verify your account.<br/>
                      ✅ Once verified, you can complete your profile below.
                    </p>
                  </div>

                  <form onSubmit={handleCompleteProfile} className="space-y-4 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-slate-800">Complete Your Profile</h4>
                    <p className="text-sm text-slate-600">Fill in your details to finish setting up your account:</p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-semibold text-slate-700">Full Name *</label>
                        <input 
                          type="text"
                          name="name" 
                          id="name" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                          placeholder="Your full name" 
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                            fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                          required
                        />
                        {fieldErrors.name && (
                          <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block mb-2 text-sm font-semibold text-slate-700">Phone Number *</label>
                        <input 
                          type="tel"
                          name="phone" 
                          id="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                          placeholder="10-digit mobile number" 
                          maxLength="10"
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                            fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                          required
                        />
                        {fieldErrors.phone && (
                          <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="age" className="block mb-2 text-sm font-semibold text-slate-700">Age</label>
                        <input 
                          type="number"
                          name="age" 
                          id="age" 
                          value={formData.age} 
                          onChange={handleInputChange} 
                          placeholder="Your age" 
                          min="18"
                          max="100"
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                            fieldErrors.age ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                        />
                        {fieldErrors.age && (
                          <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.age}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="gender" className="block mb-2 text-sm font-semibold text-slate-700">Gender</label>
                        <select 
                          name="gender" 
                          id="gender" 
                          value={formData.gender} 
                          onChange={handleInputChange} 
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                            fieldErrors.gender ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {fieldErrors.gender && (
                          <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.gender}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="income" className="block mb-2 text-sm font-semibold text-slate-700">Annual Income</label>
                        <select 
                          name="income" 
                          id="income" 
                          value={formData.income} 
                          onChange={handleInputChange} 
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                            fieldErrors.income ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                        >
                          <option value="">Select Income</option>
                          <option value="<₹2L">Under ₹2 Lakhs</option>
                          <option value="₹2-5L">₹2-5 Lakhs</option>
                          <option value="₹5-10L">₹5-10 Lakhs</option>
                          <option value=">₹10L">Above ₹10 Lakhs</option>
                        </select>
                        {fieldErrors.income && (
                          <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.income}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="occupation" className="block mb-2 text-sm font-semibold text-slate-700">Occupation</label>
                        <select 
                          name="occupation" 
                          id="occupation" 
                          value={formData.occupation} 
                          onChange={handleInputChange} 
                          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                            fieldErrors.occupation ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                        >
                          <option value="">Select Occupation</option>
                          <option value="Salaried">Salaried</option>
                          <option value="Self-Employed">Self-Employed</option>
                          <option value="Student">Student</option>
                          <option value="Retired">Retired</option>
                          <option value="Other">Other</option>
                        </select>
                        {fieldErrors.occupation && (
                          <p className="text-red-600 text-xs mt-1 flex items-center gap-1">❌ {fieldErrors.occupation}</p>
                        )}
                      </div>
                    </div>

                    {message && (
                      <div className={`text-sm font-medium text-center p-3 rounded-lg ${message.type === 'error' ? 'text-red-800 bg-red-100 border border-red-300' : 'text-green-800 bg-green-100 border border-green-300'}`}>
                        {message.text}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full px-4 py-2.5 tracking-wide text-white transition-all duration-300 transform bg-rose-500 rounded-lg hover:bg-rose-600 focus:outline-none focus:bg-rose-600 focus:ring focus:ring-rose-300 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 font-semibold"
                    >
                      {isLoading ? 'Completing Profile...' : 'Complete Profile & Sign Up'}
                    </button>
                  </form>
                </div>
              )}

              <p className="mt-6 text-sm text-center text-gray-400">
                Already have an account?{' '}
                <Link href="/signin" className="text-rose-500 focus:outline-none focus:underline hover:underline">
                  Sign in
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
      {/* This structure allows you to switch between pages in a real app */}
      <style>{`.input-field { all: unset; box-sizing: border-box; display: block; width: 100%; padding: 0.5rem 1rem; margin-top: 0.5rem; color: #1f2937; background-color: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; transition: box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1); } .input-field::placeholder { color: #9ca3af; } .input-field:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #fb7185; --tw-ring-opacity: 0.4; box-shadow: 0 0 0 3px var(--tw-ring-color); border-color: #f43f5e; }`}</style>
      <main>
        <SignUpPage />
      </main>
    </div>
  );
}


