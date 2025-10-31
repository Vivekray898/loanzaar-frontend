'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitInsuranceInquiry } from '../config/api';

const GeneralInsurancePage = () => {
  const [activeTab, setActiveTab] = useState('what-is-general-insurance');
  const [activeFaq, setActiveFaq] = useState(0);
  const recaptchaRef = useRef(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cityState: '',
    insuranceType: 'General Insurance',
    assetType: '',
    ageDOB: '',
    consent: false
  });

  // --- Scroll and Active Tab Logic ---

  // Scrolls to the relevant section when a tab is clicked
  const handleTabClick = (tabId) => {
    const section = document.getElementById(`${tabId}-section`);
    if (section) {
      const headerOffset = 130; // Combined height of both sticky headers
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      // Set active tab immediately for better UX
      setActiveTab(tabId);
    }
  };

  // Updates the active tab based on scroll position
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');

    const observerOptions = {
      root: null, // observes intersections relative to the viewport
      rootMargin: '-140px 0px -60% 0px', // Adjusts the intersection trigger area
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Sets the active tab to the ID of the intersecting section
          setActiveTab(entry.target.id.replace('-section', ''));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((sec) => observer.observe(sec));

    // Cleanup function to unobserve sections when component unmounts
    return () => sections.forEach((sec) => observer.unobserve(sec));
  }, []); // Empty dependency array ensures this runs only once on mount

  // Modal functions
  // Add body scroll lock when modal is shown
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
      return;
    }
    
    if (!formData.consent) {
      alert('Please agree to the consent declaration.');
      return;
    }
    
    // Validate reCAPTCHA
    if (!captchaToken) {
      alert('Please complete the reCAPTCHA verification by checking the "I\'m not a robot" box');
      return;
    }

    // Prepare insurance data for backend
    const insuranceData = {
      ...formData,
      insuranceType: 'General Insurance',
      captchaToken: captchaToken,
    };

    // Log the data with captcha token
    console.log('📋 General Insurance Form Data with CAPTCHA:', insuranceData);

    // Submit to backend using insurance-specific endpoint
    const result = await submitInsuranceInquiry(insuranceData);

    if (result.success) {
      console.log('✅ General insurance inquiry submitted successfully:', result.data);
      setSubmitted(true);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitted(false);
    setCaptchaToken(null);
    setFieldErrors({});
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      cityState: '',
      insuranceType: 'General Insurance',
      assetType: '',
      ageDOB: '',
      consent: false
    });
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    console.log('✅ reCAPTCHA token received:', token);
  };

  // Validation functions
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Full name must contain only letters';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[6-9]\d{9}$/.test(value)) return 'Phone must be 10 digits starting with 6-9';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'cityState':
        if (!value.trim()) return 'City/State is required';
        if (value.trim().length < 2) return 'City/State must be at least 2 characters';
        return '';
      case 'assetType':
        if (!value.trim()) return 'Asset type is required';
        return '';
      case 'ageDOB':
        if (!value.trim()) return 'Age/DOB is required';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {};
    const fields = ['fullName', 'phone', 'email', 'cityState', 'assetType', 'ageDOB'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const tabs = [
    { id: 'what-is-general-insurance', label: 'What is General Insurance?', icon: 'shield' },
    { id: 'types-of-general-insurance', label: 'Types of General Insurance', icon: 'layers' },
    { id: 'our-services', label: 'Our Services', icon: 'star' },
    { id: 'types-of-policies', label: 'Types of Policies', icon: 'file-text' },
    { id: 'faqs', label: 'FAQs', icon: 'help-circle' }
  ];

  const insuranceTypes = [
    {
      title: 'Motor Insurance',
      description: 'Coverage for your vehicle, protecting you from financial losses due to accidents, theft, or damage.',
      icon: 'car'
    },
    {
      title: 'Health Insurance',
      description: 'Covers your medical expenses, helping you afford healthcare services and treatments when you\'re sick or injured.',
      icon: 'heart'
    },
    {
      title: 'Travel Insurance',
      description: 'Offers coverage for unexpected events during your trips, including trip cancellations, medical emergencies, lost luggage, and more.',
      icon: 'plane'
    },
    {
      title: 'Home Insurance',
      description: 'Provides financial protection for your home and belongings against events like theft, fire, and natural disasters.',
      icon: 'home'
    },
    {
      title: 'Marine Insurance',
      description: 'Covers losses and damages to ships and cargo during sea voyages, providing financial protection for maritime activities.',
      icon: 'ship'
    },
    {
      title: 'Rural Insurance',
      description: 'Provides coverage for agricultural assets, livestock, and rural properties, protecting farmers and rural communities from financial losses.',
      icon: 'tractor'
    },
    {
      title: 'Mobile Insurance',
      description: 'Covers the cost of repairing or replacing your smartphone if it gets damaged, stolen, or lost.',
      icon: 'smartphone'
    },
    {
      title: 'Bicycle Insurance',
      description: 'Provides coverage for your bicycle against theft, damage, and accidents.',
      icon: 'bike'
    },
    {
      title: 'Commercial Insurance',
      description: 'Coverage for businesses, safeguarding them from financial losses due to property damage, liability, and other risks specific to their operations.',
      icon: 'building'
    }
  ];

  const services = [
    {
      title: '24x7 Support',
      description: 'Client is our most important priority.',
      icon: 'clock'
    },
    {
      title: 'Easy Claim System',
      description: 'Express your desires and needs to us.',
      icon: 'file-check'
    },
    {
      title: 'Easy installments',
      description: 'Less complicated payment system.',
      icon: 'credit-card'
    },
    {
      title: 'Strongly Secured',
      description: 'We can secure your precious assets.',
      icon: 'shield-check'
    }
  ];

  const policyTypes = [
    {
      title: 'General Insurance with Critical Illness Cover',
      description: 'In the tragic event that the policyholder passes away during the policy term, this general insurance plan includes a life cover that is paid as a lump amount. The fundamental life insurance policy includes a paid-for life cover.',
      icon: 'alert-triangle'
    },
    {
      title: 'Basic Plan',
      description: 'The basic General Insurance plan includes a life insurance policy that pays out a lump amount if the policyholder dies during the policy period. The basic life insurance plan includes a paid life cover.',
      icon: 'file'
    },
    {
      title: 'Life Insurance with Accidental Death Cover',
      description: 'This General Insurance plan includes a life insurance policy that pays out a lump amount if the policyholder dies during the policy period. The basic life insurance plan includes a paid life cover.',
      icon: 'user-x'
    }
  ];

  const faqs = [
    { question: 'What is insurance?', answer: 'Insurance is a financial arrangement that provides protection against financial loss. You pay regular premiums to an insurance company, and in return, they agree to compensate you for covered losses or damages.' },
    { question: 'Why do I need insurance?', answer: 'Insurance protects you from unexpected financial losses due to accidents, illnesses, theft, or other unforeseen events. It provides peace of mind and financial security for you and your family.' },
    { question: 'What does insurance cover?', answer: 'Insurance coverage varies by policy type. General insurance typically covers vehicles, homes, travel, and other assets against risks like accidents, theft, fire, and natural disasters.' },
    { question: 'How do I buy insurance?', answer: 'You can buy insurance through insurance agents, brokers, or directly from insurance companies. Compare policies, read terms carefully, and choose coverage that meets your needs.' },
    { question: 'What\'s a premium?', answer: 'A premium is the amount you pay regularly (monthly, quarterly, or annually) to maintain your insurance coverage. Premiums are based on coverage amount, risk factors, and policy terms.' },
    { question: 'How do I use insurance?', answer: 'When a covered event occurs, you file a claim with your insurance company. They will assess the claim and provide compensation according to your policy terms.' },
    { question: 'Can I choose any doctor or repair shop?', answer: 'It depends on your policy. Some plans have network restrictions, while others allow you to choose any service provider. Check your policy terms for details.' },
    { question: 'Is insurance expensive?', answer: 'Insurance costs vary based on coverage amount, risk factors, and deductibles. While it requires regular payments, it protects against potentially much larger financial losses.' },
    { question: 'What if I don\'t have insurance?', answer: 'Without insurance, you bear the full financial burden of accidents, illnesses, or damages. This can lead to significant financial hardship or bankruptcy in case of major incidents.' },
    { question: 'Can I change my insurance plan?', answer: 'Yes, you can typically change your insurance plan during renewal periods. You may also be able to add or remove coverage based on your changing needs.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta 
        title="General Insurance - Home, Auto & More | Loanzaar" 
        description="Browse general insurance options for home, auto, travel, and more. Easy comparison and instant quotes at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <a href="/insurance/all-insurance" className="hover:text-red-500">Insurance</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">General Insurance</span>
        </div>
      </nav>

      {/* Hero Section (What is General Insurance) */}
      <section id="what-is-general-insurance-section" className="relative bg-gradient-to-br from-blue-50 to-purple-100 py-16 md:py-28 px-6 md:px-16 min-h-[500px] flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">Financial Protection</span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              We provide the best value <span className="text-red-500">General Insurance</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Simple steps you can take to improve your financial well-being for the rest of your life.</p>
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition" onClick={() => setShowModal(true)}>Get a Quote</button>
            <div className="flex space-x-6 mt-8">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-600">100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-600">Quick Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm text-gray-600">Best Value</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="/general-insurance-hero.png" alt="General insurance protection shield" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23eff6ff"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%231e40af">General Insurance Hero Image</text></svg>'} />
            <div className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg animate-bounce">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1L13.09 7.26L20 8L15 13L16.18 19L10 15.77L3.82 19L5 13L0 8L6.91 7.26L10 1Z" clipRule="evenodd" /></svg>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <nav className="sticky top-16 bg-white border-b-2 border-gray-100 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="flex overflow-x-auto space-x-2 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${activeTab === tab.id ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon === 'shield' ? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' : tab.icon === 'layers' ? 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' : tab.icon === 'star' ? 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' : tab.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* What is General Insurance Section */}
      <section id="what-is-general-insurance-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">What is General Insurance?</h2>
          <p className="text-lg text-gray-600 mb-8">
            General insurance is like a shield for things other than your health or life. It covers your car, home, travel, and more. If something bad happens, like an accident, theft, or damage, the insurance company helps you pay for the repairs or replacements. It's like having a backup plan for unexpected events that could cost you a lot of money.
          </p>
          <div className="bg-blue-50 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose General Insurance?</h3>
            <p className="text-lg text-gray-700 mb-6">
              General insurance protects your valuable assets and provides financial security against unforeseen events.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Asset Protection</h4>
                <p className="text-gray-600">Safeguards your property, vehicles, and belongings from financial loss.</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Peace of Mind</h4>
                <p className="text-gray-600">Provides security and confidence against unexpected financial burdens.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types of General Insurance Section */}
      <section id="types-of-general-insurance-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Types of General Insurance</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {insuranceTypes.map((type, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={type.icon === 'car' ? 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' : type.icon === 'heart' ? 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' : type.icon === 'plane' ? 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' : type.icon === 'home' ? 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' : type.icon === 'ship' ? 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' : type.icon === 'tractor' ? 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' : type.icon === 'smartphone' ? 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' : type.icon === 'bike' ? 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' : 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'} /></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{type.title}</h3>
                    <p className="text-gray-700">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Best Services Section */}
      <section id="our-services-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Best Services</h2>
          <p className="text-lg text-gray-600">We provide comprehensive support and protection for your general insurance needs.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={service.icon === 'clock' ? 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' : service.icon === 'file-check' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : service.icon === 'credit-card' ? 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' : 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'} /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Types of Policies Section */}
      <section id="types-of-policies-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Types of General Insurance Policies</h2>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {policyTypes.map((policy, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={policy.icon === 'alert-triangle' ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' : policy.icon === 'file' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{policy.title}</h3>
                    <p className="text-gray-700">{policy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
              FAQs
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl px-6 py-4 text-left"
                >
                  <span className="text-base font-semibold text-gray-900">{faq.question}</span>
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Protect Your Assets Today</h2>
          <p className="text-xl mb-8">Get comprehensive general insurance coverage that provides peace of mind and financial security for your valuable possessions.</p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg" onClick={() => setShowModal(true)}>Get a Quote Now</button>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Close Button */}
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 z-10 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {!submitted ? (
              <>
                {/* Header */}
                <div className="p-6 border-b-2 border-slate-200 text-center bg-white">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800">🛡️ General Insurance Quote</h2>
                  <p className="text-slate-600 text-sm mt-1">Get comprehensive coverage for your assets</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-6 space-y-5">
                  
                  {/* Section 1: Personal Information */}
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                      👤 Personal Information
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => {
                            setFormData({ ...formData, fullName: e.target.value });
                            if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 transition ${
                            fieldErrors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {fieldErrors.fullName && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            ❌ {fieldErrors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength="10"
                          value={formData.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, phone: value });
                            if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 transition ${
                            fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                          placeholder="10-digit mobile number"
                        />
                        {fieldErrors.phone && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            ❌ {fieldErrors.phone}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 transition ${
                            fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                          placeholder="your@email.com"
                        />
                        {fieldErrors.email && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            ❌ {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      {/* City / State */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">City / State *</label>
                        <input
                          type="text"
                          value={formData.cityState}
                          onChange={(e) => {
                            setFormData({ ...formData, cityState: e.target.value });
                            if (fieldErrors.cityState) setFieldErrors({ ...fieldErrors, cityState: '' });
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 transition ${
                            fieldErrors.cityState ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                          placeholder="e.g., Mumbai, Maharashtra"
                        />
                        {fieldErrors.cityState && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            ❌ {fieldErrors.cityState}
                          </p>
                        )}
                      </div>

                      {/* Age / DOB */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Age (Years) *</label>
                        <select
                          value={formData.ageDOB}
                          onChange={(e) => {
                            setFormData({ ...formData, ageDOB: e.target.value });
                            if (fieldErrors.ageDOB) setFieldErrors({ ...fieldErrors, ageDOB: '' });
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 transition ${
                            fieldErrors.ageDOB ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                        >
                          <option value="">Select your age</option>
                          {Array.from({length: 50}, (_, i) => 21 + i).map(age => (
                            <option key={age} value={age}>{age} years</option>
                          ))}
                        </select>
                        {fieldErrors.ageDOB && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            ❌ {fieldErrors.ageDOB}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Asset Details */}
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                      🏠 Asset Details
                    </h3>

                    <div className="space-y-4">
                      {/* Insurance Type (Read-only) */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Insurance Type</label>
                        <input
                          type="text"
                          value="General Insurance"
                          readOnly
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg bg-slate-100 text-slate-600"
                        />
                      </div>

                      {/* Asset Type */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Asset Type *</label>
                        <input
                          type="text"
                          value={formData.assetType}
                          onChange={(e) => {
                            setFormData({ ...formData, assetType: e.target.value });
                            if (fieldErrors.assetType) setFieldErrors({ ...fieldErrors, assetType: '' });
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 transition ${
                            fieldErrors.assetType ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                          }`}
                          placeholder="e.g., Home, Vehicle, Business, etc."
                        />
                        {fieldErrors.assetType && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            ❌ {fieldErrors.assetType}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Terms & Consent */}
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                      ✅ Terms & Consent
                    </h3>

                    <div className="space-y-4">
                      {/* Consent Checkbox */}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.consent}
                          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                          className="mt-1 w-5 h-5 text-slate-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-slate-400"
                        />
                        <span className="text-sm text-slate-700 leading-relaxed">
                          I authorize Loanzaar to contact me via call, SMS, or WhatsApp regarding my insurance inquiry. I agree to the terms and conditions.
                        </span>
                      </label>

                      {/* reCAPTCHA */}
                      <div className="flex justify-center pt-3">
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey="6LdUpOsrAAAAAKqnWvFE0MH-mgcHo8BzFohUEB5b"
                          onChange={handleCaptchaChange}
                          onExpired={() => setCaptchaToken(null)}
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 px-4 rounded-lg font-bold transition-colors duration-200 mt-4"
                      >
                        Get Quote Now
                      </button>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              /* Success Screen */
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Quote Request Submitted!</h2>
                <p className="text-slate-600 mb-6">Our insurance expert will contact you shortly with customized quotes tailored to your needs.</p>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors duration-200"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default GeneralInsurancePage;

