'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitInsuranceInquiry } from '../config/api';

const LifeInsurancePage = () => {
  const [activeTab, setActiveTab] = useState('what-is-life-insurance');
  const [activeFaq, setActiveFaq] = useState(0);
  const recaptchaRef = useRef(null);

  // Modal states  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cityState: '',
    insuranceType: 'Life Insurance',
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
      insuranceType: 'Life Insurance',
      captchaToken: captchaToken,
    };

    // Log the data with captcha token
    console.log('📋 Life Insurance Form Data with CAPTCHA:', insuranceData);

    // Submit to backend using insurance-specific endpoint
    const result = await submitInsuranceInquiry(insuranceData);

    if (result.success) {
      console.log('✅ Life insurance inquiry submitted successfully:', result.data);
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
    const fields = ['fullName', 'phone', 'email', 'cityState', 'coverageAmount', 'ageDOB'];
    
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
    { id: 'what-is-life-insurance', label: 'What is Life Insurance?', icon: 'shield' },
    { id: 'types-of-life-insurance', label: 'Types of Life Insurance', icon: 'layers' },
    { id: 'who-should-buy', label: 'Who Should Buy?', icon: 'users' },
    { id: 'key-terms', label: 'Key Terms', icon: 'file-text' },
    { id: 'faqs', label: 'FAQs', icon: 'help-circle' }
  ];

  const lifeInsuranceTypes = [
    {
      title: 'Term Life Insurance',
      description: 'Provides coverage for a specific period (term). It is a pure protection plan with no maturity benefit if the policyholder survives the term.',
      icon: 'clock'
    },
    {
      title: 'Whole Life Insurance',
      description: 'Offers lifetime coverage (often up to age 99) and includes a savings component (cash value) that grows over time.',
      icon: 'infinity'
    },
    {
      title: 'Unit Linked Insurance Plan (ULIP)',
      description: 'A combination of insurance and investment. A portion of the premium provides life cover, while the rest is invested in market-linked funds.',
      icon: 'trending-up'
    },
    {
      title: 'Endowment Plan',
      description: 'A savings-oriented life insurance plan that provides a lump sum amount on maturity or on the policyholder\'s death.',
      icon: 'piggy-bank'
    },
    {
      title: 'Money Back Plan',
      description: 'Provides periodic payouts (survival benefits) during the policy term and the remaining sum assured on maturity.',
      icon: 'dollar-sign'
    },
    {
      title: 'Retirement Plan',
      description: 'Helps you build a corpus for your retirement, providing a regular pension or a lump sum amount after you retire.',
      icon: 'sun'
    },
    {
      title: 'Child Insurance Plan',
      description: 'Designed to secure your child\'s future, covering costs for higher education and marriage, even in your absence.',
      icon: 'baby'
    },
    {
      title: 'Group Insurance Plan',
      description: 'Offered by employers or organizations to provide life cover for their members (employees, customers).',
      icon: 'users'
    }
  ];

  const whoShouldBuy = [
    'Individuals with Financial Dependents: Anyone with a spouse, children, or aging parents who rely on their income.',
    'Breadwinners: If you are the primary source of income for your household.',
    'People with Debts: To ensure outstanding liabilities like mortgages or loans are paid off.',
    'Parents: To secure their children\'s future education and other major life goals.',
    'Business Owners: To protect their business from financial loss in case of their untimely demise.',
    'Anyone Wanting to Leave a Legacy: To leave an inheritance for their heirs.',
    'Individuals Seeking Investment Growth: Certain policies like ULIPs or whole life plans offer a savings and investment component.'
  ];

  const keyTerms = [
    { term: 'Premium', definition: 'The regular payment made for the life insurance policy.' },
    { term: 'Beneficiary', definition: 'The person or entity who receives the death benefit.' },
    { term: 'Death Benefit', definition: 'The payout given to the beneficiary upon the insured\'s death.' },
    { term: 'Policy Term', definition: 'The duration for which the life insurance policy is valid.' },
    { term: 'Sum Assured', definition: 'The amount of money the policy pays to the beneficiary.' },
    { term: 'Underwriting', definition: 'The process of assessing an applicant\'s risk to determine policy eligibility and premiums.' },
    { term: 'Cash Value', definition: 'The savings component in some policies that can grow over time.' },
    { term: 'Riders', definition: 'Optional add-ons that offer extra coverage or benefits, such as critical illness or accidental death cover.' }
  ];

  const faqs = [
    { question: 'What is life insurance, and how does it work?', answer: 'Life insurance is a financial contract between an individual (the policyholder) and an insurance company. The policyholder pays regular premiums, and in return, the insurance company provides a death benefit to the policyholder\'s designated beneficiaries upon their death.' },
    { question: 'Who needs life insurance?', answer: 'Anyone with financial dependents, breadwinners, people with debts, parents, business owners, or individuals seeking investment growth and legacy planning.' },
    { question: 'What types of life insurance are there?', answer: 'Common types include Term Life, Whole Life, ULIP, Endowment Plan, Money Back Plan, Retirement Plan, Child Insurance Plan, and Group Insurance Plan.' },
    { question: 'How much life insurance coverage do I need?', answer: 'Coverage should typically be 10-15 times your annual income, depending on your dependents, debts, and financial goals.' },
    { question: 'What is the difference between term and permanent life insurance?', answer: 'Term life provides coverage for a specific period with no cash value, while permanent life (like whole life) offers lifetime coverage with a savings component.' },
    { question: 'How are life insurance premiums determined?', answer: 'Premiums are based on age, health, lifestyle, coverage amount, policy term, and underwriting assessment.' },
    { question: 'Can I change my life insurance policy after purchasing it?', answer: 'Some policies allow changes, but it depends on the terms. You may be able to convert term to permanent or adjust coverage.' },
    { question: 'Is life insurance taxable?', answer: 'Death benefits are generally tax-free, but premiums may be eligible for tax deductions under Section 80C.' },
    { question: 'Can I have multiple life insurance policies?', answer: 'Yes, you can have multiple policies from different insurers to meet various needs and goals.' },
    { question: 'What happens if I stop paying my life insurance premiums?', answer: 'The policy may lapse, losing coverage. Some policies offer grace periods or can be reinstated with back payments.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta 
        title="Life Insurance Plans - Secure Your Family's Future | Loanzaar" 
        description="Compare and apply for reliable life insurance plans to protect your loved ones. Competitive rates at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <a href="/insurance/all-insurance" className="hover:text-red-500">Insurance</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Life Insurance</span>
        </div>
      </nav>

      {/* Hero Section (What is Life Insurance) */}
      <section id="what-is-life-insurance-section" className="relative bg-gradient-to-br from-surface-bg to-slate-50 py-16 md:py-28 px-6 md:px-16 min-h-[500px] flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">Financial Protection</span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              We provide the best value <span className="text-red-500">Life Insurance</span>
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
            <img src="/life-insurance-hero.png" alt="Life insurance protection shield" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23eff6ff"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%231e40af">Life Insurance Hero Image</text></svg>'} />
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon === 'shield' ? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' : tab.icon === 'layers' ? 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' : tab.icon === 'users' ? 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' : tab.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* What is Life Insurance Section */}
      <section id="what-is-life-insurance-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">What is Life Insurance?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Life insurance is a financial contract between an individual (the policyholder) and an insurance company. The policyholder pays regular premiums, and in return, the insurance company provides a death benefit to the policyholder's designated beneficiaries upon their death. The primary purpose of life insurance is to provide financial protection and support to your loved ones in your absence.
          </p>
          <div className="bg-blue-50 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">How Does It Work?</h3>
            <p className="text-lg text-gray-700 mb-6">You pay a regular premium to an insurer. If you pass away while the policy is active, the insurer pays a lump sum, known as the death benefit, to your beneficiaries.</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Premium</h4>
                <p className="text-gray-600">The regular payment made to keep the life insurance policy active.</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Claim</h4>
                <p className="text-gray-600">The formal request a beneficiary makes to the insurance company for the death benefit after the policyholder's passing.</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Death Benefit</h4>
                <p className="text-gray-600">The lump sum payment provided to beneficiaries upon the policyholder's death.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Life Insurance Section */}
      <section id="types-of-life-insurance-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Types of Life Insurance Plans</h2>
          <p className="text-lg text-gray-600 mb-16 text-center max-w-4xl mx-auto">There are various types of life insurance plans designed to meet different financial goals and needs.</p>
          <div className="grid md:grid-cols-2 gap-8">
            {lifeInsuranceTypes.map((type, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={type.icon === 'clock' ? 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' : type.icon === 'infinity' ? 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : type.icon === 'trending-up' ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : type.icon === 'piggy-bank' ? 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' : type.icon === 'dollar-sign' ? 'M12 1v22m11-11H1' : type.icon === 'sun' ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' : type.icon === 'baby' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' : 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'} /></svg>
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

      {/* Who Should Buy Section */}
      <section id="who-should-buy-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Who Should Buy a Life Insurance Policy?</h2>
          <p className="text-lg text-gray-600">Life insurance is a valuable financial tool for many individuals, including:</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 p-8 rounded-xl">
            <ul className="space-y-4">
              {whoShouldBuy.map((item, index) => (
                <li key={index} className="flex items-start space-x-3 text-gray-700">
                  <span className="text-red-500 font-bold text-lg mt-1">•</span>
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Key Terms Section */}
      <section id="key-terms-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Life Insurance Terms Explained</h2>
          <p className="text-lg text-gray-600">Understanding these essential terms will help you make informed decisions about your life insurance coverage.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {keyTerms.map((term, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">{term.term}</h3>
              <p className="text-gray-600">{term.definition}</p>
            </div>
          ))}
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
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Secure Your Family's Future Today</h2>
          <p className="text-xl mb-8">Get comprehensive life insurance coverage that provides peace of mind and financial security for you and your loved ones.</p>        </div>
      </section>

      {/* Modal */}
    </div>
  );
};

export default LifeInsurancePage;

