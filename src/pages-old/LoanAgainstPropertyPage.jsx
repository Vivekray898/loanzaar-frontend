'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';

const LoanAgainstPropertyPage = () => {
  // State for tabs, EMI calculator, and FAQs
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(10);
  const [tenure, setTenure] = useState(120);
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
    propertyType: 'Residential',
    ownershipType: 'Self-Owned',
    marketValue: 1000000,
    propertyLocation: '',
    propertyUsage: 'Self-occupied',
    loanAmount: 500000,
    loanPurpose: 'Business Expansion',
    tenure: '',
    existingLoans: 'No',
    employmentType: 'Salaried',
    incomeTurnover: '',
    companyName: '',
    itrFiled: 'No',
    consent: false
  });

  // --- Scroll and Active Tab Logic ---
  const handleTabClick = (tabId) => {
    const section = document.getElementById(`${tabId}-section`);
    if (section) {
      const headerOffset = 130;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
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
      loanType: 'Property',
      captchaToken: captchaToken
    };

    console.log('📋 Loan Against Property Form Data with CAPTCHA:', loanData);

    // Submit to backend
    const result = await submitLoanApplication(loanData);

    if (result.success) {
      console.log('✅ Property loan submitted successfully:', result.data);
      setSubmitted(true);
    } else {
      alert(`Error: ${result.error}`);
    }
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
      
      case 'propertyLocation':
        if (!value || value.trim().length < 2) return 'Property location must be at least 2 characters';
        return '';
      
      case 'marketValue':
        if (!value || value < 100000) return 'Market value must be at least ₹1,00,000';
        return '';
      
      case 'loanAmount':
        if (!value || value < 100000) return 'Loan amount must be at least ₹1,00,000';
        if (value > 10000000) return 'Loan amount cannot exceed ₹1 Crore';
        return '';
      
      case 'tenure':
        if (!value) return 'Preferred tenure is required';
        return '';
      
      case 'incomeTurnover':
        if (!value) return 'Income/Turnover range is required';
        return '';
      
      default:
        return '';
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      // Applicant Info
      errors.fullName = validateField('fullName', formData.fullName);
      errors.phone = validateField('phone', formData.phone);
      errors.email = validateField('email', formData.email);
      errors.cityState = validateField('cityState', formData.cityState);
      errors.ageDob = validateField('ageDob', formData.ageDob);
    } else if (step === 1) {
      // Property & Loan Details
      errors.propertyLocation = validateField('propertyLocation', formData.propertyLocation);
      errors.marketValue = validateField('marketValue', formData.marketValue);
      errors.loanAmount = validateField('loanAmount', formData.loanAmount);
      errors.tenure = validateField('tenure', formData.tenure);
    } else if (step === 2) {
      // Income & Consent
      errors.incomeTurnover = validateField('incomeTurnover', formData.incomeTurnover);
    }
    
    const activeErrors = Object.fromEntries(Object.entries(errors).filter(([_, v]) => v !== ''));
    if (Object.keys(activeErrors).length > 0) {
      setFieldErrors(activeErrors);
      return false;
    }
    setFieldErrors({});
    return true;
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

  const closeModal = () => {
    setShowModal(false);
    setCurrentStep(0);
    setSubmitted(false);
    setFieldErrors({});
    setCaptchaToken(null);
    if (recaptchaRef.current) recaptchaRef.current.reset();
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      cityState: '',
      ageDob: '',
      propertyType: 'Residential',
      ownershipType: 'Self-Owned',
      marketValue: 1000000,
      propertyLocation: '',
      propertyUsage: 'Self-occupied',
      loanAmount: 500000,
      loanPurpose: 'Business Expansion',
      tenure: '',
      existingLoans: 'No',
      employmentType: 'Salaried',
      incomeTurnover: '',
      companyName: '',
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
    { title: 'Flexible Loan Eligibility', description: 'We offer a wide range of eligibility criteria.' },
    { title: 'High Loan Value', description: 'Get loans from ₹10 Lakh to ₹5 Crore.' },
    { title: 'Versatile Collateral', description: 'Use your commercial, residential, or industrial property.' },
    { title: 'Multipurpose Use', description: 'Fund your business expansion, education, weddings, or any other personal need.' },
    { title: 'Longer Tenure', description: 'Repayment periods can extend from 5 to 20 years, allowing for smaller, more manageable EMIs.' },
    { title: 'Improve Credit Score', description: 'Timely repayment of a LAP can positively impact your credit history.' }
  ];

  const eligibilityCriteria = [
    'Nationality: Must be a citizen of India.',
    'Occupation and Income: A stable source of income is required to prove financial stability and repayment capacity.',
    'Credit History: A strong credit score is a key factor in determining your eligibility.',
    "Market Value of Property: The loan amount is directly linked to the current market value of your property. The property's title must be clear and not mortgaged with another institution."
  ];

  const documents = [
    'Proof of Identity / Residence (Aadhaar, Passport, Voter ID, etc.)',
    'Proof of Income (Salary Slips, ITR, Bank Statements)',
    'Property-related documents (Title Deed, Sale Agreement, etc.)',
    'Proof of Business (for self-employed applicants)',
    'Bank account statement for the last 6 months.'
  ];

  const fees = [
    { particular: 'Loan Processing Fees', charges: '0.25% to 2% of Loan Amount' },
    { particular: 'Loan Cancellation', charges: 'Nil - 5% (according to Bank/NBFC)' },
    { particular: 'Stamp Duty Charges', charges: 'As per the Value of the Property and State Tax' },
    { particular: 'Legal Fees', charges: 'As per actual' },
    { particular: 'Penal Charges', charges: 'Usually 2% per month on the overdue amount' },
    { particular: 'EMI / Cheque Bounce', charges: 'Approx ₹500/-' },
    { particular: 'Foreclosure Charges', charges: 'Nil to 4% (according to Bank/NBFC)' }
  ];

  const reviews = [
    { rating: 4, text: 'Loanzaar helped me find the appropriate lender... Within a span of 20 days my loan against property got approved and disbursed.', author: 'DHWANI DAVE' },
    { rating: 4, text: 'I read a blog of debt consolidation posted by Loanzaar... Loanzaar personnel were so helpful about providing me the right path and knowledge about it and helped me to shift all my loans at one place.', author: 'MANN DESAI' },
    { rating: 4, text: 'My documents were collected from home and the process was completed on time. A big thanks to Loanzaar.', author: 'PRERANA SONI' },
    { rating: 4, text: 'It was a smooth process and they regularly updated me with the developments. Even they sanctioned my loan in a proper time frame. Surely recommended.', author: 'ADITI GANGWAL' }
  ];

  const faqs = [
    { question: 'What can I use a Loan Against Property for?', answer: 'You can use LAP for business expansion, education, weddings, debt consolidation, or any personal need.' },
    { question: 'How much loan can I get against my property?', answer: 'The loan amount depends on the market value of your property and your repayment capacity.' },
    { question: 'What are the interest rates for LAP?', answer: 'Interest rates for LAP are generally lower than unsecured loans and vary by lender.' },
    { question: 'How do I apply for a LAP?', answer: 'You can apply online or at a branch by submitting the required documents and completing the application process.' },
    { question: 'Can I still use my property if it\'s mortgaged for LAP?', answer: 'Yes, you can continue to use your property, but you cannot sell it until the loan is repaid.' },
    { question: 'What is a Loan Against Property Overdraft (LAP OD)?', answer: 'LAP OD is a facility where you can withdraw funds up to a sanctioned limit and pay interest only on the amount utilized.' },
    { question: 'Can I do a Balance Transfer in LAP?', answer: 'Yes, you can transfer your LAP to another lender for better terms.' },
    { question: 'Can I take a Top-up in LAP?', answer: 'Top-up loans are available if you have a good repayment track record and sufficient property value.' },
    { question: 'How is the value of the property calculated?', answer: 'Lenders assess the market value through valuation experts and base the loan amount on this value.' },
    { question: 'What types of properties are accepted by lenders?', answer: 'Residential, commercial, and industrial properties are generally accepted.' },
    { question: 'What is the difference between a Home Loan and a Loan against Property (LAP)?', answer: 'A home loan is for purchasing a property, while LAP is for raising funds using an existing property as collateral.' },
    { question: 'Can I prepay/foreclose my Loan Against Property in advance?', answer: 'Yes, most lenders allow prepayment or foreclosure, but check for applicable charges.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta 
        title="Loan Against Property - Loanzaar" 
        description="Get a loan against your property with competitive rates and flexible tenure. Unlock your property's value at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Loan Against Property</span>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-6 md:px-16 flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Turn Your Property into Capital with Ease
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Get the best Loan Against Property deals at a lower interest rate. Unlock the value of your property for your business or personal needs.</p>
            <button onClick={() => setShowModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition">Apply Now</button>
          </div>
          <div className="relative">
            <img src="https://cdn.jsdelivr.net/gh/creativoxa/loanzaar/b2c/banners/loan-against-property-b.avif" alt="Loan Against Property Banner" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\'><rect width=\'400\' height=\'400\' fill=\'%23f3f4f6\'/><text x=\'200\' y=\'200\' text-anchor=\'middle\' font-size=\'20\' fill=\'%236b7280\'>Loan Against Property</text></svg>'} />
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
      {/* Overview Section */}
      <section id="overview-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Loan Against Property Overview</h2>
          <div className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed space-y-6">
            <p>A Loan Against Property (LAP) is a secured loan that allows you to leverage your property as collateral. This typically results in lower interest rates and higher loan amounts compared to unsecured loans, giving you the financial flexibility you need.</p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Flexible Loan Eligibility</h3>
                <p>We offer a wide range of eligibility criteria to suit your needs.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">High Loan Value</h3>
                <p>Get loans from ₹10 Lakh to ₹5 Crore based on your property value.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Multipurpose Use</h3>
                <p>Fund your business, education, weddings, or any personal need.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features & Benefits</h2>
          <p className="text-lg text-gray-600">Unlock the value of your property for a wide range of financial needs.</p>
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
      {/* Eligibility Section */}
      <section id="eligibility-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Eligibility Criteria</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {eligibilityCriteria.map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg flex items-start space-x-4">
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Documents Section */}
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
      {/* EMI Calculator Section */}
      <section id="emi-calculator-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Loan Against Property EMI Calculator</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto">Our EMI calculator helps you understand the financial implications of your loan by estimating your monthly payments.</p>
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Loan Amount: ₹{loanAmount.toLocaleString()}</label>
                <input type="range" min="1000000" max="50000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Interest Rate: {interestRate}%</label>
                <input type="range" min="7" max="15" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Loan Tenure: {tenure} months</label>
                <input type="range" min="60" max="240" step="12" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full" />
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
      {/* Fees Section */}
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
          <p className="mt-6 text-sm text-gray-600 text-center">Other potential charges include fees for documentation, verification, and duplicate statements.</p>
        </div>
      </section>
      {/* Reviews Section */}
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
      {/* FAQs Section */}
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
      {/* CTA Section */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to unlock your property's potential?</h2>
          <p className="text-xl mb-8">Apply for Your Loan Against Property Today!</p>
          <button onClick={() => setShowModal(true)} className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">Apply for Your Loan Against Property Today!</button>
        </div>
      </section>

      {/* Inquiry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 relative">
              <button 
                onClick={() => { setShowModal(false); setCurrentStep(0); setFieldErrors({}); }} 
                className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-3xl font-bold text-white mb-2">Loan Against Property Inquiry</h2>
              <p className="text-indigo-100">Step {currentStep + 1} of 3 • Complete your details to get started</p>
            </div>

            <div className="p-8">
              {/* Enhanced Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  {['Applicant Info', 'Property & Loan', 'Income & Consent'].map((step, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center px-2">
                      <div className="flex items-center mb-2 w-full">
                        <div className={`flex-1 h-1 rounded-full transition-all ${currentStep > index ? 'bg-indigo-500' : currentStep === index ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mx-2 transition-all ${currentStep > index ? 'bg-indigo-500 text-white' : currentStep === index ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                          {currentStep > index ? '✓' : index + 1}
                        </div>
                        {index < 2 && <div className={`flex-1 h-1 rounded-full transition-all ${currentStep > index ? 'bg-indigo-500' : 'bg-gray-300'}`} />}
                      </div>
                      <span className={`text-xs font-semibold text-center ${currentStep >= index ? 'text-indigo-600' : 'text-gray-500'}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 0: Applicant Info */}
                {currentStep === 0 && (
                  <div className="space-y-5">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Applicant Information</h3>
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
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
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
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
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
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
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
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
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
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
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

                {/* Step 1: Property & Loan Details */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">🏠</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Property & Loan Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Property Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                        <select 
                          value={formData.propertyType} 
                          onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all focus:outline-none"
                        >
                          <option>Residential</option>
                          <option>Commercial</option>
                          <option>Industrial</option>
                          <option>Plot</option>
                        </select>
                      </div>

                      {/* Ownership Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ownership Type</label>
                        <select 
                          value={formData.ownershipType} 
                          onChange={(e) => setFormData({...formData, ownershipType: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all focus:outline-none"
                        >
                          <option>Self-Owned</option>
                          <option>Co-Owned</option>
                          <option>Joint</option>
                        </select>
                      </div>

                      {/* Property Location */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Property Location <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter property location"
                          value={formData.propertyLocation} 
                          onChange={(e) => {
                            setFormData({...formData, propertyLocation: e.target.value});
                            if (fieldErrors.propertyLocation) {
                              setFieldErrors({...fieldErrors, propertyLocation: ''});
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            fieldErrors.propertyLocation 
                              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                          }`}
                        />
                        {fieldErrors.propertyLocation && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.propertyLocation}
                          </p>
                        )}
                      </div>

                      {/* Property Usage */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Property Usage</label>
                        <select 
                          value={formData.propertyUsage} 
                          onChange={(e) => setFormData({...formData, propertyUsage: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all focus:outline-none"
                        >
                          <option>Self-occupied</option>
                          <option>Rented</option>
                          <option>Vacant</option>
                        </select>
                      </div>

                      {/* Market Value */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Approx. Market Value <span className="text-red-500">*</span>
                        </label>
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg mb-3 border border-indigo-200">
                          <p className="text-3xl font-bold text-indigo-600">₹ {formData.marketValue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 mt-1">₹1,00,000 - ₹50,00,00,000</p>
                        </div>
                        <input 
                          type="range" 
                          min="100000" 
                          max="500000000" 
                          step="1000000" 
                          value={formData.marketValue} 
                          onChange={(e) => {
                            setFormData({...formData, marketValue: Number(e.target.value)});
                            if (fieldErrors.marketValue) {
                              setFieldErrors({...fieldErrors, marketValue: ''});
                            }
                          }}
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        {fieldErrors.marketValue && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.marketValue}
                          </p>
                        )}
                      </div>

                      {/* Loan Amount */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Loan Amount Required <span className="text-red-500">*</span>
                        </label>
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg mb-3 border border-indigo-200">
                          <p className="text-3xl font-bold text-indigo-600">₹ {formData.loanAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 mt-1">₹1,00,000 - ₹1,00,00,000</p>
                        </div>
                        <input 
                          type="range" 
                          min="100000" 
                          max="100000000" 
                          step="500000" 
                          value={formData.loanAmount} 
                          onChange={(e) => {
                            setFormData({...formData, loanAmount: Number(e.target.value)});
                            if (fieldErrors.loanAmount) {
                              setFieldErrors({...fieldErrors, loanAmount: ''});
                            }
                          }}
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
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
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all focus:outline-none"
                        >
                          <option>Business Expansion</option>
                          <option>Debt Consolidation</option>
                          <option>Education</option>
                          <option>Personal Needs</option>
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
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                          }`}
                        >
                          <option value="">Select Tenure</option>
                          {[...Array(30)].map((_, i) => (
                            <option key={i + 1} value={`${i + 1} year${i > 0 ? 's' : ''}`}>{i + 1} year{i > 0 ? 's' : ''}</option>
                          ))}
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
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Existing Loans on Property?</label>
                        <div className="flex space-x-6">
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="radio" 
                              name="existingLoans" 
                              value="Yes" 
                              checked={formData.existingLoans === 'Yes'} 
                              onChange={(e) => setFormData({...formData, existingLoans: e.target.value})}
                              className="w-4 h-4 accent-indigo-600"
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
                              className="w-4 h-4 accent-indigo-600"
                            />
                            <span className="ml-2 text-gray-700 font-medium">No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Income & Consent */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">💼</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Income & Consent</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Employment Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                        <select 
                          value={formData.employmentType} 
                          onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all focus:outline-none"
                        >
                          <option>Salaried</option>
                          <option>Self-Employed</option>
                          <option>Business Owner</option>
                        </select>
                      </div>

                      {/* Income / Turnover */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Monthly Income / Turnover <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={formData.incomeTurnover} 
                          onChange={(e) => {
                            setFormData({...formData, incomeTurnover: e.target.value});
                            if (fieldErrors.incomeTurnover) {
                              setFieldErrors({...fieldErrors, incomeTurnover: ''});
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            fieldErrors.incomeTurnover 
                              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-300' 
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                          }`}
                        >
                          <option value="">Select income range</option>
                          <option value="< 25,000">Less than ₹25,000</option>
                          <option value="25,000 - 50,000">₹25,000 - ₹50,000</option>
                          <option value="50,000 - 1,00,000">₹50,000 - ₹1,00,000</option>
                          <option value="1,00,000 - 2,50,000">₹1,00,000 - ₹2,50,000</option>
                          <option value="2,50,000 - 5,00,000">₹2,50,000 - ₹5,00,000</option>
                          <option value="> 5,00,000">More than ₹5,00,000</option>
                        </select>
                        {fieldErrors.incomeTurnover && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 20.485l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                            </svg>
                            {fieldErrors.incomeTurnover}
                          </p>
                        )}
                      </div>

                      {/* Company Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Company / Business Name <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter company/business name"
                          value={formData.companyName} 
                          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all focus:outline-none"
                        />
                      </div>

                      {/* ITR Filed */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">ITR Filed?</label>
                        <div className="flex space-x-6">
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="radio" 
                              name="itrFiled" 
                              value="Yes" 
                              checked={formData.itrFiled === 'Yes'} 
                              onChange={(e) => setFormData({...formData, itrFiled: e.target.value})}
                              className="w-4 h-4 accent-indigo-600"
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
                              className="w-4 h-4 accent-indigo-600"
                            />
                            <span className="ml-2 text-gray-700 font-medium">No</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Consent Checkbox */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
                      <label className="flex items-start cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.consent} 
                          onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                          className="w-5 h-5 mt-1 accent-indigo-600"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          I authorize Loanzaar and its partners to contact me via <span className="font-semibold">call, SMS, or WhatsApp</span> regarding my loan against property inquiry. I understand and acknowledge the terms and conditions.
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
                      className="ml-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg flex items-center gap-2"
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
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Check Eligibility
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
            <p className="text-lg text-gray-600 mb-8">Your LAP inquiry has been received. Our mortgage specialist will contact you shortly with personalized loan options.</p>
            <button 
              onClick={closeModal} 
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoanAgainstPropertyPage;

