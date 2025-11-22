'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { isValidPhoneNumber, formatE164 } from '../utils/phone';

const CarLoanFormPage = () => {
  // State for tabs, EMI calculator, and FAQs
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(9);
  const [tenure, setTenure] = useState(60);
  const [emi, setEmi] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    loanType: 'New Car',
    carMakeModel: '',
    expectedLoanAmount: '',
    message: '',
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
        behavior: 'smooth'
      });
    }
    setActiveTab(tabId);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'features', 'eligibility', 'documents', 'emi-calculator', 'fees', 'reviews', 'faqs'];
      const scrollPosition = window.scrollY + 200; // Offset for better detection

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(`${sections[i]}-section`);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- EMI Calculation ---
  useEffect(() => {
    const calculateEMI = () => {
      const principal = loanAmount;
      const rate = interestRate / 100 / 12; // Monthly interest rate
      const time = tenure; // Tenure in months

      if (principal > 0 && rate > 0 && time > 0) {
        const emiAmount = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
        const totalAmountPaid = emiAmount * time;
        const totalInterestPaid = totalAmountPaid - principal;

        setEmi(Math.round(emiAmount));
        setTotalAmount(Math.round(totalAmountPaid));
        setTotalInterest(Math.round(totalInterestPaid));
      }
    };

    calculateEMI();
  }, [loanAmount, interestRate, tenure]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      alert('Please complete the reCAPTCHA verification.');
      return;
    }

    if (!formData.consent) {
      alert('Please agree to be contacted.');
      return;
    }

    // Validate required fields
    if (!validateForm()) {
      return;
    }

    try {
      const submissionData = {
        ...formData,
        loanType: 'Car Loan',
        captchaToken
      };

      const result = await submitLoanApplication(submissionData);

      if (result.success) {
        setSubmitted(true);
        setShowModal(false);
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          loanType: 'New Car',
          carMakeModel: '',
          expectedLoanAmount: '',
          message: '',
          consent: false
        });
        setCaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  // --- Validation Functions ---
  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };

    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) {
          errors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.fullName = 'Full name must be at least 2 characters';
        } else {
          delete errors.fullName;
        }
        break;

      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!value) {
          errors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(value)) {
          errors.phone = 'Please enter a valid 10-digit phone number';
        } else {
          delete errors.phone;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.phone) errors.phone = 'Phone number is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const closeModal = () => {
    setShowModal(false);
    setFieldErrors({});
    setCaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
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
    { id: 'faqs', label: 'FAQs', icon: 'help-circle' }
  ];

  const features = [
    { title: 'Loan of up to ₹47 Lakh', description: 'Get financing for both new and used cars with competitive rates.', icon: 'dollar-sign' },
    { title: '3 Unique Variants', description: 'Choose from different loan options tailored to your needs.', icon: 'layers' },
    { title: 'Tenure of up to 72 months', description: 'Flexible repayment periods to suit your financial planning.', icon: 'clock' },
    { title: 'Minimal Documentation', description: 'Quick approval with essential documents only.', icon: 'file-text' },
    { title: 'Access to Immediate Funds', description: 'Get your car loan disbursed quickly after approval.', icon: 'zap' },
    { title: 'Flexible Loan Tenures', description: 'Choose repayment periods that work for your budget.', icon: 'calendar' },
    { title: 'Fixed Interest Rates', description: 'Predictable monthly payments with stable rates.', icon: 'trending-up' },
    { title: 'Customized Loan Amounts', description: 'Loan amounts tailored to your car purchase needs.', icon: 'settings' },
    { title: 'Convenient Monthly Repayments', description: 'Easy EMI payments through various channels.', icon: 'credit-card' },
    { title: 'Potential Tax Benefits', description: 'Tax savings on interest payments under Section 80C.', icon: 'percent' },
    { title: 'Option for New and Used Cars', description: 'Financing available for both new and pre-owned vehicles.', icon: 'car' },
    { title: 'Ownership from Day One', description: 'Take possession of your car immediately after loan approval.', icon: 'key' }
  ];

  const eligibilityCriteria = [
    { text: 'Age: 21 to 65 years', icon: 'calendar' },
    { text: 'Minimum Income: Often around INR 20,000 per month', icon: 'dollar-sign' },
    { text: 'Employment: Stable employment history', icon: 'briefcase' },
    { text: 'Credit Score: A good score, usually 650 or above', icon: 'star' },
    { text: 'Car Loan Eligibility for Salaried Individuals: Must be at least 21 years old at application and no older than 60 at loan tenure end. Must have worked for at least two years, with at least one year with the current employer. Minimum earning of Rs. 3,00,000 per year.', icon: 'user' },
    { text: 'Car Loan Eligibility for Self-Employed Individuals: Must be at least 21 years old at application and no older than 65 at loan tenure end. Must have been in business for at least two years. Should earn at least Rs. 3,00,000 per year.', icon: 'users' }
  ];

  const documents = [
    'KYC documents (Valid Photo ID Proofs)',
    'PAN Card',
    'Last 2 years\' ITR as proof of income',
    'Salary Slip (latest 3 months)',
    'Salary account statement (latest 6 months)',
    'Signature Verification Proof'
  ];

  const fees = [
    { particular: 'Loan Processing Fees', charges: '1.5% to 4% of loan amount' },
    { particular: 'Loan Cancellation', charges: 'Usually around Rs 5,000' },
    { particular: 'Stamp Duty Charges', charges: 'As per actuals' },
    { particular: 'Legal Fees', charges: 'As per actuals' },
    { particular: 'Penal Charges', charges: 'Usually @ 2% per month (24% p.a.)' },
    { particular: 'EMI / Cheque Bounce Charges', charges: 'Around Rs 400 per bounce' }
  ];

  const reviews = [
    { rating: 4, text: "I wanted to buy a car to travel daily from office to work but was not having enough money... thanks to RULOANS they got me a car loan for 90% of the car value with the best interest rate...", author: "SHIVANSH BHAGDE" },
    { rating: 4, text: "I had taken a personal loan with the help of RULOANS by which I was very impressed... I very much knew whom to contact for applying my loan as they are the experts in the loan industry...", author: "SHREYANSH BAKLIWAL" },
    { rating: 4, text: "...at the time of my car loan I read about RULOANS and approached them. The loan not only got disbursed in a 4 days but also I wasn't charged a penny from them.", author: "RONIT RANE" },
    { rating: 4, text: "Getting a used car loan can be daunting... thanks to the checklist provided by RULOANS on their website I was able to arrange all the documents so quickly and submit it to the lender.", author: "DISHA SHINDE" }
  ];

  const faqs = [
    { question: 'What is a car loan?', answer: 'A car loan is a secured loan taken to purchase a vehicle. The vehicle itself acts as collateral for the loan.' },
    { question: 'What\'s the importance of a down payment?', answer: 'A down payment reduces the loan amount you need to borrow, which can lower your monthly EMI and total interest paid.' },
    { question: 'What\'s the difference between a fixed and variable interest rate?', answer: 'Fixed rates remain constant throughout the loan tenure, while variable rates can change based on market conditions.' },
    { question: 'Can I prepay or pay off my car loan early?', answer: 'Yes, most lenders allow prepayment. However, there might be prepayment charges depending on the lender and loan terms.' },
    { question: 'What\'s the difference between a new car loan and a used car loan?', answer: 'New car loans typically offer better interest rates and higher loan amounts, while used car loans have stricter eligibility criteria and lower loan-to-value ratios.' },
    { question: 'What happens if I can\'t make my car loan payments?', answer: 'Missing payments can lead to penalties, negative impact on credit score, and in extreme cases, repossession of the vehicle.' },
    { question: 'How to get your Car Loan approved faster?', answer: 'Maintain a good credit score, have all documents ready, provide accurate information, and choose the right lender for your profile.' },
    { question: 'What is the minimum credit score I need to get a Car Loan?', answer: 'Most lenders require a minimum credit score of 650, though some may accept lower scores with additional documentation.' },
    { question: 'What is the maximum Loan amount that can be availed for a new car?', answer: 'Loan amounts can go up to ₹47 lakh or 100% of the car value, whichever is lower, depending on the lender and your eligibility.' },
    { question: 'What are the commonly available car loan repayment tenures?', answer: 'Car loan tenures typically range from 12 to 72 months, with some lenders offering up to 84 months for specific cases.' },
    { question: 'What will lenders look for when I apply for a car loan?', answer: 'Lenders evaluate credit score, income stability, employment history, debt-to-income ratio, and the vehicle\'s value.' },
    { question: 'How to get an NOC from a bank for a car loan?', answer: 'Contact your current lender, submit a NOC request with necessary documents, and pay any applicable fees. The process usually takes 7-15 days.' }
  ];

  const schemas = [
    generateLoanSchema({
      name: 'Car Loan',
      description: 'Get approved for a car loan quickly with competitive rates and flexible EMI options. New or used car financing available with tenure up to 7 years.',
      loanType: 'Car Loan',
      interestRate: '8-12',
      tenure: '1-7 years',
      amount: '1,00,000 - 50,00,000'
    }),
    generateWebPageSchema({
      name: 'Car Loan Application - Loanzaar',
      description: 'Get approved for a car loan quickly with competitive rates and flexible EMI options. New or used car financing available at Loanzaar.',
      url: 'https://loanzaar.in/car-loan',
      breadcrumbs: [
        { name: 'Home', url: 'https://loanzaar.in' },
        { name: 'Car Loan', url: 'https://loanzaar.in/car-loan' }
      ]
    })
  ];

  return (
    <div className="min-h-screen bg-white">
      <StructuredData schema={schemas} />
      <Meta 
        title="Car Loan Application - Loanzaar" 
        description="Get approved for a car loan quickly with competitive rates and flexible EMI options. New or used car financing available at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Car Loan</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-6 md:px-16 flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Drive Your Dream Car with a <span className="text-red-500">Fast Car Loan!</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Get a convenient Car Loan to purchase your dream vehicle. Our quick application process and flexible options are designed to get you on the road faster.</p>
            <button onClick={() => setShowModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition">Apply Now</button>
          </div>
          <div className="relative">
            <img src="https://cdn.jsdelivr.net/gh/creativoxa/loanzaar/b2c/banners/car-loan-b.avif" alt="car-loan-b.avif with car and financial charts" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">Car Loan</text></svg>'} />
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
                className={`flex-shrink-0 flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        <section id="overview-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Car Loan Overview</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Car Loan Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Loan of up to ₹47 Lakh</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>3 Unique Variants</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Tenure of up to 72 months</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Minimal Documentation</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Features and Benefits</h3>
              <div className="grid grid-cols-1 gap-4">
                {features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                    <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Car Loan Features & Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Eligibility Section */}
        <section id="eligibility-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Car Loan Eligibility</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">What is Car Loan Eligibility?</h3>
            <p className="text-gray-600 mb-6">
              Car loan eligibility is about whether you can get a loan to buy a car. It depends on things like how much you earn, your credit score, and if you have other debts. Lenders use these details to decide if you can repay the loan. If you meet their criteria, you're eligible for the loan; if not, you might need to wait or improve your financial situation before getting a car loan.
            </p>

            <h4 className="text-xl font-semibold text-gray-800 mb-4">Car Loan Eligibility Criteria for Top Banks</h4>
            <p className="text-gray-600 mb-6">Eligibility criteria vary from one bank to another, but generally include:</p>

            <div className="grid md:grid-cols-2 gap-6">
              {eligibilityCriteria.map((criteria, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">{criteria.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section id="documents-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Required Documents</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Documents Required to Apply for Car Loan</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EMI Calculator Section */}
        <section id="emi-calculator-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Car Loan EMI Calculator</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Calculate Your EMI</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount (₹)
                    </label>
                    <input
                      type="range"
                      min="100000"
                      max="4700000"
                      step="50000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>₹1L</span>
                      <span className="font-semibold">₹{loanAmount.toLocaleString()}</span>
                      <span>₹47L</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (%)
                    </label>
                    <input
                      type="range"
                      min="7"
                      max="15"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>7%</span>
                      <span className="font-semibold">{interestRate}%</span>
                      <span>15%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenure (Months)
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      step="6"
                      value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>12</span>
                      <span className="font-semibold">{tenure} months</span>
                      <span>72</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">EMI Calculation Result</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly EMI:</span>
                    <span className="text-2xl font-bold text-blue-600">₹{emi.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interest:</span>
                    <span className="text-lg font-semibold text-gray-800">₹{totalInterest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-lg font-semibold text-gray-800">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-2">How is Car Loan EMI Calculated?</h5>
                  <p className="text-sm text-blue-700">
                    The formula used is: EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]<br/>
                    Where: P = Principal, r = Monthly interest rate, n = Loan tenure in months
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fees Section */}
        <section id="fees-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Fees & Charges</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Car Loan Fees and Charges</h3>
              <p className="text-gray-600 text-sm mt-1">The fees and charges for car loans vary between lenders.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Particulars
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Charges
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fees.map((fee, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {fee.particular}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fee.charges}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                  <span className="ml-2 text-gray-600">({review.rating}/5)</span>
                </div>
                <p className="text-gray-600 mb-4 italic">"{review.text}"</p>
                <p className="text-sm font-semibold text-gray-800">- {review.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section id="faqs-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="text-lg font-semibold text-gray-800">{faq.question}</span>
                  <span className="text-blue-600">
                    {activeFaq === index ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Apply Now CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Drive Your Dream Car?</h2>
          <p className="text-xl mb-6">Apply for your car loan today and get approved within minutes!</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Car Loan Contact Form</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        validateField('fullName', e.target.value);
                      }}
                      className={`w-full p-3 border rounded-lg ${
                        fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {fieldErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        validateField('email', e.target.value);
                      }}
                      className={`w-full p-3 border rounded-lg ${
                        fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {fieldErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        validateField('phone', e.target.value);
                      }}
                      className={`w-full p-3 border rounded-lg ${
                        fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter 10-digit phone number"
                    />
                    {fieldErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Type
                    </label>
                    <select
                      value={formData.loanType}
                      onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="New Car">New Car</option>
                      <option value="Used Car">Used Car</option>
                      <option value="Refinance">Refinance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Car Make & Model
                    </label>
                    <input
                      type="text"
                      value={formData.carMakeModel}
                      onChange={(e) => setFormData({ ...formData, carMakeModel: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="e.g., Honda City, Toyota Fortuner (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Loan Amount
                    </label>
                    <input
                      type="number"
                      value={formData.expectedLoanAmount}
                      onChange={(e) => setFormData({ ...formData, expectedLoanAmount: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Enter amount (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message / Queries
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="4"
                    placeholder="Any specific questions or requirements (optional)"
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I agree to be contacted
                  </label>
                </div>

                <div className="border-t pt-4">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key
                    onChange={handleCaptchaChange}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!formData.consent || !captchaToken}
                    className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Request Info
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Message */}
      {submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in a Car Loan. Our team will contact you soon with more information.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarLoanFormPage;
