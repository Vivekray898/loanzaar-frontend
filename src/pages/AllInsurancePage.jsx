'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitInsuranceInquiry } from '../config/api';

const AllInsurancePage = () => {
  const [activeTab, setActiveTab] = useState('what-is-insurance');
  const recaptchaRef = useRef(null);

  // Modal states  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cityState: '',
    insuranceType: '',
    coverageAmount: '',
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (!validateForm()) {
      return;
    }

    if (!formData.consent) {
      alert('Please agree to the terms and conditions.');
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
      insuranceType: 'All Insurance',
      captchaToken: captchaToken, // Ready for backend verification
    };

    // Log the data with captcha token
    console.log('📋 Insurance Form Data with CAPTCHA:', insuranceData);

    // Submit to backend using insurance-specific endpoint
    const result = await submitInsuranceInquiry(insuranceData);

    if (result.success) {
      console.log('✅ Insurance inquiry submitted successfully:', result.data);
      setSubmitted(true);
    } else {
      alert(`Error: ${result.error}`);
    }
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
      case 'insuranceType':
        if (!value.trim()) return 'Insurance type is required';
        return '';
      case 'coverageAmount':
        if (!value.trim()) return 'Coverage amount is required';
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
    const fields = ['fullName', 'phone', 'email', 'cityState', 'insuranceType', 'coverageAmount', 'ageDOB'];
    
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
    { id: 'what-is-insurance', label: 'What is Insurance?', icon: 'shield' },
    { id: 'how-it-works', label: 'How it Works', icon: 'cog' },
    { id: 'types-of-insurance', label: 'Types of Insurance', icon: 'layers' },
    { id: 'key-considerations', label: 'Key Considerations', icon: 'check-circle' },
    { id: 'advantages', label: 'Advantages', icon: 'star' }
  ];

  const insuranceTypes = [
    {
      category: 'Life Insurance',
      icon: 'heart',
      description: 'Life insurance offers protection for a predetermined period (a term). If the insured person passes away during the policy term, this insurance provides a financial benefit to the nominee.',
      plans: [
        'Basic Plan: Provides a lump-sum death benefit.',
        'Plan with Accidental Death Cover: Offers an additional payout if death occurs due to an accident.',
        'Plan with Critical Illness Cover: Provides a payout if the policyholder is diagnosed with a major illness.'
      ]
    },
    {
      category: 'General Insurance',
      icon: 'building',
      description: 'General insurance policies are designed to safeguard individuals and businesses from a wide spectrum of unforeseen events that do not pertain to the duration of one\'s life.',
      plans: [
        'Auto Insurance: Provides coverage for vehicles against accidents, theft, or vandalism, and liability for damages to others.',
        'Home Insurance: Covers homeowners and renters against damage or loss of property and possessions from perils like fire, theft, and natural disasters.',
        'Travel Insurance: Offers protection for travelers against trip cancellations, medical emergencies, lost baggage, and other travel-related risks.'
      ]
    },
    {
      category: 'Health Insurance',
      icon: 'activity',
      description: 'Health insurance is a type of coverage that pays for medical and surgical expenses. It helps mitigate the high costs associated with healthcare, allowing individuals to access necessary medical care without facing overwhelming financial burdens.',
      aspects: [
        'Coverage: Includes doctor\'s visits, hospital stays, surgeries, prescription medications, and preventive care.',
        'Network: Many plans have a network of healthcare providers (hospitals, doctors) that offer services at lower out-of-pocket costs.',
        'Preventive Care: Often covers services like vaccinations, screenings, and wellness check-ups at no extra cost.',
        'Emergency Coverage: Provides coverage for emergency room visits and ambulance services.'
      ]
    }
  ];

  const keyConsiderations = [
    { icon: 'target', title: 'Coverage', description: 'Ensure it meets your specific needs.' },
    { icon: 'maximize', title: 'Limits', description: 'Check the maximum payout amounts.' },
    { icon: 'minus-circle', title: 'Deductibles', description: 'Know your out-of-pocket expenses before coverage kicks in.' },
    { icon: 'dollar-sign', title: 'Cost', description: 'Compare premiums from different insurers.' },
    { icon: 'network', title: 'Network', description: 'Confirm if your preferred doctors or hospitals are included (for health insurance).' },
    { icon: 'file-text', title: 'Claim Process', description: 'Understand how to file a claim and what documents are required.' },
    { icon: 'x-circle', title: 'Exclusions', description: 'Be aware of what is not covered by the policy.' },
    { icon: 'clock', title: 'Waiting Periods', description: 'Check for any waiting times before certain coverages become active.' },
    { icon: 'refresh-cw', title: 'Renewability', description: 'Understand the policy\'s renewal terms.' },
    { icon: 'users', title: 'Service', description: 'Research customer reviews and the quality of support.' }
  ];

  const advantages = [
    { icon: 'shield-check', title: 'Financial Protection', description: 'Insurance provides a safety net against unexpected events, minimizing the financial impact on you or your family.' },
    { icon: 'smile', title: 'Peace of Mind', description: 'Knowing you\'re covered helps reduce stress and worry about potential risks.' },
    { icon: 'users', title: 'Risk Sharing', description: 'Insurance spreads the financial burden across a larger group, making costs manageable for individuals.' },
    { icon: 'gavel', title: 'Compliance and Security', description: 'Certain types of insurance, like auto insurance, are often legally required.' },
    { icon: 'calendar', title: 'Long-Term Planning', description: 'Insurance supports long-term financial goals by safeguarding your assets and future.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta 
        title="Insurance Products - Life, Health & General | Loanzaar" 
        description="Explore comprehensive insurance solutions including life, health, and general insurance. Compare plans and apply online at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Insurance</span>
        </div>
      </nav>

      {/* Hero Section (What is Insurance) */}
      <section id="what-is-insurance-section" className="relative bg-gradient-to-br from-blue-50 to-purple-100 py-16 md:py-28 px-6 md:px-16 min-h-[500px] flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">Financial Protection</span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              We provide the best value <span className="text-red-500">Insurance</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Simple steps you can take to improve your financial well-being for the rest of your life.</p>            <div className="flex space-x-6 mt-8">
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
            <img src="/insurance-hero.png" alt="Insurance protection shield" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23eff6ff"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%231e40af">Insurance Hero Image</text></svg>'} />
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon === 'shield' ? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' : tab.icon === 'cog' ? 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' : tab.icon === 'layers' ? 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' : tab.icon === 'check-circle' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'} /></svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* What is Insurance Section */}
      <section id="what-is-insurance-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">What is Insurance?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Insurance is a way to protect yourself or your things from unexpected problems that could cost you a lot of money. You pay a small amount of money regularly to an insurance company, and in return, they promise to help you if something bad happens. For example, if you get sick or meet with an accident, they can help pay expensive medical bills. Or if something valuable, like your car or house, gets damaged, they can help cover the costs. It's like having a safety net that helps you when things don't go as planned.
          </p>
          <div className="bg-blue-50 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Insurance Concepts:</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Insurance Premium</h4>
                <p className="text-gray-600">A premium is the sum of money you pay to an insurance provider in exchange for the protection they offer, usually on a monthly or yearly schedule. The amount depends on the type of insurance, coverage limits, and the level of risk involved.</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Insurance Claim</h4>
                <p className="text-gray-600">An insurance claim is a formal request you make to your insurance company when an event covered by your policy occurs. You are asking the company for financial help as per your policy's terms. If they approve the claim, they will provide the appropriate compensation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How Does Insurance Work?</h2>
          <p className="text-lg text-gray-600">Insurance works by spreading out the financial risk of unexpected events.</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <p className="text-lg text-gray-700 mb-6">
              When you buy insurance, you pay a small amount of money called a premium to the insurance company. They collect premiums from many people, which creates a pool of money. When someone in the pool faces a problem covered by the insurance, like an accident or illness, the company uses the money from the pool to help them pay the bills. This way, individuals and businesses can protect themselves from big financial losses.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pay Premium</h3>
                <p className="text-gray-600">You pay a small premium regularly to build the insurance pool.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Pooling</h3>
                <p className="text-gray-600">Premiums from many people create a pool of funds for coverage.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Claim Settlement</h3>
                <p className="text-gray-600">When covered events occur, claims are settled from the pool.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Insurance Section */}
      <section id="types-of-insurance-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Types of Insurance in India</h2>
          <p className="text-lg text-gray-600 mb-16 text-center max-w-4xl mx-auto">In India, insurance plays a crucial role in safeguarding individuals and businesses from financial risks. There are several types of insurance available.</p>
          <div className="space-y-12">
            {insuranceTypes.map((type, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={type.icon === 'heart' ? 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' : type.icon === 'building' ? 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' : 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'} /></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{type.category}</h3>
                    <p className="text-gray-700 mb-6">{type.description}</p>
                    {type.plans && (
                      <div>
                        <h4 className="text-lg font-semibold text-blue-600 mb-3">Types of {type.category} Plans:</h4>
                        <ul className="space-y-2">
                          {type.plans.map((plan, planIndex) => (
                            <li key={planIndex} className="flex items-start space-x-2 text-gray-600">
                              <span className="text-blue-500 font-bold mt-1">•</span>
                              <span>{plan}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {type.aspects && (
                      <div>
                        <h4 className="text-lg font-semibold text-blue-600 mb-3">Key Aspects of {type.category}:</h4>
                        <ul className="space-y-2">
                          {type.aspects.map((aspect, aspectIndex) => (
                            <li key={aspectIndex} className="flex items-start space-x-2 text-gray-600">
                              <span className="text-blue-500 font-bold mt-1">•</span>
                              <span>{aspect}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Considerations Section */}
      <section id="key-considerations-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Important Aspects When Buying Insurance</h2>
          <p className="text-lg text-gray-600">To make an educated decision, it's important to compare several insurance alternatives based on the following aspects:</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {keyConsiderations.map((consideration, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={consideration.icon === 'target' ? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' : consideration.icon === 'maximize' ? 'M21 3H3a1 1 0 00-1 1v16a1 1 0 001 1h18a1 1 0 001-1V4a1 1 0 00-1-1zM9 9h6m-6 4h6m-6 4h6' : consideration.icon === 'minus-circle' ? 'M15 12H9m6 0a3 3 0 11-6 0 3 3 0 016 0z' : consideration.icon === 'dollar-sign' ? 'M12 1v22m11-11H1' : consideration.icon === 'network' ? 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' : consideration.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : consideration.icon === 'x-circle' ? 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' : consideration.icon === 'clock' ? 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' : consideration.icon === 'refresh-cw' ? 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' : 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'} /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{consideration.title}</h3>
              <p className="text-gray-600 text-sm">{consideration.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Advantages of Buying Insurance</h2>
          <p className="text-lg text-gray-600">Insurance provides numerous benefits that help protect your financial well-being.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={advantage.icon === 'shield-check' ? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' : advantage.icon === 'smile' ? 'M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3.5a.5.5 0 11-1 0 .5.5 0 011 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z' : advantage.icon === 'users' ? 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' : advantage.icon === 'gavel' ? 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' : 'M8 7V3a2 2 0 012-2h2a2 2 0 012 2v4m-6 8v6a2 2 0 002 2h2a2 2 0 002-2v-6m-6 0h6m6 0v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6h14z'} /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{advantage.title}</h3>
              <p className="text-gray-600">{advantage.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Protect Your Financial Future Today</h2>
          <p className="text-xl mb-8">Get comprehensive insurance coverage that provides peace of mind and financial security for you and your loved ones.</p>        </div>
      </section>    </div>
  );
};

export default AllInsurancePage;

