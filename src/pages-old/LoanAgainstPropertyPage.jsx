'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { isValidPhoneNumber, formatE164 } from '../utils/phone';

const LoanAgainstPropertyPage = () => {
  // State for tabs, EMI calculator, and FAQs
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(10);
  const [tenure, setTenure] = useState(120);
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

  const schemas = [
    generateLoanSchema({
      name: 'Loan Against Property',
      description: 'Get a loan against your property with competitive rates and flexible tenure up to 20 years. Unlock your property\'s value with minimal documentation.',
      loanType: 'Loan Against Property',
      interestRate: '8-14',
      tenure: '5-20 years',
      amount: '5,00,000 - 5,00,00,000'
    }),
    generateWebPageSchema({
      name: 'Loan Against Property - Loanzaar',
      description: 'Get a loan against your property with competitive rates and flexible tenure. Unlock your property\'s value at Loanzaar.',
      url: 'https://loanzaar.in/loan-against-property',
      breadcrumbs: [
        { name: 'Home', url: 'https://loanzaar.in' },
        { name: 'Loan Against Property', url: 'https://loanzaar.in/loan-against-property' }
      ]
    })
  ];

  return (
    <div className="min-h-screen bg-white">
      <StructuredData schema={schemas} />
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
            <p className="text-lg text-gray-600 max-w-lg">Get the best Loan Against Property deals at a lower interest rate. Unlock the value of your property for your business or personal needs.</p>          </div>
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
          <p className="text-xl mb-8">Apply for Your Loan Against Property Today!</p>        </div>
      </section>
    </div>
  );
};

export default LoanAgainstPropertyPage;

