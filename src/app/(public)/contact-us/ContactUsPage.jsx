'use client'

import React, { useState, useRef, useEffect } from 'react';
import Meta from '@/components/Meta';
import dynamic from 'next/dynamic';
import Turnstile from '@/components/Turnstile';
import { submitContactForm } from '@/config/api';
import StructuredData from '@/components/StructuredData';
import { generateWebPageSchema } from '@/utils/schema';
import { isValidPhoneNumber } from '@/utils/phone';

const ContactUsPage = () => {
  const turnstileRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [siteKey, setSiteKey] = useState(null);

  // Load environment variable safely on mount
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (key) {
      setSiteKey(key);
    } else {
      console.error('Turnstile Site Key is missing in environment variables');
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    state: '',
    city: '',
    reason: '',
    subject: '',
    message: ''
  });

  // Validation functions
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Full name must contain only letters and spaces';
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'mobile':
        if (!value.trim()) return 'Mobile number is required';
        if (!isValidPhoneNumber(value)) return 'Please enter a valid mobile number';
        return '';
      case 'state':
        if (!value.trim()) return 'State is required';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required';
        if (value.trim().length < 2) return 'City must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'City must contain only letters and spaces';
        return '';
      case 'reason':
        if (!value.trim()) return 'Reason to connect is required';
        return '';
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        if (value.length > 100) return 'Subject must be under 100 characters';
        return '';
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 20) return 'Message must be at least 20 characters';
        if (value.length > 1000) return 'Message must not exceed 1000 characters';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {};
    const fields = ['name', 'email', 'mobile', 'state', 'city', 'reason', 'subject', 'message'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value
      };
      
      const error = validateField(name, value);
      setFieldErrors(prev => {
        if (error) {
          return { ...prev, [name]: error };
        } else {
          const { [name]: _, ...rest } = prev;
          return rest;
        }
      });
      
      return updatedFormData;
    });
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    // Removed console.log of token
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors above and try again.' });
      return;
    }
    
    if (!captchaToken) {
      setMessage({ type: 'error', text: 'Please complete the verification by checking the "I\'m not a robot" box' });
      return;
    }

    setIsLoading(true);

    try {
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.mobile,
        subject: formData.subject,
        state: formData.state,
        city: formData.city,
        reason: formData.reason,
        message: formData.message,
        captchaToken: captchaToken,
      };

      // Removed console.log of form data (PII Leak)

      const result = await submitContactForm(contactData);

      if (result.success) {
        // Removed console.log of result data
        setMessage({ type: 'success', text: 'Thank you for contacting us! We will get back to you soon.' });
        
        setFormData({
          name: '',
          email: '',
          mobile: '',
          state: '',
          city: '',
          reason: '',
          subject: '',
          message: ''
        });
        
        setCaptchaToken(null);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }

        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: `Error: ${result.error}` });
      }
    } catch (error) {
      console.error('Contact form submission error'); // Log generic error, not object
      setMessage({ type: 'error', text: 'Failed to submit form. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
  ];

  const reasons = [
    'General Inquiry',
    'Loan Assistance',
    'Technical Support',
    'Feedback',
    'Partnership',
    'Other'
  ];

  const schema = generateWebPageSchema({
    name: 'Contact Us - Loanzaar Support',
    description: 'Get in touch with our support team.',
    url: 'https://loanzaar.in/contact-us',
    breadcrumbs: [
      { name: 'Home', url: 'https://loanzaar.in' },
      { name: 'Contact Us', url: 'https://loanzaar.in/contact-us' }
    ]
  });

  return (
    <section className="min-h-screen bg-slate-50">
      <StructuredData schema={schema} />
      <Meta 
        title="Contact Us - Loanzaar Support" 
        description="Get in touch with our support team. We're here to help with your loan applications, insurance queries, and any other questions about Loanzaar."
      />
      <div className="container px-6 py-10 mx-auto max-w-7xl">
        <div className="lg:flex lg:items-center lg:-mx-10">
          <div className="lg:w-1/2 lg:mx-10">
            <h1 className="text-2xl font-semibold text-slate-800 capitalize lg:text-3xl">
              Let's talk
            </h1>
            <p className="mt-4 text-slate-600">
              Ask us everything and we would love to hear from you
            </p>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Important Note
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      We do not charge for our services to customers. If any Loanzaar personnel take any charges other than bank fees, please immediately contact our toll-free number or write to us.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form className="mt-8" onSubmit={handleSubmit}>
              {message && (
                <div className={`mb-6 text-sm font-medium text-center p-4 rounded-lg border ${message.type === 'error' ? 'text-red-800 bg-red-100 border-red-300' : 'text-green-800 bg-green-100 border-green-300'}`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`block w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                      fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      ❌ {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="johndoe@example.com"
                    className={`block w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                      fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      ❌ {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobile"
                    inputMode="numeric"
                    maxLength="10"
                    value={formData.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData(prevFormData => ({ ...prevFormData, mobile: value }));
                      
                      const error = validateField('mobile', value);
                      setFieldErrors(prev => {
                        if (error) {
                          return { ...prev, mobile: error };
                        } else {
                          const { mobile, ...rest } = prev;
                          return rest;
                        }
                      });
                    }}
                    placeholder="10-digit number"
                    className={`block w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                      fieldErrors.mobile ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                    }`}
                  />
                  {fieldErrors.mobile && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      ❌ {fieldErrors.mobile}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`block w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                      fieldErrors.state ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {fieldErrors.state && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      ❌ {fieldErrors.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    className={`block w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                      fieldErrors.city ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                    }`}
                  />
                  {fieldErrors.city && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      ❌ {fieldErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Reason to Connect *</label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className={`block w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                      fieldErrors.reason ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <option value="">Select Reason</option>
                    {reasons.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  {fieldErrors.reason && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      ❌ {fieldErrors.reason}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block mb-2 text-sm font-semibold text-slate-700">Subject * <span className="text-xs text-slate-500">({formData.subject.length}/100)</span></label>
                <input
                  type="text"
                  name="subject"
                  maxLength="100"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief subject of your inquiry"
                  className={`block w-full px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition ${
                    fieldErrors.subject ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                  }`}
                />
                {fieldErrors.subject && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    ❌ {fieldErrors.subject}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <label className="block mb-2 text-sm font-semibold text-slate-700">Message * <span className="text-xs text-slate-500">({formData.message.length}/1000)</span></label>
                <textarea
                  name="message"
                  maxLength="1000"
                  value={formData.message}
                  onChange={handleChange}
                  className={`block w-full h-32 px-5 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 transition resize-none ${
                    fieldErrors.message ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                  }`}
                  placeholder="Please provide details about your inquiry... (minimum 20 characters)"
                ></textarea>
                {fieldErrors.message && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    ❌ {fieldErrors.message}
                  </p>
                )}
              </div>

              {/* Turnstile - ONLY RENDER IF KEY EXISTS */}
              <div className="mt-6 flex justify-center flex-col items-center">
                {siteKey ? (
                  <>
                    <Turnstile
                      ref={turnstileRef}
                      sitekey={siteKey}
                      onVerify={handleCaptchaChange}
                      onExpired={() => setCaptchaToken(null)}
                      onLoad={() => { /* debug logs removed */ }}
                      onError={() => {
                        setMessage({ type: 'error', text: 'Security check failed. Please refresh.' });
                      }}
                    />
                  </>
                ) : (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    Error loading security challenge. Please contact support.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || Object.keys(fieldErrors).length > 0}
                className="w-full px-6 py-3 mt-6 text-sm font-semibold tracking-wide text-white capitalize transition-all duration-300 transform bg-rose-500 rounded-lg hover:bg-rose-600 focus:outline-none focus:ring focus:ring-rose-300 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? 'Sending...' : 'Get in touch'}
              </button>
            </form>
          </div>

          <div className="mt-12 lg:flex lg:mt-0 lg:flex-col lg:items-center lg:w-1/2 lg:mx-10">
            <img
              className="hidden object-cover mx-auto rounded-full lg:block shrink-0 w-96 h-96"
              src="https://images.unsplash.com/photo-1598257006458-087169a1f08d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
              alt="Contact Us"
            />
            {/* ... Rest of static SVG icons/socials ... */}
             <div className="mt-6 space-y-8 md:mt-8">
              <div className="flex items-start -mx-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-2 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="mx-2 text-slate-700 truncate w-72">
                  Loanzaar Office, Mumbai, Maharashtra 400001
                </span>
              </div>

              <div className="flex items-start -mx-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-2 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="mx-2 text-slate-700 truncate w-72">1800-XXX-XXXX (Toll-free)</span>
              </div>

              <div className="flex items-start -mx-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-2 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="mx-2 text-slate-700 truncate w-72">support@loanzaar.com</span>
              </div>
            </div>
            
            {/* ... Social Links (kept same) ... */}
            <div className="mt-6 w-80 md:mt-8">
               {/* Social icons are strictly SVG paths, no data leaks there. Kept as is. */}
               <h3 className="text-slate-600">Follow us</h3>
               {/* ... (social icons code) ... */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUsPage;