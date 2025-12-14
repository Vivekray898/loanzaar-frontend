'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { isValidPhoneNumber, formatE164 } from '../utils/phone';

const MachineryLoanPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(2500000); // Default 25 Lakh
  const [interestRate, setInterestRate] = useState(12);
  const [tenure, setTenure] = useState(60); // Default 5 years in months
  const [emi, setEmi] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cityState: '',
    businessName: '',
    businessType: 'Proprietorship',
    machineryType: '',
    loanPurpose: 'Purchase New',
    machineryCost: '',
    loanAmount: 1000000,
    tenure: '',
    industryType: 'Manufacturing',
    yearsInBusiness: '',
    turnover: '',
    profit: '',
    existingLoans: 'No',
    itrFiled: 'No',
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

  // --- EMI Calculation ---
  useEffect(() => {
    const principal = loanAmount;
    const rate = interestRate / 100 / 12;
    const time = tenure;
    if (principal > 0 && rate > 0 && time > 0) {
        const emiCalc = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
        const total = emiCalc * time;
        const interest = total - principal;

        setEmi(Math.round(emiCalc));
        setTotalAmount(Math.round(total));
        setTotalInterest(Math.round(interest));
    }
  }, [loanAmount, interestRate, tenure]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Please enter a valid 10-digit phone number starting with 6-9');
      return;
    }
    if (!formData.consent) {
      alert('Please agree to be contacted');
      return;
    }
    // CAPTCHA check
    if (!captchaToken) {
      alert('Please complete the reCAPTCHA verification by checking the "I\'m not a robot" box');
      return;
    }

    // Prepare loan data for backend
    const loanData = {
      ...formData,
      loanType: 'Machinery',
      captchaToken: captchaToken
    };

    console.log('📋 Machinery Loan Form Data with CAPTCHA:', loanData);

    // Submit to backend
    const result = await submitLoanApplication(loanData);

    if (result.success) {
      console.log('✅ Machinery loan submitted successfully:', result.data);
      setSubmitted(true);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setFieldErrors({});
    setCurrentStep(currentStep - 1);
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    console.log('✅ reCAPTCHA token received:', token);
  };

  const validateField = (fieldName, value) => {
    switch(fieldName) {
      case 'fullName':
        if (!value || value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s]*$/.test(value)) return 'Full name should contain only letters';
        return '';
      case 'phone':
        if (!value || !/^[6-9]\d{9}$/.test(value)) return 'Phone must be 10 digits starting with 6-9';
        return '';
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'cityState':
        if (!value || value.trim().length < 2) return 'City/State must be at least 2 characters';
        return '';
      case 'businessName':
        if (!value || value.trim().length < 2) return 'Business name must be at least 2 characters';
        return '';
      case 'machineryType':
        if (!value) return 'Please select a machinery type';
        return '';
      case 'loanPurpose':
        if (!value) return 'Please select loan purpose';
        return '';
      case 'machineryCost':
        if (!value) return 'Please select machinery cost range';
        return '';
      case 'tenure':
        if (!value) return 'Please select tenure';
        return '';
      case 'yearsInBusiness':
        if (!value) return 'Please select years in business';
        return '';
      case 'turnover':
        if (!value) return 'Please select annual turnover';
        return '';
      case 'industryType':
        if (!value) return 'Please select industry type';
        return '';
      default:
        return '';
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 0) {
      const nameErr = validateField('fullName', formData.fullName);
      const phoneErr = validateField('phone', formData.phone);
      const emailErr = validateField('email', formData.email);
      const cityErr = validateField('cityState', formData.cityState);
      const businessErr = validateField('businessName', formData.businessName);
      
      if (nameErr) { errors.fullName = nameErr; isValid = false; }
      if (phoneErr) { errors.phone = phoneErr; isValid = false; }
      if (emailErr) { errors.email = emailErr; isValid = false; }
      if (cityErr) { errors.cityState = cityErr; isValid = false; }
      if (businessErr) { errors.businessName = businessErr; isValid = false; }
    } else if (step === 1) {
      const typeErr = validateField('machineryType', formData.machineryType);
      const purposeErr = validateField('loanPurpose', formData.loanPurpose);
      const costErr = validateField('machineryCost', formData.machineryCost);
      const tenureErr = validateField('tenure', formData.tenure);
      const industryErr = validateField('industryType', formData.industryType);
      
      if (typeErr) { errors.machineryType = typeErr; isValid = false; }
      if (purposeErr) { errors.loanPurpose = purposeErr; isValid = false; }
      if (costErr) { errors.machineryCost = costErr; isValid = false; }
      if (tenureErr) { errors.tenure = tenureErr; isValid = false; }
      if (industryErr) { errors.industryType = industryErr; isValid = false; }
    } else if (step === 2) {
      const yearsErr = validateField('yearsInBusiness', formData.yearsInBusiness);
      const turnoverErr = validateField('turnover', formData.turnover);
      
      if (yearsErr) { errors.yearsInBusiness = yearsErr; isValid = false; }
      if (turnoverErr) { errors.turnover = turnoverErr; isValid = false; }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'layout-grid' },
    { id: 'features', label: 'Features', icon: 'star' },
    { id: 'eligibility', label: 'Eligibility', icon: 'check-circle' },
    { id: 'documents', label: 'Documents', icon: 'file-text' },
    { id: 'financing-options', label: 'Financing Options', icon: 'settings' },
    { id: 'emi-calculator', label: 'EMI Calculator', icon: 'calculator' },
    { id: 'how-to-apply', label: 'How to Apply', icon: 'clipboard-list' },
    { id: 'faqs', label: 'FAQ\'s', icon: 'help-circle' }
  ];

  const features = [
    { id: 'wide-range', icon: 'layers', title: 'Wide Range of Options', description: 'Access various machinery and equipment loan products.' },
    { id: 'high-amount', icon: 'indian-rupee', title: 'High Loan Amount', description: 'Secure financing from ₹5 Lakh to ₹5 Crore.' },
    { id: 'flexible-tenure', icon: 'calendar', title: 'Flexible Tenure', description: 'Choose a repayment period from 12 to 60 Months.' },
    { id: 'minimal-docs', icon: 'file-text', title: 'Minimal Documentation', description: 'A streamlined, digital application process.' },
    { id: 'high-financing', icon: 'trending-up', title: 'High Financing', description: 'Get a loan for up to 100% of the equipment price.' },
    { id: 'competitive-rates', icon: 'percent', title: 'Competitive Interest Rates', description: 'Rates start from 12% onwards.' },
    { id: 'no-collateral', icon: 'shield-off', title: 'No Additional Collateral', description: 'For many of our loan products.' },
    { id: 'quick-disbursal', icon: 'zap', title: 'Quick Disbursal', description: 'Fast processing to get you the funds you need.' },
    { id: 'customized-repayment', icon: 'refresh-cw', title: 'Customized Repayment', description: 'Flexible foreclosure and repayment options.' }
  ];

  const financingOptions = [
    { title: 'Medical Equipment Loans', description: 'Specialized financing for healthcare machinery and equipment.' },
    { title: 'Construction Machinery Finance', description: 'Heavy machinery financing for construction businesses.' },
    { title: 'Manufacturing Equipment Loans', description: 'Equipment financing for manufacturing and production facilities.' },
    { title: 'Farm Machinery Loans', description: 'Agricultural machinery and equipment financing.' },
    { title: 'Aviation Industry Equipment Loans', description: 'Specialized equipment financing for aviation businesses.' },
    { title: 'Used Machinery Loans', description: 'Financing options for pre-owned machinery and equipment.' },
    { title: 'Loan Against Machinery', description: 'Use your existing machinery as collateral for additional financing.' }
  ];

  const eligibilityCriteria = [
    { icon: 'user-check', text: 'Age: Applicant must be between 21 and 65 years of age', highlight: false },
    { icon: 'star', text: 'Credit Score: A CIBIL score of 650 or higher is required', highlight: true },
    { icon: 'briefcase', text: 'Business Vintage: Your business should have a minimum operational history of 3 years', highlight: true }
  ];

  const documents = [
    { category: 'KYC Documents', icon: 'id-card', items: ['Aadhaar card', 'PAN card', 'Driving license', 'Passport'] },
    { category: 'Income Proof', icon: 'trending-up', items: ['Income Tax Returns (ITR) for the last 3 years'] },
    { category: 'Business Proof', icon: 'building', items: ['Business ownership documents'] },
    { category: 'Purchase Details', icon: 'shopping-cart', items: ['Proforma invoice of the machinery you intend to purchase'] },
    { category: 'Financials', icon: 'file-text', items: ['Bank statements for the last 6 months'] }
  ];

  const faqs = [
    { question: 'What is the interest rate for machinery finance?', answer: 'Interest rates for machinery loans typically start from 12% onwards, depending on the lender, loan amount, tenure, and your credit profile.' },
    { question: 'Can machinery be used as collateral?', answer: 'Yes, machinery can be used as collateral for secured loans. This often results in lower interest rates and higher loan amounts.' },
    { question: 'What is the interest rate for an MSME machinery loan?', answer: 'MSME machinery loans generally have competitive interest rates starting from 11-13%, with special schemes offering even lower rates for eligible businesses.' },
    { question: 'Who are the lenders offering machinery loans?', answer: 'Major banks, NBFCs, and financial institutions like HDFC, ICICI, Kotak Mahindra, Tata Capital, and specialized equipment financiers offer machinery loans.' },
    { question: 'Who are the lenders offering machinery refinancing?', answer: 'Most major banks and NBFCs offer machinery refinancing options, allowing you to refinance existing equipment loans at potentially lower rates.' },
    { question: 'What are the eligibility criteria for machinery loans?', answer: 'Key criteria include age 21-65, minimum 3 years business vintage, CIBIL score of 650+, and stable business income.' },
    { question: 'Is a machinery loan secured or unsecured?', answer: 'Machinery loans can be both secured (with collateral) or unsecured, depending on the lender\'s policies and your credit profile.' }
  ];

  const schemas = [
    generateLoanSchema({
      name: 'Machinery Loan',
      description: 'Finance your industrial equipment and machinery with dedicated business loans. Fast approval for MSME sector with flexible repayment options.',
      loanType: 'Machinery Loan',
      interestRate: '10-16',
      tenure: '2-5 years',
      amount: '5,00,000 - 2,00,00,000'
    }),
    generateWebPageSchema({
      name: 'Machinery Loan - For MSME Business Expansion | Loanzaar',
      description: 'Finance your industrial equipment and machinery with dedicated business loans. Fast approval for MSME sector at Loanzaar.',
      url: 'https://loanzaar.in/machinery-loan',
      breadcrumbs: [
        { name: 'Home', url: 'https://loanzaar.in' },
        { name: 'Machinery Loan', url: 'https://loanzaar.in/machinery-loan' }
      ]
    })
  ];

  return (
    <div className="min-h-screen bg-white">
      <StructuredData schema={schemas} />
      <Meta 
        title="Machinery Loan - For MSME Business Expansion | Loanzaar" 
        description="Finance your industrial equipment and machinery with dedicated business loans. Fast approval for MSME sector at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Machinery Loan</span>
        </div>
      </nav>

      {/* Hero Section (Overview) */}
      <section id="overview-section" className="relative bg-gradient-to-br from-orange-50 to-orange-100 py-16 md:py-28 px-6 md:px-16 min-h-[500px] flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">Business Equipment Finance</span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Transform Your Business with a <span className="text-red-500">Machinery Loan</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Flexible loan options to help you acquire the right machinery for business expansion. Unlock your business's potential with the right equipment.</p>            <div className="flex space-x-6 mt-8">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-600">100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-600">Quick Approval</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm text-gray-600">High Loan Amounts</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="/machinery-loan-hero.png" alt="Industrial machinery and equipment" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">Machinery Hero Image</text></svg>'} />
            <div className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg animate-bounce">
              <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon === 'layout-grid' ? 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' : tab.icon === 'star' ? 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' : tab.icon === 'check-circle' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : tab.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : tab.icon === 'calculator' ? 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' : tab.icon === 'settings' ? 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' : tab.icon === 'clipboard-list' ? 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' : 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Overview Section */}
      <section id="overview-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">What are Machinery Loans?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Machinery loans are a type of business loan that can be used to buy new machines or upgrade existing equipment. They help businesses overcome financial barriers, enabling them to scale operations without interruptions. We connect you with India's top-tier banks and financial institutions to ensure you get the best deal with higher loan amounts, attractive interest rates, and flexible tenures.
          </p>
          <div className="bg-orange-50 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">A machinery loan is a financial solution designed to empower businesses to acquire or upgrade essential equipment without straining their working capital.</h3>
            <p className="text-gray-600">This financing ensures businesses can enhance operational efficiency, integrate advanced technology, and stay competitive in the market.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Features and Benefits</h2>
          <p className="text-lg text-gray-600">Upgrade your business operations effortlessly with our hassle-free machinery and equipment financing options.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon === 'layers' ? 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' : feature.icon === 'indian-rupee' ? 'M9 8h6m-5 4h4m-7 6h.01M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : feature.icon === 'calendar' ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' : feature.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : feature.icon === 'trending-up' ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : feature.icon === 'percent' ? 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' : feature.icon === 'shield-off' ? 'M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.884-5.828-2.709M12 22c4.418 0 8-4.03 8-9 0-1.564-.322-3.05-.91-4.38L12 2 4.91 8.62A7.963 7.963 0 014 13c0 4.97 3.582 9 8 9z' : feature.icon === 'zap' ? 'M13 10V3L4 14h7v7l9-11h-7z' : 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'} /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Eligibility CTA Section */}
      <section className="py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-white text-center shadow-xl">
          <svg className="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="text-3xl font-bold mb-4">Machinery Loan Eligibility and Documents</h2>
          <p className="text-lg mb-8">Read on to know the criteria and documents required to apply for our Machinery Loan.</p>
          <button className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition">Apply</button>
        </div>
      </section>

      {/* Eligibility Section */}
      <section id="eligibility-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Eligibility Criteria</h2>
          <p className="text-lg text-gray-600 mb-12">To qualify for a machinery loan, you have to meet certain criteria. Below are the important factors that lenders take into consideration.</p>
          <div className="grid md:grid-cols-1 gap-6 max-w-4xl mx-auto">
            {eligibilityCriteria.map((criteria) => (
              <div key={criteria.text} className={`p-6 rounded-lg border ${criteria.highlight ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start space-x-4">
                  <svg className={`w-8 h-8 mt-1 ${criteria.highlight ? 'text-orange-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={criteria.icon === 'user-check' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' : criteria.icon === 'star' ? 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' : 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4' } /></svg>
                  <p className="text-gray-700">{criteria.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section id="documents-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Required Documents</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {documents.map((doc) => (
              <div key={doc.category} className="bg-white p-8 rounded-xl shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={doc.icon === 'id-card' ? 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' : doc.icon === 'trending-up' ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : doc.icon === 'building' ? 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' : doc.icon === 'shopping-cart' ? 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1-5M7 13l1.1 5M9 21a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z' : 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' } /></svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{doc.category}</h3>
                </div>
                <ul className="space-y-2">
                  {doc.items.map((item) => (
                    <li key={item} className="flex items-center space-x-2 text-gray-600">
                      <span className="text-gray-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financing Options Section */}
      <section id="financing-options-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Financing Options</h2>
          <p className="text-lg text-gray-600 mb-12">We offer a wide range of machinery and equipment financing options to suit your business requirements:</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financingOptions.map((option, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMI Calculator Section */}
      <section id="emi-calculator-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">EMI Calculator for Machinery Loan</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto">A Machinery Loan EMI Calculator is a simple online tool that helps you estimate your Equated Monthly Installment (EMI). By entering the loan amount, interest rate, and tenure, you can get an accurate estimate of your monthly payments. This enables you to plan your finances and manage cash flow effectively when investing in new machinery.</p>
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount: ₹{loanAmount.toLocaleString()}</label>
                <input type="range" min="500000" max="50000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate: {interestRate}%</label>
                <input type="range" min="10" max="20" step="0.5" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Tenure: {tenure} months</label>
                <input type="range" min="12" max="60" step="6" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full" />
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">₹{emi.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Monthly EMI</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">₹{totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">₹{totalInterest.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Interest</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section id="how-to-apply-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">How to Apply Online</h2>
          <p className="text-lg text-gray-600 mb-12">Follow these simple steps to apply for a machinery and equipment loan online:</p>
          <div className="grid md:grid-cols-1 gap-8 max-w-4xl mx-auto">
            <div className="bg-orange-50 p-8 rounded-xl">
              <ol className="list-decimal list-inside space-y-4 text-gray-700">
                <li><strong>Visit Our Website:</strong> Navigate to the Machinery Loan section on Loanzaar.com.</li>
                <li><strong>Apply & Verify:</strong> Click "Apply Now" and sign in with your mobile number, verifying with the OTP sent.</li>
                <li><strong>Fill Out the Form:</strong> Complete the consent form, agree to the Terms & Conditions, and enter your address, income, and loan details.</li>
                <li><strong>Submit Your Application:</strong> Select "Loanzaar Experts" as the provider and submit your application.</li>
              </ol>
              <p className="mt-6 text-gray-600">Once submitted, our team will work to find the best deal that suits your business needs while you wait for approval.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl px-6 py-4 text-left"
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
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to upgrade your business?</h2>
          <p className="text-xl mb-8">Transform your operations with the right machinery and equipment financing.</p>        </div>
      </section>

      {/* Inquiry Modal */}
    </div>
  );
};

export default MachineryLoanPage;

