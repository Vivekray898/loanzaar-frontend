'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { isValidPhoneNumber, formatE164 } from '../utils/phone';

const GoldLoanFormPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(100000); // Default 1 Lakh
  const [interestRate, setInterestRate] = useState(10);
  const [tenure, setTenure] = useState(12); // Default 1 year in months
  const [emi, setEmi] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);

  // Modal states  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    cityState: '',
    ageDob: '',
    goldType: '',
    goldWeight: '',
    purity: '',
    goldValue: '',
    loanAmount: '',
    loanPurpose: '',
    tenure: '',
    consent: false,
    captcha: ''
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

  // Modal functions
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Please agree to the consent declaration.');
      return;
    }
    if (!captchaToken) {
      alert('Please complete the reCAPTCHA verification by checking the "I\'m not a robot" box');
      return;
    }

    // Prepare loan data for backend
    const loanData = {
      ...formData,
      loanType: 'Gold',
      captchaToken: captchaToken
    };

    console.log('📋 Gold Loan Form Data with CAPTCHA:', loanData);

    // Submit to backend
    const result = await submitLoanApplication(loanData);

    if (result.success) {
      console.log('✅ Gold loan submitted successfully:', result.data);
      setSubmitted(true);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 2) setCurrentStep(currentStep + 1);
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
      case 'phoneNumber':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[6-9]\d{9}$/.test(value)) return 'Phone must be 10 digits starting with 6-9';
        return '';
      case 'emailAddress':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'cityState':
        if (!value.trim()) return 'City/State is required';
        if (value.trim().length < 2) return 'City/State must be at least 2 characters';
        return '';
      case 'ageDob':
        if (!value.trim()) return 'Age/Date of Birth is required';
        return '';
      case 'goldType':
        if (!value.trim()) return 'Gold type is required';
        return '';
      case 'goldWeight':
        if (!value.trim()) return 'Gold weight is required';
        if (isNaN(value) || Number(value) <= 0) return 'Gold weight must be a positive number';
        return '';
      case 'purity':
        if (!value.trim()) return 'Purity is required';
        return '';
      case 'goldValue':
        if (!value.trim()) return 'Gold value is required';
        if (isNaN(value) || Number(value) < 1000) return 'Gold value must be at least ₹1,000';
        return '';
      case 'loanAmount':
        if (!value.trim()) return 'Loan amount is required';
        return '';
      case 'loanPurpose':
        if (!value.trim()) return 'Loan purpose is required';
        return '';
      case 'tenure':
        if (!value.trim()) return 'Tenure is required';
        return '';
      default:
        return '';
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 1) {
      // Step 1: Personal & Gold Details
      const fields = ['fullName', 'phoneNumber', 'cityState', 'ageDob', 'goldType', 'goldWeight', 'goldValue', 'loanAmount'];
      fields.forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
          isValid = false;
        }
      });
      // Email is optional
      if (formData.emailAddress) {
        const emailError = validateField('emailAddress', formData.emailAddress);
        if (emailError) {
          errors.emailAddress = emailError;
          isValid = false;
        }
      }
      // Purity is optional
      if (formData.purity) {
        const purityError = validateField('purity', formData.purity);
        if (purityError) {
          errors.purity = purityError;
          isValid = false;
        }
      }
    } else if (step === 2) {
      // Step 2: Loan & Consent
      const fields = ['loanPurpose', 'tenure'];
      fields.forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
          isValid = false;
        }
      });
    }

    setFieldErrors(errors);
    return isValid;
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setFieldErrors({});
      setCurrentStep(currentStep - 1);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'layout-grid' },
    { id: 'features', label: 'Features', icon: 'star' },
    { id: 'eligibility', label: 'Eligibility', icon: 'check-circle' },
    { id: 'documents', label: 'Documents', icon: 'file-text' },
    { id: 'emi-calculator', label: 'EMI Calculator', icon: 'calculator' },
    { id: 'fees', label: 'Fees & Charges', icon: 'credit-card' },
    { id: 'reviews', label: 'Reviews', icon: 'message-circle' },
    { id: 'faqs', label: 'FAQ\'s', icon: 'help-circle' }
  ];

  const features = [
    { id: 'quick-processing', icon: 'zap', title: 'Quick Processing', description: 'Get your loan approved and disbursed in as little as 15 minutes.' },
    { id: 'minimal-docs', icon: 'file-text', title: 'Minimal Documentation', description: 'Apply easily with just your PAN or Aadhaar Card.' },
    { id: 'flexible-amount', icon: 'indian-rupee', title: 'Flexible Loan Amount', description: 'Loans start from as low as ₹5,000, based on your gold\'s value.' },
    { id: 'repayment-options', icon: 'refresh-cw', title: 'Multiple Repayment Options', description: 'Choose a repayment plan that suits your financial situation.' },
    { id: 'lower-rates', icon: 'trending-down', title: 'Lower Interest Rates', description: 'Because it\'s a secured loan, interest rates are more competitive than unsecured loans.' },
    { id: 'versatile-use', icon: 'target', title: 'Versatile Use', description: 'There are no restrictions on how you use the loan amount.' }
  ];

  const eligibilityCriteria = [
    { icon: 'user-check', text: 'Age: You must be 18 years of age or older', highlight: false },
    { icon: 'crown', text: 'Ownership: You must be the legal owner of the gold being pledged', highlight: true },
    { icon: 'star', text: 'Gold Quality: The gold must meet the lender\'s purity standards (typically 18 carats or higher)', highlight: true },
    { icon: 'id-card', text: 'Identification: A valid government-issued ID is required for verification', highlight: false }
  ];

  const documents = [
    { category: 'Identity & Signature Proof', icon: 'id-card', items: ['Voter ID', 'Passport', 'Aadhaar Card', 'Driving License', 'PAN Card'] },
    { category: 'Address Proof', icon: 'home', items: ['Rent Agreement', 'Bank Statement', 'Utility Bills (Telephone/Electricity/Water)', 'Passport', 'Voter ID'] },
    { category: 'Photographs', icon: 'camera', items: ['Two passport-size photographs'] }
  ];

  const feesAndCharges = [
    { particular: 'Loan Processing Fees', charges: '0.2% to 0.6% of the loan amount' },
    { particular: 'Loan Cancellation', charges: '1%' },
    { particular: 'Stamp Duty Charges', charges: 'As per actuals' },
    { particular: 'Legal Fees', charges: 'Nil' },
    { particular: 'Penal Charges', charges: 'Nil' }
  ];

  const reviews = [
    {
      rating: 4,
      text: "I went to Loanzaar Andheri East branch and the employee who works are very friendly.They have sanctioned the Gold loan within couple of hours. The interest rates are very less... I had a good experience.",
      author: "JEET RAIKAR"
    },
    {
      rating: 4,
      text: "Loanzaar helped me in getting an instant gold loan... I went to HDFC Bank to deposit my gold and receive an instant disbursal. Great work by Loanzaar.",
      author: "HEMANSHI VERNEKAR"
    },
    {
      rating: 4,
      text: "Through Loanzaar, I have taken a gold loan with HDFC in 4% rate of interest. Acknowledgement card would be provided with all the payment details and I get SMS alerts for renewal.",
      author: "KAREENA YADAV"
    }
  ];

  const faqs = [
    { question: 'What is a gold loan?', answer: 'A gold loan is a secured loan where you pledge your gold ornaments as collateral to borrow money. It\'s a quick way to access funds without selling your gold.' },
    { question: 'What is the maximum loan amount I can get?', answer: 'Loan amounts typically range from ₹5,000 to ₹1 crore or more, depending on the value, purity, and weight of the gold you pledge.' },
    { question: 'What\'s the repayment period for a gold loan?', answer: 'Repayment periods usually range from 3 months to 5 years, with some lenders offering extensions up to 10 years.' },
    { question: 'What happens if I can\'t repay the loan?', answer: 'If you default on payments, the lender may auction your pledged gold to recover the outstanding amount. It\'s important to repay on time to avoid this.' },
    { question: 'Is the gold safe with the lender?', answer: 'Yes, gold is stored in secure bank vaults with proper documentation. You receive a receipt acknowledging the gold pledge.' },
    { question: 'What documents are required to apply for a Gold Loan?', answer: 'Basic documents include identity proof (Aadhaar/PAN), address proof, and two passport-size photographs. Some lenders may require additional documents.' },
    { question: 'How long does it take to get approval for a Gold Loan?', answer: 'Gold loans can be approved and disbursed within 15-30 minutes at the branch, making them one of the fastest loan options available.' },
    { question: 'Can I extend the repayment period if needed?', answer: 'Yes, many lenders allow loan extensions or renewals. You may need to pay the accrued interest to extend the loan tenure.' },
    { question: 'What is the process for gold retrieval after loan repayment?', answer: 'Once you repay the loan amount plus interest, you receive your gold back immediately. The process is quick and straightforward.' },
    { question: 'Is there a difference between a Gold Loan and a Personal Loan?', answer: 'Yes, gold loans are secured loans backed by gold collateral, offering lower interest rates and higher loan amounts compared to unsecured personal loans.' }
  ];

  const schemas = [
    generateLoanSchema({
      name: 'Gold Loan',
      description: 'Apply for a gold loan with instant approval and competitive interest rates. Quick disbursal and secure storage with flexible repayment options.',
      loanType: 'Gold Loan',
      interestRate: '7-12',
      tenure: '3 months - 3 years',
      amount: '10,000 - 50,00,000'
    }),
    generateWebPageSchema({
      name: 'Gold Loan Application - Loanzaar',
      description: 'Apply for a gold loan with instant approval and competitive interest rates. Quick disbursal and secure storage at Loanzaar.',
      url: 'https://loanzaar.in/gold-loan',
      breadcrumbs: [
        { name: 'Home', url: 'https://loanzaar.in' },
        { name: 'Gold Loan', url: 'https://loanzaar.in/gold-loan' }
      ]
    })
  ];

  return (
    <div className="min-h-screen bg-white">
      <StructuredData schema={schemas} />
      <Meta 
        title="Gold Loan Application - Loanzaar" 
        description="Apply for a gold loan with instant approval and competitive interest rates. Quick disbursal and secure storage at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Gold Loan</span>
        </div>
      </nav>

      {/* Hero Section (Overview) */}
      <section id="overview-section" className="relative bg-gradient-to-br from-yellow-50 to-yellow-100 py-16 md:py-28 px-6 md:px-16 min-h-[500px] flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-yellow-100 text-yellow-600 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">Secure Financing</span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Instant Gold Loans to Meet Your <span className="text-red-500">Financial Needs</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Access secure Gold Loans with no hidden fees and faster approvals! Turn your gold into instant funds without having to sell your valuable assets.</p>
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition" onClick={() => setShowModal(true)}>Apply Now</button>
            <div className="flex space-x-6 mt-8">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-600">100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-600">Quick Approval</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm text-gray-600">No Hidden Fees</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="/gold-loan-hero.png" alt="Gold jewelry and coins" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">Gold Loan Hero Image</text></svg>'} />
            <div className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg animate-bounce">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon === 'layout-grid' ? 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' : tab.icon === 'star' ? 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' : tab.icon === 'check-circle' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : tab.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : tab.icon === 'calculator' ? 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' : tab.icon === 'credit-card' ? 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' : tab.icon === 'message-circle' ? 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' : 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Overview Section */}
      <section id="overview-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">What is a Gold Loan?</h2>
          <p className="text-lg text-gray-600 mb-8">
            A Gold Loan is a secured loan that you can avail by pledging your gold ornaments as collateral. It's a quick and straightforward way to meet your urgent financial needs.
          </p>
          <div className="bg-yellow-50 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Features & Benefits:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="text-yellow-500 font-bold">•</span>
                <span><strong>Quick Processing:</strong> Get your loan approved and disbursed in as little as 15 minutes.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-yellow-500 font-bold">•</span>
                <span><strong>Minimal Documentation:</strong> Apply easily with just your PAN or Aadhaar Card.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-yellow-500 font-bold">•</span>
                <span><strong>Flexible Loan Amount:</strong> Loans start from as low as ₹5,000, based on your gold's value.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-yellow-500 font-bold">•</span>
                <span><strong>Multiple Repayment Options:</strong> Choose a repayment plan that suits your financial situation.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-yellow-500 font-bold">•</span>
                <span><strong>Lower Interest Rates:</strong> Because it's a secured loan, interest rates are more competitive than unsecured loans.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-yellow-500 font-bold">•</span>
                <span><strong>Versatile Use:</strong> There are no restrictions on how you use the loan amount.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Features and Benefits</h2>
          <p className="text-lg text-gray-600">Our gold loans come with a range of features designed to provide quick and secure financing.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon === 'zap' ? 'M13 10V3L4 14h7v7l9-11h-7z' : feature.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : feature.icon === 'indian-rupee' ? 'M9 8h6m-5 4h4m-7 6h.01M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : feature.icon === 'refresh-cw' ? 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' : feature.icon === 'trending-down' ? 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' : 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'} /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Eligibility CTA Section */}
      <section className="py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-3xl p-12 text-white text-center shadow-xl">
          <svg className="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="text-3xl font-bold mb-4">Gold Loan Eligibility and Documents</h2>
          <p className="text-lg mb-8">Read on to know the criteria and documents required to apply for our Gold Loan.</p>
          <button className="bg-white text-yellow-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition" onClick={() => setShowModal(true)}>Apply</button>
        </div>
      </section>

      {/* Eligibility Section */}
      <section id="eligibility-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Eligibility Criteria</h2>
          <p className="text-lg text-gray-600 mb-12">To qualify for a gold loan, you have to meet certain criteria. Below are the important factors that lenders take into consideration.</p>
          <div className="grid md:grid-cols-1 gap-6 max-w-4xl mx-auto">
            {eligibilityCriteria.map((criteria) => (
              <div key={criteria.text} className={`p-6 rounded-lg border ${criteria.highlight ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start space-x-4">
                  <svg className={`w-8 h-8 mt-1 ${criteria.highlight ? 'text-yellow-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={criteria.icon === 'user-check' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' : criteria.icon === 'crown' ? 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' : criteria.icon === 'star' ? 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' : 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' } /></svg>
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
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={doc.icon === 'id-card' ? 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' : doc.icon === 'home' ? 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' : 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' } /></svg>
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

      {/* EMI Calculator Section */}
      <section id="emi-calculator-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">EMI Calculator for Gold Loan</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto">Our Gold Loan EMI calculator helps you understand your monthly repayment obligations before you commit to the loan.</p>
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount: ₹{loanAmount.toLocaleString()}</label>
                <input type="range" min="5000" max="10000000" step="5000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate: {interestRate}%</label>
                <input type="range" min="7" max="15" step="0.25" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Tenure: {tenure} months</label>
                <input type="range" min="3" max="60" step="3" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full" />
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
            <div className="mt-6 text-left text-sm text-gray-600">
              <p className="font-semibold mb-2">How is Gold Loan EMI Calculated?</p>
              <p>The Equated Monthly Installment (EMI) is calculated using the standard compound interest formula:</p>
              <p className="font-mono bg-white p-2 rounded mt-2">EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]</p>
              <p className="mt-2">P: Principal loan amount, r: Monthly interest rate (Annual rate / 12), n: Loan tenure in months</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fees and Charges Section */}
      <section id="fees-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Fees and Charges</h2>
          <p className="text-lg text-gray-600 mb-12">The fees associated with a Gold Loan can vary. This table provides a general overview:</p>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <table className="w-full">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Particulars</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feesAndCharges.map((fee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{fee.particular}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fee.charges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          <p className="text-lg text-gray-600 mb-12">See what our satisfied customers have to say!</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <p className="text-sm font-semibold text-yellow-600">— {review.author}</p>
              </div>
            ))}
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
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to meet your financial needs?</h2>
          <p className="text-xl mb-8">Turn your gold into instant funds without selling your valuable assets.</p>
          <button className="bg-white text-yellow-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg" onClick={() => setShowModal(true)}>Apply for Your Gold Loan Today!</button>
        </div>
      </section>

      {/* Modal */}
    </div>
  );
};

export default GoldLoanFormPage;

