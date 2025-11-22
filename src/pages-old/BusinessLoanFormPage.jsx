'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { isValidPhoneNumber, formatE164 } from '../utils/phone';

const BusinessLoanFormPage = () => {
  // State for tabs, EMI calculator, and FAQs
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(12);
  const [tenure, setTenure] = useState(36);
  const [emi, setEmi] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cityState: '',
    ageDob: '',
    businessName: '',
    businessType: 'Proprietorship',
    industryType: 'Retail',
    yearsInBusiness: '',
    businessAddress: '',
    gstNo: '',
    loanAmount: 500000,
    loanPurpose: 'Working Capital',
    tenure: '',
    existingLoans: 'No',
    turnover: '',
    profit: '',
    bankStatement: 'No',
    itrFiled: 'No',
    consent: false
  });

  // --- Scroll and Active Tab Logic ---
  const handleTabClick = (tabId) => {
    const section = document.getElementById(`${tabId}-section`);
    if (section) {
      const headerOffset = 130; // Height of the sticky tab navigation
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveTab(tabId);
    }
  };

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
      root: null,
      rootMargin: '-140px 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id.replace('-section', ''));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((sec) => observer.observe(sec));

    return () => sections.forEach((sec) => observer.unobserve(sec));
  }, []);

  // --- EMI Calculation ---
  useEffect(() => {
    if (loanAmount > 0 && interestRate > 0 && tenure > 0) {
      const principal = loanAmount;
      const rate = interestRate / 100 / 12;
      const time = tenure;
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
      loanType: 'Business',
      captchaToken: captchaToken,
    };

    // Log the data with captcha token
    console.log('📋 Business Loan Form Data with CAPTCHA:', loanData);

    // Submit to backend
    const result = await submitLoanApplication(loanData);

    if (result.success) {
      console.log('✅ Business loan submitted successfully:', result.data);
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
    setCurrentStep(currentStep - 1);
    setFieldErrors({});
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    console.log('✅ reCAPTCHA token received:', token);
  };

  // --- Validation Functions ---
  const validateField = (fieldName, value) => {
    switch(fieldName) {
      case 'fullName':
        if (!value || value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name should only contain letters';
        return '';
      
      case 'phone':
        if (!value || !/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit phone number (start with 6-9)';
        return '';
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';
      
      case 'cityState':
        if (!value || value.trim().length < 2) return 'City/State must be at least 2 characters';
        return '';
      
      case 'ageDob':
        if (!value) return 'Age/DOB is required';
        return '';
      
      case 'businessName':
        if (!value || value.trim().length < 2) return 'Business name must be at least 2 characters';
        return '';
      
      case 'yearsInBusiness':
        if (!value) return 'Years in business is required';
        if (isNaN(value) || value < 0) return 'Years must be a valid number';
        return '';
      
      case 'turnover':
        if (!value) return 'Turnover range is required';
        return '';
      
      case 'profit':
        if (!value) return 'Profit range is required';
        return '';
      
      case 'loanAmount':
        if (!value || value < 100000) return 'Loan amount must be at least ₹1,00,000';
        if (value > 5000000) return 'Loan amount cannot exceed ₹50,00,000';
        return '';
      
      case 'tenure':
        if (!value) return 'Preferred tenure is required';
        return '';
      
      default:
        return '';
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      // Personal Details
      errors.fullName = validateField('fullName', formData.fullName);
      errors.phone = validateField('phone', formData.phone);
      errors.email = validateField('email', formData.email);
      errors.cityState = validateField('cityState', formData.cityState);
      errors.ageDob = validateField('ageDob', formData.ageDob);
    } else if (step === 1) {
      // Business Info
      errors.businessName = validateField('businessName', formData.businessName);
      errors.yearsInBusiness = validateField('yearsInBusiness', formData.yearsInBusiness);
    } else if (step === 2) {
      // Loan & Consent
      errors.loanAmount = validateField('loanAmount', formData.loanAmount);
      errors.tenure = validateField('tenure', formData.tenure);
      errors.turnover = validateField('turnover', formData.turnover);
      errors.profit = validateField('profit', formData.profit);
    }
    
    const activeErrors = Object.fromEntries(Object.entries(errors).filter(([_, v]) => v !== ''));
    if (Object.keys(activeErrors).length > 0) {
      setFieldErrors(activeErrors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStep(0);
    setSubmitted(false);
    setFieldErrors({});
    setCaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      cityState: '',
      ageDob: '',
      businessName: '',
      businessType: 'Proprietorship',
      industryType: 'Retail',
      yearsInBusiness: '',
      businessAddress: '',
      gstNo: '',
      loanAmount: 500000,
      loanPurpose: 'Working Capital',
      tenure: '',
      existingLoans: 'No',
      turnover: '',
      profit: '',
      bankStatement: 'No',
      itrFiled: 'No',
      consent: false
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'layout-grid' },
    { id: 'features', label: 'Features', icon: 'star' },
    { id: 'eligibility', label: 'Eligibility', icon: 'check-circle' },
    { id: 'documents', label: 'Documents', icon: 'file-text' },
    { id: 'emi-calculator', label: 'EMI Calculator', icon: 'calculator' },
    { id: 'fees', label: 'Fees & Charges', icon: 'credit-card' },
    { id: 'reviews', label: 'Reviews', icon: 'message-circle' },
    { id: 'faqs', label: 'FAQs', icon: 'help-circle' }
  ];

  const features = [
    { title: 'Term Loans', description: 'Get a lump sum of capital upfront to be paid back over a fixed term.', icon: 'clock' },
    { title: 'Working Capital Loans', description: 'Cover your day-to-day operational expenses and manage cash flow effectively.', icon: 'briefcase' },
    { title: 'Business Expansion Loans', description: 'Secure the funding you need to grow your business, open new locations, or enter new markets.', icon: 'trending-up' },
    { title: 'Equipment Financing Loans', description: 'Purchase necessary machinery and equipment without a large upfront cost.', icon: 'truck' },
    { title: 'Invoice Financing & Bill Discounting', description: 'Get an advance on your unpaid invoices to improve cash flow.', icon: 'receipt' },
    { title: 'Machinery Loans', description: 'Specifically designed for financing the purchase of new or used machinery.', icon: 'settings' }
  ];
  
  const eligibilityCriteria = [
      { text:'Age Criteria: Minimum 21 years at application & maximum 65 years at loan maturity.', icon: 'calendar' },
      { text:'Credit Score: A score of 700 or above is preferred by most lenders.', icon: 'star' },
      { text:'Business Vintage: Minimum of 1 year or more in operation.', icon: 'award' },
      { text:'Business Experience: At least 1 year, with the business location remaining the same.', icon: 'map-pin' },
      { text:'Annual Revenue: Lenders may have a minimum annual revenue requirement.', icon: 'bar-chart-2' },
      { text:'Collateral: Secured loans may require assets like real estate, equipment, or inventory.', icon: 'shield' },
      { text:'Nationality: Indian citizens.', icon: 'flag' },
      { text:'Eligible Entities: Individuals, MSMEs, Sole Proprietorships, Partnership Firms, Public/Private Limited Companies, LLPs, retailers, traders, and manufacturers.', icon: 'users' },
      { text:'Additional Criteria: Applicants must own either a residence, office, shop, or godown.', icon: 'home' }
  ];

  const documents = [
    'ITR for the past 2-3 years',
    'Current Bank Account Statement for the last 12 months',
    'Photocopy of PAN Card',
    'Address Proof for Residence (Voter Card, Passport, Aadhaar, Utility Bill)',
    'Address Proof for Business (Utility Bill)',
    "Company's business profile on official letterhead",
    '2 photographs of promoters and property owners',
    'Sanction letter and repayment schedule of any existing loans',
    'GST registration certificate and GST returns for the latest 2 years',
    'Business Continuity proof of 3 years (e.g., old ITR, company registration)',
    'For Pvt Ltd Companies: Company PAN Card, Certificate of Incorporation, MOA, AOA, List of Directors, and Shareholding pattern',
    'For Partnership Companies: Partnership Deed, Company PAN Card'
  ];

  const fees = [
    { particular: 'Loan Processing Fees', charges: '1.5% to 5% of the Loan Amount' },
    { particular: 'Loan Cancellation', charges: '0% to 5% of the Loan Amount' },
    { particular: 'Stamp Duty Charges', charges: '₹60/- to ₹600/-' },
    { particular: 'Legal Fees', charges: 'Nil' },
    { particular: 'Penal Charges', charges: 'Nil' },
    { particular: 'EMI / Cheque Bounce', charges: 'Approx. ₹499/- to ₹599/-' }
  ];

  const reviews = [
    { rating: 4, text: "All employees and staffs in Loanzaar are helpful. They are very co- operative and try to clearly understand customer’s needs. I felt very comfortable dealing with them.", author: "PRANALI FATAK" },
    { rating: 4, text: "I was a housewife and wanted to start my own kitchen for food delivery. Loanzaar helped me to get a business loan... The rate of interest is very much affordable.", author: "DHARA GORI" },
    { rating: 4, text: "I never thought getting a business loan will be this easy. Great thanks to Loanzaar... money was disbursed within 8 days of applying for loan.", author: "SATISH UPARE" },
    { rating: 4, text: "If you are interested to save your time, efforts and money then you must try taking loan through Loanzaar... this is a one-stop solution.", author: "SANJAY GANDHI" }
  ];

  const faqs = [
    { question: 'What is a business loan, and how much can one borrow?', answer: 'A business loan is a sum of money issued by a financial institution specifically for business purposes. The amount you can borrow depends on your business’s revenue, creditworthiness, and the lender’s policies, ranging from small amounts to several crores.' },
    { question: 'Who can apply for a business loan?', answer: 'Eligible entities include individuals, MSMEs, Sole Proprietorships, Partnership Firms, Public/Private Limited Companies, and LLPs involved in sectors like retail, trade, or manufacturing.' },
    { question: 'What are the requirements to get a business loan?', answer: 'Key requirements include a good credit score (700+), stable business vintage (1+ years), proof of profitability, and necessary documentation like ITRs and bank statements.' },
    { question: 'What is Udyam?', answer: 'Udyam Registration is the new process for registering MSMEs (Micro, Small, and Medium Enterprises) in India. It provides businesses with a unique identification number and access to various government schemes and benefits.' },
    { question: 'What is the minimum CIBIL Score required for a business loan?', answer: 'Most lenders prefer a CIBIL or credit score of 700 or higher for approving a business loan, as it indicates a good repayment history.' },
    { question: 'How can I qualify my business for an instant business loan?', answer: 'To qualify for an instant loan, maintain a strong credit score, have all your documents ready, show consistent cash flow, and have a clear, profitable business plan.' },
    { question: 'What security is required to avail the business loan?', answer: 'It depends on the loan type. Unsecured loans do not require collateral. For secured loans, you may need to pledge assets like real estate, equipment, or inventory as security.' },
    { question: 'What are the loan schemes initiated by the Government of India?', answer: 'The Government of India has several schemes like the MUDRA Loan Scheme, Stand-Up India Scheme, and CGTMSE to support MSMEs and startups with financial assistance.' },
    { question: 'Can I get a business loan with bad credit?', answer: 'While challenging, it is possible. Some lenders specialize in providing loans to businesses with lower credit scores, though often at higher interest rates. Having collateral can also improve your chances.' },
    { question: 'What can I use a business loan for?', answer: 'A business loan can be used for various purposes, including business expansion, purchasing machinery, managing working capital, hiring staff, or marketing.' },
    { question: 'Can I pay off a business loan early?', answer: 'Yes, most lenders allow you to prepay your business loan. However, check with your lender about any potential prepayment penalties or charges.' }
  ];

  const schemas = [
    generateLoanSchema({
      name: 'Business Loan',
      description: 'Apply for business loans to expand your business, purchase equipment, or manage working capital with tenure up to 5 years. Get quick approval and competitive rates.',
      loanType: 'Business Loan',
      interestRate: '11-18',
      tenure: '1-5 years',
      amount: '1,00,000 - 50,00,000'
    }),
    generateWebPageSchema({
      name: 'Business Loan Application - Loanzaar',
      description: 'Apply for business loans to expand your business, purchase equipment, or manage working capital. Get quick approval and competitive rates on Loanzaar.',
      url: 'https://loanzaar.in/business-loan',
      breadcrumbs: [
        { name: 'Home', url: 'https://loanzaar.in' },
        { name: 'Business Loan', url: 'https://loanzaar.in/business-loan' }
      ]
    })
  ];

  return (
    <div className="min-h-screen bg-white">
      <StructuredData schema={schemas} />
      <Meta 
        title="Business Loan Application - Loanzaar" 
        description="Apply for business loans to expand your business, purchase equipment, or manage working capital. Get quick approval and competitive rates on Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0  bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Business Loan</span>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-6 md:px-16 flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Fuel Your Business Growth with a <span className="text-red-500">Fast Business Loan!</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Get a convenient Business Loan to cover assets and expand seamlessly. Our quick application process and flexible options are designed to help your business thrive.</p>
            <button onClick={() => setShowModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition">Apply Now</button>
          </div>
          <div className="relative">
            <img src="https://cdn.jsdelivr.net/gh/creativoxa/loanzaar/b2c/banners/business-loan-b.avif" alt="Business growth concept with charts and graphs" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">Business Loan</text></svg>'} />
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
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

        <section id="overview-section" className="py-20 px-6 md:px-16 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Business Loan Overview</h2>
                <div className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed space-y-6">
                    <p>Securing a business loan is a crucial step for growth. Here’s a quick guide to getting started:</p>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-bold text-gray-800 mb-2">Get High Business Loan Eligibility</h3>
                            <p>Prepare a solid business plan, know your credit score, decide on the loan amount, and research available options.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-bold text-gray-800 mb-2">Gather Common Documents</h3>
                            <p>Have your proof of address, photo ID, business proof, income proof, and other essential documents ready.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-bold text-gray-800 mb-2">Meet Approval Criteria</h3>
                            <p>Applicants should be between 21-65 years old with a business vintage of at least 1-2 years and a profitable track record.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="features-section" className="py-20 px-6 md:px-16 bg-gray-50">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Features and Benefits</h2>
                <p className="text-lg text-gray-600">We offer a variety of business loans tailored to meet your specific needs.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature) => (
                    <div key={feature.title} className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>

        <section id="eligibility-section" className="py-20 px-6 md:px-16 bg-white">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Eligibility Criteria & Eligible Entities</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {eligibilityCriteria.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-6 rounded-lg flex items-start space-x-4">
                            <p className="text-gray-700">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="documents-section" className="py-20 px-6 md:px-16 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Required Documents</h2>
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <ul className="list-disc pl-6 text-lg text-gray-700 space-y-3 columns-1 md:columns-2">
                        {documents.map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>

        <section id="emi-calculator-section" className="py-20 px-6 md:px-16 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Business Loan EMI Calculator</h2>
                <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto">Our Business Loan EMI (Equated Monthly Installment) calculator helps you estimate your monthly loan repayment amount. You can adjust the tenure to see how it affects your EMI, helping you find a payment plan that fits your budget.</p>
                <div className="bg-gray-50 p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Loan Amount: ₹{loanAmount.toLocaleString()}</label>
                            <input type="range" min="100000" max="5000000" step="10000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Interest Rate: {interestRate}%</label>
                            <input type="range" min="8" max="24" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Loan Tenure: {tenure} months</label>
                            <input type="range" min="12" max="120" step="12" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full" />
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

        <section id="fees-section" className="py-20 px-6 md:px-16 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Fees and Charges</h2>
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Particulars</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Charges</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {fees.map((fee, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 text-sm text-gray-900">{fee.particular}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{fee.charges}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-6 text-sm text-gray-600 text-center">Other potential charges include fees for documentation, verification, duplicate statements, and NOC certificates.</p>
            </div>
        </section>

        <section id="reviews-section" className="py-20 px-6 md:px-16 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-12">Customer Reviews</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {reviews.map((review, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-xl text-left">
                            <div className="flex items-center mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                            <p className="text-sm font-semibold text-gray-900">— {review.author}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="faqs-section" className="py-20 px-6 md:px-16 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="rounded-2xl border border-gray-200 bg-white">
                            <button
                                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                className="flex w-full items-center justify-between gap-4 rounded-2xl px-6 py-4 text-left"
                            >
                                <span className="text-base font-semibold text-gray-900">{faq.question}</span>
                                <svg className={`h-5 w-5 text-gray-500 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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

      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to grow your business?</h2>
          <p className="text-xl mb-8">Apply for Your Business Loan Today and fuel your business growth!</p>
          <button onClick={() => setShowModal(true)} className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">Apply for Your Business Loan Today!</button>
        </div>
      </section>

      {/* Inquiry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 relative">
              <button 
                onClick={() => { setShowModal(false); setCurrentStep(0); setFieldErrors({}); }} 
                className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-3xl font-bold text-white mb-2">Business Loan Inquiry Form</h2>
              <p className="text-blue-100">Step {currentStep + 1} of 3 • Complete your details to get started</p>
            </div>

            <div className="p-8">
              {/* Enhanced Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  {['Personal Details', 'Business Info', 'Loan & Consent'].map((step, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center px-2">
                      <div className="flex items-center mb-2 w-full">
                        <div className={`flex-1 h-1 rounded-full transition-all ${currentStep > index ? 'bg-blue-500' : currentStep === index ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mx-2 transition-all ${currentStep > index ? 'bg-blue-500 text-white' : currentStep === index ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                          {currentStep > index ? '✓' : index + 1}
                        </div>
                        {index < 2 && <div className={`flex-1 h-1 rounded-full transition-all ${currentStep > index ? 'bg-blue-500' : 'bg-gray-300'}`} />}
                      </div>
                      <span className={`text-xs font-semibold text-center ${currentStep >= index ? 'text-blue-600' : 'text-gray-500'}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 0: Personal Details */}
                {currentStep === 0 && (
                  <div className="space-y-5">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Personal Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter your full name"
                          value={formData.fullName} 
                          onChange={(e) => {
                            setFormData({...formData, fullName: e.target.value});
                            if (fieldErrors.fullName) {
                              setFieldErrors({...fieldErrors, fullName: ''});
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            fieldErrors.fullName 
                              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                          }`}
                        />
                        {fieldErrors.fullName && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="tel" 
                          placeholder="10-digit mobile number"
                          inputMode="numeric"
                          maxLength="10"
                          value={formData.phone} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, phone: val});
                            if (fieldErrors.phone) {
                              setFieldErrors({...fieldErrors, phone: ''});
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            fieldErrors.phone 
                              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                          }`}
                        />
                        {fieldErrors.phone && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input 
                          type="email" 
                          placeholder="your.email@example.com"
                          value={formData.email} 
                          onChange={(e) => {
                            setFormData({...formData, email: e.target.value});
                            if (fieldErrors.email) {
                              setFieldErrors({...fieldErrors, email: ''});
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            fieldErrors.email 
                              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                          }`}
                        />
                        {fieldErrors.email && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      {/* City / State */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City / State <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter your city/state"
                          value={formData.cityState} 
                          onChange={(e) => {
                            setFormData({...formData, cityState: e.target.value});
                            if (fieldErrors.cityState) {
                              setFieldErrors({...fieldErrors, cityState: ''});
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            fieldErrors.cityState 
                              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                          }`}
                        />
                        {fieldErrors.cityState && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.cityState}
                          </p>
                        )}
                      </div>

                      {/* Age / DOB */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Age / Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={formData.ageDob} 
                          onChange={(e) => {
                            setFormData({...formData, ageDob: e.target.value});
                            if (fieldErrors.ageDob) {
                              setFieldErrors({...fieldErrors, ageDob: ''});
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            fieldErrors.ageDob 
                              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                          }`}
                        >
                          <option value="">Select your age</option>
                          {[...Array(50)].map((_, i) => (
                            <option key={i + 21} value={i + 21}>{i + 21} years</option>
                          ))}
                        </select>
                        {fieldErrors.ageDob && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.ageDob}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Business Information */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">🏢</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Business Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Business Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Business Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter your business name"
                          value={formData.businessName} 
                          onChange={(e) => {
                            setFormData({...formData, businessName: e.target.value});
                            if (fieldErrors.businessName) {
                              setFieldErrors({...fieldErrors, businessName: ''});
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            fieldErrors.businessName 
                              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                          }`}
                        />
                        {fieldErrors.businessName && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.businessName}
                          </p>
                        )}
                      </div>

                      {/* Business Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type</label>
                        <select 
                          value={formData.businessType} 
                          onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all focus:outline-none"
                        >
                          <option>Proprietorship</option>
                          <option>Partnership</option>
                          <option>Pvt. Ltd</option>
                          <option>LLP</option>
                          <option>Others</option>
                        </select>
                      </div>

                      {/* Industry Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Industry Type</label>
                        <select 
                          value={formData.industryType} 
                          onChange={(e) => setFormData({...formData, industryType: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all focus:outline-none"
                        >
                          <option>Retail</option>
                          <option>Manufacturing</option>
                          <option>Services</option>
                          <option>Trading</option>
                          <option>Others</option>
                        </select>
                      </div>

                      {/* Years in Business */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Years in Business <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={formData.yearsInBusiness} 
                          onChange={(e) => {
                            setFormData({...formData, yearsInBusiness: e.target.value});
                            if (fieldErrors.yearsInBusiness) {
                              setFieldErrors({...fieldErrors, yearsInBusiness: ''});
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            fieldErrors.yearsInBusiness 
                              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                          }`}
                        >
                          <option value="">Select years</option>
                          <option value="1">1 year</option>
                          <option value="2">2 years</option>
                          <option value="3">3 years</option>
                          <option value="4">4 years</option>
                          <option value="5">5 years</option>
                          <option value="6">6-10 years</option>
                          <option value="7">10+ years</option>
                        </select>
                        {fieldErrors.yearsInBusiness && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.yearsInBusiness}
                          </p>
                        )}
                      </div>

                      {/* Business Address */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Business Address <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter business address"
                          value={formData.businessAddress} 
                          onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all focus:outline-none"
                        />
                      </div>

                      {/* GST No */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          GST / Registration Number <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter GST/Registration No"
                          value={formData.gstNo} 
                          onChange={(e) => setFormData({...formData, gstNo: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Loan & Consent */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">💰</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Loan Requirements</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Loan Amount */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Loan Amount Required <span className="text-red-500">*</span>
                        </label>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-3 border border-blue-200">
                          <p className="text-3xl font-bold text-blue-600">₹ {formData.loanAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 mt-1">₹1,00,000 - ₹50,00,000</p>
                        </div>
                        <input 
                          type="range" 
                          min="100000" 
                          max="5000000" 
                          step="50000" 
                          value={formData.loanAmount} 
                          onChange={(e) => {
                            setFormData({...formData, loanAmount: Number(e.target.value)});
                            if (fieldErrors.loanAmount) {
                              setFieldErrors({...fieldErrors, loanAmount: ''});
                            }
                          }}
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        {fieldErrors.loanAmount && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.loanAmount}
                          </p>
                        )}
                      </div>

                      {/* Loan Purpose */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Purpose</label>
                        <select 
                          value={formData.loanPurpose} 
                          onChange={(e) => setFormData({...formData, loanPurpose: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all focus:outline-none"
                        >
                          <option>Working Capital</option>
                          <option>Machinery</option>
                          <option>Expansion</option>
                          <option>Inventory</option>
                          <option>Others</option>
                        </select>
                      </div>

                      {/* Preferred Tenure */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Preferred Tenure <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={formData.tenure} 
                          onChange={(e) => {
                            setFormData({...formData, tenure: e.target.value});
                            if (fieldErrors.tenure) {
                              setFieldErrors({...fieldErrors, tenure: ''});
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            fieldErrors.tenure 
                              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                          }`}
                        >
                          <option value="">Select Tenure</option>
                          <option>1 year</option>
                          <option>2 years</option>
                          <option>3 years</option>
                          <option>4 years</option>
                          <option>5 years</option>
                        </select>
                        {fieldErrors.tenure && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.tenure}
                          </p>
                        )}
                      </div>

                      {/* Existing Loans */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Do you have existing loans?</label>
                        <div className="flex space-x-6">
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="radio" 
                              name="existingLoans" 
                              value="Yes" 
                              checked={formData.existingLoans === 'Yes'} 
                              onChange={(e) => setFormData({...formData, existingLoans: e.target.value})}
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span className="ml-2 text-gray-700 font-medium">Yes</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="radio" 
                              name="existingLoans" 
                              value="No" 
                              checked={formData.existingLoans === 'No'} 
                              onChange={(e) => setFormData({...formData, existingLoans: e.target.value})}
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span className="ml-2 text-gray-700 font-medium">No</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Financial Snapshot */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-3 mb-5">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">📊</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Financial Snapshot</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Annual Turnover */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Annual Turnover <span className="text-red-500">*</span>
                          </label>
                          <select 
                            value={formData.turnover} 
                            onChange={(e) => {
                              setFormData({...formData, turnover: e.target.value});
                              if (fieldErrors.turnover) {
                                setFieldErrors({...fieldErrors, turnover: ''});
                              }
                            }}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                              fieldErrors.turnover 
                                ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            }`}
                          >
                            <option value="">Select turnover range</option>
                            <option value="< 10 Lakh">Less than ₹10 Lakh</option>
                            <option value="10 - 50 Lakh">₹10 - ₹50 Lakh</option>
                            <option value="50 Lakh - 1 Cr">₹50 Lakh - ₹1 Crore</option>
                            <option value="1 - 5 Cr">₹1 - ₹5 Crore</option>
                            <option value="5 - 10 Cr">₹5 - ₹10 Crore</option>
                            <option value="> 10 Cr">More than ₹10 Crore</option>
                          </select>
                          {fieldErrors.turnover && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                              </svg>
                              {fieldErrors.turnover}
                            </p>
                          )}
                        </div>

                        {/* Annual Profit */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Annual Profit <span className="text-red-500">*</span>
                          </label>
                          <select 
                            value={formData.profit} 
                            onChange={(e) => {
                              setFormData({...formData, profit: e.target.value});
                              if (fieldErrors.profit) {
                                setFieldErrors({...fieldErrors, profit: ''});
                              }
                            }}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                              fieldErrors.profit 
                                ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            }`}
                          >
                            <option value="">Select profit range</option>
                            <option value="< 5 Lakh">Less than ₹5 Lakh</option>
                            <option value="5 - 10 Lakh">₹5 - ₹10 Lakh</option>
                            <option value="10 - 20 Lakh">₹10 - ₹20 Lakh</option>
                            <option value="20 - 50 Lakh">₹20 - ₹50 Lakh</option>
                            <option value="50 Lakh - 1 Cr">₹50 Lakh - ₹1 Crore</option>
                            <option value="> 1 Cr">More than ₹1 Crore</option>
                          </select>
                          {fieldErrors.profit && (
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                              </svg>
                              {fieldErrors.profit}
                            </p>
                          )}
                        </div>

                        {/* Bank Statement */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Bank Statement Available?</label>
                          <div className="flex space-x-6">
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="radio" 
                                name="bankStatement" 
                                value="Yes" 
                                checked={formData.bankStatement === 'Yes'} 
                                onChange={(e) => setFormData({...formData, bankStatement: e.target.value})}
                                className="w-4 h-4 accent-blue-600"
                              />
                              <span className="ml-2 text-gray-700 font-medium">Yes</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="radio" 
                                name="bankStatement" 
                                value="No" 
                                checked={formData.bankStatement === 'No'} 
                                onChange={(e) => setFormData({...formData, bankStatement: e.target.value})}
                                className="w-4 h-4 accent-blue-600"
                              />
                              <span className="ml-2 text-gray-700 font-medium">No</span>
                            </label>
                          </div>
                        </div>

                        {/* ITR Filed */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">ITR Filed for Last 2 Years?</label>
                          <div className="flex space-x-6">
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="radio" 
                                name="itrFiled" 
                                value="Yes" 
                                checked={formData.itrFiled === 'Yes'} 
                                onChange={(e) => setFormData({...formData, itrFiled: e.target.value})}
                                className="w-4 h-4 accent-blue-600"
                              />
                              <span className="ml-2 text-gray-700 font-medium">Yes</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="radio" 
                                name="itrFiled" 
                                value="No" 
                                checked={formData.itrFiled === 'No'} 
                                onChange={(e) => setFormData({...formData, itrFiled: e.target.value})}
                                className="w-4 h-4 accent-blue-600"
                              />
                              <span className="ml-2 text-gray-700 font-medium">No</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Consent Checkbox */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <label className="flex items-start cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.consent} 
                          onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                          className="w-5 h-5 mt-1 accent-blue-600"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          I authorize Loanzaar and its partners to contact me via <span className="font-semibold">call, SMS, or WhatsApp</span> regarding my business loan inquiry. I understand and acknowledge the terms and conditions.
                        </span>
                      </label>
                    </div>

                    {/* reCAPTCHA */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="6LdUpOsrAAAAAKqnWvFE0MH-mgcHo8BzFohUEB5b"
                        onChange={handleCaptchaChange}
                        onExpired={() => setCaptchaToken(null)}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                  {currentStep > 0 && (
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                  )}
                  {currentStep < 2 ? (
                    <button 
                      type="button" 
                      onClick={nextStep} 
                      className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg flex items-center gap-2"
                    >
                      Next
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={!formData.consent || !captchaToken}
                      className={`ml-auto px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg flex items-center gap-2 ${
                        formData.consent && captchaToken
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Get Loan Options
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showModal && submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h3>
            <p className="text-lg text-gray-600 mb-8">Your business loan inquiry has been received. Our specialist will contact you shortly with personalized options.</p>
            <button 
              onClick={closeModal} 
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default BusinessLoanFormPage;



