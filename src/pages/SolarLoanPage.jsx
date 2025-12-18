'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { isValidPhoneNumber, formatE164 } from '../utils/phone';

const SolarLoanPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(1000000); // Default 10 Lakhs
  const [interestRate, setInterestRate] = useState(10);
  const [tenure, setTenure] = useState(60); // Default 5 years in months
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
    propertyType: '',
    ownershipType: '',
    roofTypeArea: '',
    systemCapacity: '',
    installationStatus: '',
    vendorName: '',
    projectCost: '',
    loanAmount: '',
    tenure: '',
    loanPurpose: '',
    employmentType: '',
    monthlyIncome: '',
    existingLoans: '',
    itrFiled: '',
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
      loanType: 'Solar',
      captchaToken: captchaToken
    };

    console.log('📋 Solar Loan Form Data with CAPTCHA:', loanData);

    // Submit to backend
    const result = await submitLoanApplication(loanData);

    if (result.success) {
      console.log('✅ Solar loan submitted successfully:', result.data);
      setSubmitted(true);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
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
        if (!isValidPhoneNumber(value)) return 'Please enter a valid phone number';
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
      case 'propertyType':
        if (!value.trim()) return 'Property type is required';
        return '';
      case 'ownershipType':
        if (!value.trim()) return 'Ownership type is required';
        return '';
      case 'roofTypeArea':
        if (!value.trim()) return 'Roof type/area is required';
        return '';
      case 'systemCapacity':
        if (!value.trim()) return 'System capacity is required';
        return '';
      case 'installationStatus':
        if (!value.trim()) return 'Installation status is required';
        return '';
      case 'projectCost':
        if (!value.trim()) return 'Project cost is required';
        if (isNaN(value) || Number(value) < 10000) return 'Project cost must be at least ₹10,000';
        return '';
      case 'loanAmount':
        if (!value.trim()) return 'Loan amount is required';
        return '';
      case 'tenure':
        if (!value.trim()) return 'Tenure is required';
        return '';
      case 'loanPurpose':
        if (!value.trim()) return 'Loan purpose is required';
        return '';
      case 'employmentType':
        if (!value.trim()) return 'Employment type is required';
        return '';
      case 'monthlyIncome':
        if (!value.trim()) return 'Monthly income is required';
        return '';
      case 'existingLoans':
        if (!value.trim()) return 'Please specify existing loans';
        return '';
      case 'itrFiled':
        if (!value.trim()) return 'Please specify ITR filing status';
        return '';
      default:
        return '';
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 1) {
      // Step 1: Applicant Details
      const fields = ['fullName', 'phoneNumber', 'cityState', 'ageDob'];
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
    } else if (step === 2) {
      // Step 2: Property & Loan Details
      const fields = ['propertyType', 'ownershipType', 'roofTypeArea', 'systemCapacity', 'installationStatus', 'projectCost', 'loanAmount', 'tenure', 'loanPurpose', 'employmentType', 'monthlyIncome', 'existingLoans', 'itrFiled'];
      fields.forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
          isValid = false;
        }
      });
      // vendorName is optional
    } else if (step === 3) {
      // Step 3: Consent & Declaration - no field validation needed, just checkbox & captcha in submit
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
    { id: 'how-to-apply', label: 'How to Apply', icon: 'clipboard-list' },
    { id: 'faqs', label: 'FAQ\'s', icon: 'help-circle' }
  ];

  const features = [
    { id: 'comprehensive-financing', icon: 'sun', title: 'Comprehensive Financing', description: 'Covers the cost of solar panels plus all related ancillary equipment.' },
    { id: 'loan-amount', icon: 'indian-rupee', title: 'Flexible Loan Amount', description: 'Minimum ₹60 Lakhs to ₹3 Crores based on your requirements.' },
    { id: 'attractive-rates', icon: 'trending-down', title: 'Attractive Interest Rates', description: 'Starting from 7.99% Flat Rate or 12.5% Reducing Balance Rate.' },
    { id: 'flexible-tenure', icon: 'calendar', title: 'Flexible Tenure', description: 'Repayment periods from 12 to 84 months.' },
    { id: 'quick-approvals', icon: 'zap', title: 'Quick Approvals', description: 'Score-based assessment for faster processing.' },
    { id: 'minimal-docs', icon: 'file-text', title: 'Minimal Documentation', description: 'Streamlined, digital application process.' },
    { id: 'no-collateral', icon: 'shield-off', title: 'No Additional Collateral', description: 'Required for most cases.' },
    { id: 'affordable-emis', icon: 'calculator', title: 'Affordable EMIs', description: 'Loan EMIs can be lower than your current electricity bills.' }
  ];

  const eligibilityCriteria = [
    { icon: 'bank', text: 'Average Bank Balance (ABB) Program: Maximum EMI calculated as 50% of your average bank balance over the last 12 months', highlight: true },
    { icon: 'receipt', text: 'GST Program: Eligibility based on your GST turnover for the last 12 months, applying industry net margins', highlight: true },
    { icon: 'sun', text: 'Savings with Renewable Energy: We calculate your potential energy savings from solar panel installation and add it back to your eligibility for a higher loan amount', highlight: true }
  ];

  const documents = [
    {
      category: 'Company KYC',
      icon: 'building',
      items: ['GST Certificate', 'Shop Light Bill', 'Udyam Registration Certificate']
    },
    {
      category: 'Applicant & Co-Applicant KYC',
      icon: 'user-check',
      items: ['PAN Card', 'Aadhaar Card', 'Residence Electricity Bill']
    },
    {
      category: 'Financial Documents',
      icon: 'trending-up',
      items: ['Bank Statement (Last 1 year in PDF format)', 'Last 2 Years\' Income Tax Returns (ITR)']
    }
  ];

  const feesAndCharges = [
    { particular: 'Loan Processing Fees', charges: '0.2% to 0.6% of the loan amount' },
    { particular: 'Loan Cancellation', charges: '1%' },
    { particular: 'Stamp Duty Charges', charges: 'As per actuals' },
    { particular: 'Legal Fees', charges: 'Nil' },
    { particular: 'Penal Charges', charges: 'Nil' }
  ];

  const howToApplySteps = [
    {
      step: 1,
      title: 'Visit our Website',
      description: 'Go to www.Loanzaar.com and select the Solar Loan option from the Loans menu.',
      icon: 'globe'
    },
    {
      step: 2,
      title: 'Start Application',
      description: 'Click on the "Apply Now" button.',
      icon: 'play-circle'
    },
    {
      step: 3,
      title: 'Sign In',
      description: 'Log in using your mobile number linked to your Aadhaar and PAN, and verify with the OTP.',
      icon: 'log-in'
    },
    {
      step: 4,
      title: 'Fill Details',
      description: 'Complete the consent form with your basic, address, and income details.',
      icon: 'edit'
    },
    {
      step: 5,
      title: 'Submit',
      description: 'Agree to the Terms & Conditions, provide loan details, select "Loanzaar Experts" as the provider, and submit your application.',
      icon: 'send'
    }
  ];

  const faqs = [
    { question: 'Can I install solar panels on an EMI plan?', answer: 'Yes, solar panel loans allow you to install rooftop solar systems by paying through easy monthly EMIs instead of the entire cost upfront.' },
    { question: 'What is the cost of solar panels for rooftops?', answer: 'Solar panel costs vary based on system size, quality, and location. Typically, a 3kW system costs between ₹2-3 lakhs, while larger systems can cost up to ₹10 lakhs or more.' },
    { question: 'What are the typical interest rates for a solar panel loan?', answer: 'Interest rates typically range from 7.99% (flat rate) to 12.5% (reducing balance rate), depending on your credit profile and lender policies.' },
    { question: 'Is there a subsidy or government incentive for solar panel loans?', answer: 'Yes, various government schemes like PM-KUSUM, Surya Ghar Muft Bijli Yojana, and state-specific subsidies are available. These can significantly reduce your effective cost.' },
    { question: 'How soon will I see savings after taking a rooftop solar panel loan?', answer: 'Most homeowners start seeing savings within 3-6 months of installation, depending on your electricity consumption and local tariff rates.' },
    { question: 'Can I prepay my solar panel loan?', answer: 'Yes, most lenders allow prepayment with minimal or no prepayment charges, especially if you have surplus funds from energy savings.' }
  ];

  const schemas = [
    generateLoanSchema({
      name: 'Solar Loan',
      description: 'Get solar panel loans with attractive interest rates and government schemes. Go green and save on electricity with flexible financing up to 10 years.',
      loanType: 'Solar Loan',
      interestRate: '8-12',
      tenure: '5-10 years',
      amount: '50,000 - 25,00,000'
    }),
    generateWebPageSchema({
      name: 'Solar Loan - Finance Your Solar Installation | Loanzaar',
      description: 'Get solar panel loans with attractive interest rates and government schemes. Go green and save on electricity at Loanzaar.',
      url: 'https://loanzaar.in/solar-loan',
      breadcrumbs: [
        { name: 'Home', url: 'https://loanzaar.in' },
        { name: 'Solar Loan', url: 'https://loanzaar.in/solar-loan' }
      ]
    })
  ];

  return (
    <div className="min-h-screen bg-white">
      <StructuredData schema={schemas} />
      <Meta 
        title="Solar Loan - Finance Your Solar Installation | Loanzaar" 
        description="Get solar panel loans with attractive interest rates and government schemes. Go green and save on electricity at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Solar Loan</span>
        </div>
      </nav>

      {/* Hero Section (Overview) */}
      <section id="overview-section" className="relative bg-gradient-to-br from-surface-bg to-slate-50 py-16 md:py-28 px-6 md:px-16 min-h-[500px] flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">Go Green Financing</span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Solar Panel Loans & <span className="text-red-500">Rooftop Financing</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Get a solar panel loan with low interest rates. We make solar rooftop loans and green energy financing easy and affordable for homes and businesses.</p>
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition" onClick={() => setShowModal(true)}>Apply Now</button>
            <div className="flex space-x-6 mt-8">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-600">100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-600">Quick Approval</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm text-gray-600">Low Interest Rates</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="/solar-panels-hero.png" alt="Solar panels on rooftop" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f0fdf4"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%2316a34a">Solar Panels Hero Image</text></svg>'} />
            <div className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg animate-bounce">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2L13.09 8.26L20 9L15 14L16.18 21L10 17.77L3.82 21L5 14L0 9L6.91 8.26L10 2Z" clipRule="evenodd" /></svg>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon === 'layout-grid' ? 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' : tab.icon === 'star' ? 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' : tab.icon === 'check-circle' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : tab.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : tab.icon === 'calculator' ? 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' : tab.icon === 'credit-card' ? 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' : tab.icon === 'clipboard-list' ? 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' : 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Overview Section */}
      <section id="overview-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">What is a Solar Panel Loan?</h2>
          <p className="text-lg text-gray-600 mb-8">
            A Solar Panel Loan is a smart financial solution that enables homeowners and businesses to install rooftop solar systems without paying the entire cost upfront. The total cost is divided into easy monthly EMIs, making the shift to solar energy affordable and accessible.
          </p>
          <p className="text-lg text-gray-600 mb-8">
            By choosing a solar panel loan, you can lower your electricity bills, reduce dependency on conventional power sources, and actively contribute to a greener, more sustainable future.
          </p>
          <div className="bg-green-50 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Benefits of Going Solar:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">•</span>
                <span><strong>Lower Electricity Bills:</strong> Generate your own clean energy and reduce monthly electricity costs.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">•</span>
                <span><strong>Environmental Impact:</strong> Reduce carbon footprint and contribute to a sustainable future.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">•</span>
                <span><strong>Government Incentives:</strong> Access various subsidies and tax benefits available for solar installations.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">•</span>
                <span><strong>Energy Independence:</strong> Become less dependent on grid electricity and power fluctuations.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">•</span>
                <span><strong>Property Value Increase:</strong> Solar installations can increase your property's market value.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Features and Benefits</h2>
          <p className="text-lg text-gray-600">Our solar panel loans are designed to make your transition to green energy seamless and beneficial.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon === 'sun' ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' : feature.icon === 'indian-rupee' ? 'M9 8h6m-5 4h4m-7 6h.01M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : feature.icon === 'trending-down' ? 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' : feature.icon === 'calendar' ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' : feature.icon === 'zap' ? 'M13 10V3L4 14h7v7l9-11h-7z' : feature.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : feature.icon === 'shield-off' ? 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' : 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'} /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Eligibility CTA Section */}
      <section className="py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-accent-success to-primary-500 rounded-3xl p-12 text-white text-center shadow-xl">
          <svg className="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="text-3xl font-bold mb-4">Solar Panel Loan Eligibility and Documents</h2>
          <p className="text-lg mb-8">Read on to know the criteria and documents required for your Solar Panel Loan.</p>
          <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition" onClick={() => setShowModal(true)}>Apply</button>
        </div>
      </section>

      {/* Eligibility Section */}
      <section id="eligibility-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Eligibility Criteria</h2>
          <p className="text-lg text-gray-600 mb-12">Loan eligibility is determined based on one of the following programs:</p>
          <div className="grid md:grid-cols-1 gap-6 max-w-4xl mx-auto">
            {eligibilityCriteria.map((criteria) => (
              <div key={criteria.text} className={`p-6 rounded-lg border ${criteria.highlight ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start space-x-4">
                  <svg className={`w-8 h-8 mt-1 ${criteria.highlight ? 'text-green-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={criteria.icon === 'bank' ? 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' : criteria.icon === 'receipt' ? 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' : 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'} /></svg>
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
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={doc.icon === 'building' ? 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' : doc.icon === 'user-check' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' : 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'} /></svg>
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">EMI Calculator for Solar Panel Loan</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto">Plan your repayments smartly using our Solar Loan EMI Calculator. Simply input the loan amount, tenure, and interest rate to get an instant estimate of your monthly EMI. This tool helps you choose the most suitable loan offer based on your repayment capacity.</p>
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount: ₹{loanAmount.toLocaleString()}</label>
                <input type="range" min="600000" max="30000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate: {interestRate}%</label>
                <input type="range" min="7" max="15" step="0.25" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Tenure: {tenure} months</label>
                <input type="range" min="12" max="84" step="6" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full" />
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
                <p className="text-2xl font-bold text-green-500">₹{totalInterest.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Interest</p>
              </div>
            </div>
            <div className="mt-6 text-left text-sm text-gray-600">
              <p className="font-semibold mb-2">How is Solar Loan EMI Calculated?</p>
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
          <p className="text-lg text-gray-600 mb-12">Fees for solar panel loans can vary by lender. This table gives a fair idea of the associated charges:</p>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <table className="w-full">
              <thead className="bg-green-50">
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
          <p className="mt-6 text-sm text-gray-600">*Other charges for documentation, verification, or duplicate statements may apply.</p>
        </div>
      </section>

      {/* How to Apply Section */}
      <section id="how-to-apply-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">How to Apply Online</h2>
          <p className="text-lg text-gray-600 mb-16 text-center max-w-3xl mx-auto">Follow these simple steps to apply for your Solar Panel Loan:</p>
          <div className="grid md:grid-cols-5 gap-8">
            {howToApplySteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon === 'globe' ? 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9' : step.icon === 'play-circle' ? 'M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3.5a.5.5 0 11-1 0 .5.5 0 011 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z' : step.icon === 'log-in' ? 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' : step.icon === 'edit' ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8'} /></svg>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">Our team will review your application and get in touch with you soon with the best deal for your needs.</p>
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition" onClick={() => setShowModal(true)}>Start Your Application</button>
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
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-accent-success to-primary-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Invest in a greener future and reduce your energy bills!</h2>
          <p className="text-xl mb-8">Turn your rooftop into a source of clean, renewable energy with our affordable solar financing solutions.</p>
          <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg" onClick={() => setShowModal(true)}>Apply for Your Solar Loan Today!</button>
        </div>
      </section>

      {/* Modal */}
    </div>
  );
};

export default SolarLoanPage;

