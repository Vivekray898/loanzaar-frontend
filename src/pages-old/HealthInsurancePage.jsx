'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitInsuranceInquiry } from '../config/api';

const HealthInsurancePage = () => {
  const [activeTab, setActiveTab] = useState('what-is-health-insurance');
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
    insuranceType: 'Health Insurance',
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
      insuranceType: 'Health Insurance',
      captchaToken: captchaToken,
    };

    // Log the data with captcha token
    console.log('📋 Health Insurance Form Data with CAPTCHA:', insuranceData);

    // Submit to backend using insurance-specific endpoint
    const result = await submitInsuranceInquiry(insuranceData);

    if (result.success) {
      console.log('✅ Health insurance inquiry submitted successfully:', result.data);
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
    { id: 'what-is-health-insurance', label: 'What is Health Insurance?', icon: 'shield' },
    { id: 'types-of-plans', label: 'Types of Plans', icon: 'layers' },
    { id: 'whats-covered', label: 'What\'s Covered?', icon: 'check-circle' },
    { id: 'key-terms', label: 'Key Terms', icon: 'file-text' },
    { id: 'faqs', label: 'FAQs', icon: 'help-circle' }
  ];

  const planTypes = [
    {
      title: 'Indemnity Plan (Fee-for-Service)',
      description: 'An indemnity health insurance plan gives you the freedom to choose your healthcare providers and services. You typically pay for medical expenses upfront and then submit a claim to the insurance company for reimbursement based on the plan\'s coverage limits. This plan offers flexibility but may require managing more paperwork.',
      icon: 'user-check'
    },
    {
      title: 'Fixed Benefit Plan',
      description: 'A fixed benefit health insurance plan provides specific, pre-defined payouts for certain medical events, such as hospitalization, surgeries, or critical illnesses. The plan pays out a set amount regardless of the actual medical expenses incurred. It offers simplicity and helps cover specific costs but may not cover all healthcare expenses.',
      icon: 'dollar-sign'
    }
  ];

  const services = [
    {
      title: '24x7 Support',
      description: 'Our clients are our most important priority, and we\'re here for you around the clock.',
      icon: 'clock'
    },
    {
      title: 'Easy Claim System',
      description: 'We\'ve streamlined the process to make it simple to express your needs and file a claim.',
      icon: 'file-check'
    },
    {
      title: 'Easy Installments',
      description: 'Our less complicated payment system makes managing your premiums straightforward.',
      icon: 'credit-card'
    },
    {
      title: 'Strongly Secured',
      description: 'We provide robust protection to secure your precious assets and health.',
      icon: 'shield-check'
    }
  ];

  const coverage = [
    'Hospitalization: Inpatient hospital stays, room charges, surgery costs.',
    'Outpatient Care: Doctor visits, diagnostics, and consultations.',
    'Medications: Prescription drugs and medicines.',
    'Emergency Care: ER visits, urgent care, and ambulance services.',
    'Preventive Care: Vaccinations, screenings, and wellness check-ups.',
    'Specialist Services: Consultations, therapies, and specialized treatments.',
    'Maternity Care: Prenatal, childbirth, and postnatal care.',
    'Diagnostic Tests: Lab tests, X-rays, and imaging.',
    'Mental Health: Therapy, counseling, and psychiatric care.'
  ];

  const keyTerms = [
    { term: 'Premium', definition: 'The amount you pay regularly for your insurance coverage.' },
    { term: 'Deductible', definition: 'The initial amount you must pay out-of-pocket before your insurance coverage begins.' },
    { term: 'Co-payment (Co-pay)', definition: 'A fixed amount you pay for each medical service after meeting your deductible.' },
    { term: 'Network', definition: 'The list of doctors, hospitals, and healthcare providers approved by your insurance plan.' },
    { term: 'Claim', definition: 'A formal request for payment that you submit to your insurer after receiving medical services.' },
    { term: 'Pre-existing Condition', definition: 'A health issue that existed before you purchased your insurance policy.' },
    { term: 'Exclusion', definition: 'Specific situations, treatments, or services that are not covered by the insurance policy.' },
    { term: 'Policy Limit', definition: 'The maximum amount the insurer will pay for a claim or over the policy\'s lifetime.' }
  ];

  const faqs = [
    { question: 'What is health insurance?', answer: 'Health insurance is a type of coverage that helps you manage the cost of medical expenses and healthcare services. When you have health insurance, the insurance company pays a part or the entire amount of your medical bills, depending on the terms of the policy.' },
    { question: 'Why do I need health insurance?', answer: 'Health insurance provides financial protection against high medical costs, ensures access to quality healthcare, and helps maintain financial stability during medical emergencies.' },
    { question: 'What does health insurance cover?', answer: 'Health insurance typically covers hospitalization, outpatient care, medications, emergency care, preventive care, specialist services, maternity care, diagnostic tests, and mental health services.' },
    { question: 'How does health insurance work?', answer: 'You pay regular premiums to maintain coverage. When you need medical services, you pay out-of-pocket costs (deductibles, co-pays) and the insurance company covers the rest up to policy limits.' },
    { question: 'Can I choose my own doctor?', answer: 'It depends on your plan type. Indemnity plans allow you to choose any doctor, while network plans may require using approved providers for full coverage.' },
    { question: 'What\'s a deductible?', answer: 'A deductible is the initial amount you must pay out-of-pocket for covered healthcare services before your insurance plan starts to pay.' },
    { question: 'Is there a waiting period for coverage to start?', answer: 'Most plans have a waiting period (typically 30-90 days) before coverage becomes effective. Some conditions may have longer waiting periods.' },
    { question: 'Are pre-existing conditions covered?', answer: 'Coverage for pre-existing conditions depends on your policy. Some plans exclude them, while others may cover them after a waiting period.' },
    { question: 'How do I make a claim?', answer: 'Submit a claim form with medical bills, receipts, and required documents to your insurance provider. Many plans now offer online claim submission.' },
    { question: 'Are there tax benefits for health insurance?', answer: 'Yes, health insurance premiums are often eligible for tax deductions under Section 80D of the Income Tax Act in India.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta 
        title="Health Insurance - Protect Your Family | Loanzaar" 
        description="Get comprehensive health insurance coverage with affordable premiums. Compare plans and apply online at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <a href="/insurance/all-insurance" className="hover:text-red-500">Insurance</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Health Insurance</span>
        </div>
      </nav>

      {/* Hero Section (What is Health Insurance) */}
      <section id="what-is-health-insurance-section" className="relative bg-gradient-to-br from-blue-50 to-purple-100 py-16 md:py-28 px-6 md:px-16 min-h-[500px] flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">Financial Protection</span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              We provide the best value <span className="text-red-500">Health Insurance</span>
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
            <img src="/health-insurance-hero.png" alt="Health insurance protection shield" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23eff6ff"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%231e40af">Health Insurance Hero Image</text></svg>'} />
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon === 'shield' ? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' : tab.icon === 'layers' ? 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' : tab.icon === 'check-circle' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : tab.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* What is Health Insurance Section */}
      <section id="what-is-health-insurance-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">What is Health Insurance?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Health insurance is a type of coverage that helps you manage the cost of medical expenses and healthcare services. When you have health insurance, the insurance company pays a part or the entire amount of your medical bills, depending on the terms of the policy. This financial protection ensures that you can access necessary medical treatments without having to bear the full financial burden. Health insurance plans can cover a range of healthcare services, including doctor visits, hospital stays, surgeries, medications, and preventive care.
          </p>
          <div className="bg-blue-50 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Health Insurance?</h3>
            <p className="text-lg text-gray-700 mb-6">
              Health insurance provides peace of mind by protecting you from unexpected medical expenses that could otherwise lead to financial hardship.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Financial Protection</h4>
                <p className="text-gray-600">Covers high medical costs and prevents financial burden during health emergencies.</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Access to Care</h4>
                <p className="text-gray-600">Ensures you can access quality healthcare services when you need them most.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Plans Section */}
      <section id="types-of-plans-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Types of Health Insurance Plans</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {planTypes.map((plan, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={plan.icon === 'user-check' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' : 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'} /></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.title}</h3>
                    <p className="text-gray-700">{plan.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Best Services Section */}
      <section className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Best Services</h2>
          <p className="text-lg text-gray-600">We provide comprehensive support and protection for your health insurance needs.</p>
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

      {/* What's Covered Section */}
      <section id="whats-covered-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What does Health Insurance Cover?</h2>
          <p className="text-lg text-gray-600">Health insurance can cover a wide range of medical expenses, which can vary based on your specific plan.</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl">
            <ul className="space-y-4">
              {coverage.map((item, index) => (
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
      <section id="key-terms-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Health Insurance Terms Explained</h2>
          <p className="text-lg text-gray-600">Understanding these essential terms will help you make informed decisions about your health insurance coverage.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {keyTerms.map((term, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">{term.term}</h3>
              <p className="text-gray-600">{term.definition}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs-section" className="py-20 px-6 md:px-16 bg-gray-50">
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
              <div key={index} className="rounded-2xl border border-gray-200 bg-white">
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
          <h2 className="text-4xl font-bold mb-4">Protect Your Health Today</h2>
          <p className="text-xl mb-8">Get comprehensive health insurance coverage that provides peace of mind and financial security for you and your family.</p>        </div>
      </section>

      {/* Modal */}
    </div>
  );
};

export default HealthInsurancePage;

