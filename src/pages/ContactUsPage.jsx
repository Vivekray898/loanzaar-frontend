'use client'

import React, { useState, useRef } from 'react';
import Meta from '../components/Meta';
import ReCAPTCHA from 'react-google-recaptcha';
import { submitContactForm } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateWebPageSchema } from '../utils/schema';
import { isValidPhoneNumber, formatE164 } from '../utils/phone';

const ContactUsPage = () => {
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
      
      // Real-time validation for the changed field
      const error = validateField(name, value);
      setFieldErrors(prev => {
        if (error) {
          return { ...prev, [name]: error };
        } else {
          // Remove error for this field if validation passes
          const { [name]: _, ...rest } = prev;
          return rest;
        }
      });
      
      return updatedFormData;
    });
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
    
    // Validate reCAPTCHA
    if (!captchaToken) {
      setMessage({ type: 'error', text: 'Please complete the reCAPTCHA verification by checking the "I\'m not a robot" box' });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare contact data for backend
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

      // Log the data with captcha token
      console.log('📋 Contact Form Data with CAPTCHA:', contactData);

      // Submit to backend
      const result = await submitContactForm(contactData);

      if (result.success) {
        console.log('✅ Contact form submitted successfully:', result.data);
        setMessage({ type: 'success', text: 'Thank you for contacting us! We will get back to you soon.' });
        
        // Reset form
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
        
        // Reset reCAPTCHA
        setCaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: `Error: ${result.error}` });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
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
    description: 'Get in touch with our support team. We\'re here to help with your loan applications, insurance queries, and any other questions about Loanzaar.',
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

            {/* Important Note */}
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
              {/* Message Display */}
              {message && (
                <div className={`mb-6 text-sm font-medium text-center p-4 rounded-lg border ${message.type === 'error' ? 'text-red-800 bg-red-100 border-red-300' : 'text-green-800 bg-green-100 border-green-300'}`}>
                  {message.text}
                </div>
              )}

              {/* Full Name & Email */}
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

              {/* Mobile Number & State */}
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
                      
                      // Real-time validation for mobile
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

              {/* City & Reason */}
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

              {/* Subject */}
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

              {/* Message */}
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

              {/* reCAPTCHA */}
              <div className="mt-6 flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LdUpOsrAAAAAKqnWvFE0MH-mgcHo8BzFohUEB5b'}
                  onChange={handleCaptchaChange}
                  onExpired={() => setCaptchaToken(null)}
                />
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

            <div className="mt-6 w-80 md:mt-8">
              <h3 className="text-slate-600">Follow us</h3>

              <div className="flex mt-4 -mx-1.5">
                <a className="mx-1.5 text-slate-400 transition-colors duration-300 transform hover:text-rose-500" href="#">
                  <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.6668 6.67334C18.0002 7.00001 17.3468 7.13268 16.6668 7.33334C15.9195 6.49001 14.8115 6.44334 13.7468 6.84201C12.6822 7.24068 11.9848 8.21534 12.0002 9.33334V10C9.83683 10.0553 7.91016 9.07001 6.66683 7.33334C6.66683 7.33334 3.87883 12.2887 9.3335 14.6667C8.0855 15.498 6.84083 16.0587 5.3335 16C7.53883 17.202 9.94216 17.6153 12.0228 17.0113C14.4095 16.318 16.3708 14.5293 17.1235 11.85C17.348 11.0351 17.4595 10.1932 17.4548 9.34801C17.4535 9.18201 18.4615 7.50001 18.6668 6.67268V6.67334Z" />
                  </svg>
                </a>

                <a className="mx-1.5 text-slate-400 transition-colors duration-300 transform hover:text-rose-500" href="#">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.2 8.80005C16.4731 8.80005 17.694 9.30576 18.5941 10.2059C19.4943 11.1061 20 12.327 20 13.6V19.2H16.8V13.6C16.8 13.1757 16.6315 12.7687 16.3314 12.4687C16.0313 12.1686 15.6244 12 15.2 12C14.7757 12 14.3687 12.1686 14.0687 12.4687C13.7686 12.7687 13.6 13.1757 13.6 13.6V19.2H10.4V13.6C10.4 12.327 10.9057 11.1061 11.8059 10.2059C12.7061 9.30576 13.927 8.80005 15.2 8.80005Z" fill="currentColor" />
                    <path d="M7.2 9.6001H4V19.2001H7.2V9.6001Z" fill="currentColor" />
                    <path d="M5.6 7.2C6.48366 7.2 7.2 6.48366 7.2 5.6C7.2 4.71634 6.48366 4 5.6 4C4.71634 4 4 4.71634 4 5.6C4 6.48366 4.71634 7.2 5.6 7.2Z" fill="currentColor" />
                  </svg>
                </a>

                <a className="mx-1.5 text-slate-400 transition-colors duration-300 transform hover:text-rose-500" href="#">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10.2222V13.7778H9.66667V20H13.2222V13.7778H15.8889L16.7778 10.2222H13.2222V8.44444C13.2222 8.2087 13.3159 7.9826 13.4826 7.81591C13.6493 7.64921 13.8754 7.55556 14.1111 7.55556H16.7778V4H14.1111C12.9324 4 11.8019 4.46825 10.9684 5.30175C10.1349 6.13524 9.66667 7.2657 9.66667 8.44444V10.2222H7Z" fill="currentColor" />
                  </svg>
                </a>

                <a className="mx-1.5 text-slate-400 transition-colors duration-300 transform hover:text-rose-500" href="#">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.9294 7.72275C9.65868 7.72275 7.82715 9.55428 7.82715 11.825C7.82715 14.0956 9.65868 15.9271 11.9294 15.9271C14.2 15.9271 16.0316 14.0956 16.0316 11.825C16.0316 9.55428 14.2 7.72275 11.9294 7.72275ZM11.9294 14.4919C10.462 14.4919 9.26239 13.2959 9.26239 11.825C9.26239 10.354 10.4584 9.15799 11.9294 9.15799C13.4003 9.15799 14.5963 10.354 14.5963 11.825C14.5963 13.2959 13.3967 14.4919 11.9294 14.4919ZM17.1562 7.55495C17.1562 8.08692 16.7277 8.51178 16.1994 8.51178C15.6674 8.51178 15.2425 8.08335 15.2425 7.55495C15.2425 7.02656 15.671 6.59813 16.1994 6.59813C16.7277 6.59813 17.1562 7.02656 17.1562 7.55495ZM19.8731 8.52606C19.8124 7.24434 19.5197 6.10901 18.5807 5.17361C17.6453 4.23821 16.51 3.94545 15.2282 3.88118C13.9073 3.80621 9.94787 3.80621 8.62689 3.88118C7.34874 3.94188 6.21341 4.23464 5.27444 5.17004C4.33547 6.10544 4.04628 7.24077 3.98201 8.52249C3.90704 9.84347 3.90704 13.8029 3.98201 15.1238C4.04271 16.4056 4.33547 17.5409 5.27444 18.4763C6.21341 19.4117 7.34517 19.7045 8.62689 19.7687C9.94787 19.8437 13.9073 19.8437 15.2282 19.7687C16.51 19.708 17.6453 19.4153 18.5807 18.4763C19.5161 17.5409 19.8089 16.4056 19.8731 15.1238C19.9481 13.8029 19.9481 9.84704 19.8731 8.52606ZM18.1665 16.5412C17.8881 17.241 17.349 17.7801 16.6456 18.0621C15.5924 18.4799 13.0932 18.3835 11.9294 18.3835C10.7655 18.3835 8.26272 18.4763 7.21307 18.0621C6.51331 17.7837 5.9742 17.2446 5.69215 16.5412C5.27444 15.488 5.37083 12.9888 5.37083 11.825C5.37083 10.6611 5.27801 8.15832 5.69215 7.10867C5.97063 6.40891 6.50974 5.8698 7.21307 5.58775C8.26629 5.17004 10.7655 5.26643 11.9294 5.26643C13.0932 5.26643 15.596 5.17361 16.6456 5.58775C17.3454 5.86623 17.8845 6.40534 18.1665 7.10867C18.5843 8.16189 18.4879 10.6611 18.4879 11.825C18.4879 12.9888 18.5843 15.4916 18.1665 16.5412Z" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUsPage;
