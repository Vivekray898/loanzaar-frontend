'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';

const UsedCarLoanFormPage = () => {
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
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    carTypeModel: '',
    carAge: '',
    carPrice: '',
    downPayment: '',
    monthlyIncome: '',
    existingLoans: '',
    preferredTenure: '',
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

    if (!validateForm()) {
      return;
    }

    if (!captchaToken) {
      alert('Please complete the reCAPTCHA verification.');
      return;
    }

    try {
      const submissionData = {
        ...formData,
        loanType: 'Used Car Loan',
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
          carTypeModel: '',
          carAge: '',
          carPrice: '',
          downPayment: '',
          monthlyIncome: '',
          existingLoans: '',
          preferredTenure: '',
          message: '',
          consent: false
        });
        setCurrentStep(0);
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

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
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

      case 'carPrice':
        if (!value || value <= 0) {
          errors.carPrice = 'Valid car price is required';
        } else {
          delete errors.carPrice;
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep = (step) => {
    const errors = {};
    switch (step) {
      case 0:
        if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.phone) errors.phone = 'Phone number is required';
        break;
      case 1:
        if (!formData.carPrice || formData.carPrice <= 0) errors.carPrice = 'Valid car price is required';
        break;
      case 2:
        if (!formData.consent) errors.consent = 'You must agree to the terms';
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
    if (!formData.carPrice || formData.carPrice <= 0) errors.carPrice = 'Valid car price is required';
    if (!formData.consent) errors.consent = 'You must agree to the terms';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStep(0);
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
    { title: 'Loan of up to ₹47 Lakh', description: 'Get financing for used cars with competitive rates.', icon: 'dollar-sign' },
    { title: '3 Unique Variants', description: 'Choose from different loan options tailored to your needs.', icon: 'layers' },
    { title: 'Tenure of up to 72 months', description: 'Flexible repayment periods to suit your financial planning.', icon: 'clock' },
    { title: 'Minimal Documentation', description: 'Quick approval with essential documents only.', icon: 'file-text' },
    { title: 'Seize Opportunity', description: 'Own a quality used car without waiting to save up the full amount (up to 100% of Market valuation).', icon: 'zap' },
    { title: 'Budget-Friendly', description: 'We lend you the funds required to purchase the used car, repaid in manageable monthly installments or OD Facilities.', icon: 'wallet' },
    { title: 'Flexible Options', description: 'Choose from various used car models that suit your preferences.', icon: 'settings' },
    { title: 'Immediate Ownership', description: 'Drive your desired used car without the delay of saving for years.', icon: 'key' },
    { title: 'Great Value', description: 'Get a reliable used car with excellent value and features.', icon: 'star' },
    { title: 'Build Credit', description: 'Consistent payments can help enhance your credit history.', icon: 'trending-up' }
  ];

  const eligibilityCriteria = [
    { text: 'Age: Generally 21-65 years.', icon: 'calendar' },
    { text: 'Income: Minimum monthly or yearly earnings.', icon: 'dollar-sign' },
    { text: 'Employment: Stable job with experience (1-2 years).', icon: 'briefcase' },
    { text: 'Credit Score: Good score, often 680 or higher.', icon: 'star' },
    { text: 'Down Payment: A certain percentage of the car\'s cost.', icon: 'percent' },
    { text: 'Documentation: ID, address, income proofs, car papers.', icon: 'file-text' },
    { text: 'Loan Amount: Based on income and repayment ability.', icon: 'calculator' },
    { text: 'Debt-to-Income Ratio: Consideration of existing debts.', icon: 'bar-chart' },
    { text: 'Vehicle age: Within 15 years at the end of tenure.', icon: 'clock' },
    { text: 'For Salaried Individuals: At least 21 years old at application and no older than 60 at loan tenure end. Worked for at least two years, with at least one year with current employer. Minimum earning of Rs. 2,50,000 per year.', icon: 'user' },
    { text: 'For Self-Employed Individuals: At least 25 years old at application and no older than 65 at loan tenure end. Been in business for at least three years. Should earn at least Rs. 2,50,000 per year.', icon: 'users' }
  ];

  const documents = [
    'KYC documents (Valid Photo ID Proofs)',
    'PAN Card',
    'Last 2 years\' ITR as proof of income',
    'Salary Slip (latest 3 months)',
    'Salary account statement (latest 6 months)',
    'Signature Verification Proof',
    'Registration Certificate of the Car',
    'Car Insurance'
  ];

  const fees = [
    { particular: 'Processing Fees', charges: '1.5% to 4% of loan amount' },
    { particular: 'Valuation Charges', charges: '500 onwards' },
    { particular: 'Stamp Duty', charges: 'As Per State Government Rates' },
    { particular: 'RTO Charges', charges: 'As Per State Government Rates' }
  ];

  const reviews = [
    { rating: 4, text: "I was looking to buy a used car for my daily commute from home to work, but I didn't have enough savings to cover the down payment. Thanks to Ruloans, I was able to secure a car loan for 90% of the car's value for the best interest rate on the market.", author: "Abhishek Shinde" },
    { rating: 4, text: "I had previously taken a personal loan through Ruloans, and I was thoroughly impressed with their service. So, when I decided to buy a car, I knew exactly whom to contact for my used car loan application. Ruloans is the expert in the loan industry, and no matter the type of loan, they get the job done efficiently.", author: "Anjali Shah" },
    { rating: 4, text: "Getting a used car loan can often feel overwhelming due to the mountain of paperwork required by the lender. But thanks to the detailed checklist provided by Ruloans on their website, I was able to gather all the necessary documents quickly and submit them without any hassle. Ruloans truly made the process smooth and stress-free for me.", author: "Rahul Verma" }
  ];

  const faqs = [
    { question: 'What\'s a used car loan?', answer: 'A used car loan is a secured loan taken to purchase a pre-owned vehicle. The vehicle itself acts as collateral for the loan.' },
    { question: 'How does a used car loan work?', answer: 'You apply for a loan amount based on the car\'s value, pay a down payment, and repay the remaining amount through monthly EMIs over an agreed tenure.' },
    { question: 'What\'s the loan term?', answer: 'Used car loan tenures typically range from 12 to 72 months, depending on the lender and your repayment capacity.' },
    { question: 'Can I get a used car loan for any car?', answer: 'Generally, cars up to 15 years old at the end of the loan tenure are eligible, though some lenders may have stricter criteria.' },
    { question: 'What\'s a down payment?', answer: 'A down payment is the initial amount you pay upfront for the car purchase, reducing the loan amount you need to borrow.' },
    { question: 'Do I need a good credit score?', answer: 'Yes, a good credit score (often 680 or higher) improves your chances of loan approval and better interest rates.' },
    { question: 'What\'s the difference between a new and used car loan?', answer: 'New car loans typically offer better interest rates and higher loan amounts, while used car loans have stricter eligibility criteria and lower loan-to-value ratios.' },
    { question: 'Can I pay off the loan early?', answer: 'Yes, most lenders allow prepayment. However, there might be prepayment charges depending on the lender and loan terms.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta 
        title="Used Car Loan - Finance Your Secondhand Vehicle | Loanzaar" 
        description="Apply for a used car loan with competitive rates. Get quick approval for your pre-owned vehicle purchase at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <a href="/car-loan" className="hover:text-red-500">Car Loan</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Used Car Loan</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-6 md:px-16 flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Finance Your New Car Easily with Our <span className="text-red-500">Used Car Loan Options!</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Secure a Car Loan Option with Lower Interest Rates in the Market, designed to help you finance your used car purchase affordably.</p>
            <button onClick={() => setShowModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition">Apply Now</button>
          </div>
          <div className="relative">
            <img src="https://cdn.jsdelivr.net/gh/creativoxa/loanzaar/b2c/banners/car-loan-b.avif" alt="Used car loan concept with car and financial charts" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">Used Car Loan</text></svg>'} />
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
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
        {/* Overview Section */}
        <section id="overview-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Used Car Loan Overview</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Used Car Loan Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span>Loan of up to ₹47 Lakh</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span>3 Unique Variants</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span>Tenure of up to 72 months</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Used Car Loan Features & Benefits</h2>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Used Car Loan Eligibility</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">What is Used Car Loan Eligibility?</h3>
            <p className="text-gray-600 mb-6">
              Used car loan eligibility is about whether you can get a loan to buy a pre-owned vehicle. It depends on things like how much you earn, your credit score, and if you have other debts. Lenders use these details to decide if you can repay the loan. If you meet their criteria, you're eligible for the loan; if not, you might need to wait or improve your financial situation before getting a used car loan.
            </p>

            <h4 className="text-xl font-semibold text-gray-800 mb-4">Used Car Loan Eligibility Criteria for Top Banks</h4>
            <p className="text-gray-600 mb-6">Eligibility criteria vary from one bank to another, but generally include:</p>

            <div className="grid md:grid-cols-2 gap-6">
              {eligibilityCriteria.map((criteria, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <p className="text-gray-600">{criteria.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-red-50 rounded-lg">
              <h5 className="font-semibold text-red-800 mb-3">Factors Affecting Used Car Loan Eligibility:</h5>
              <ul className="text-red-700 space-y-1">
                <li>• Credit Score</li>
                <li>• Income Level</li>
                <li>• Employment Stability</li>
                <li>• Debt-to-Income Ratio</li>
                <li>• Age of Car</li>
                <li>• Loan Amount Requested</li>
                <li>• Down Payment Amount</li>
                <li>• Loan Tenure</li>
                <li>• Credit History</li>
                <li>• Existing Financial Obligations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section id="documents-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Required Documents</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Documents Required to Apply for Used Car Loan</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-gray-600">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EMI Calculator Section */}
        <section id="emi-calculator-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Used Car Loan EMI Calculator</h2>
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
                    <span className="text-2xl font-bold text-red-600">₹{emi.toLocaleString()}</span>
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

                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                  <h5 className="font-semibold text-red-800 mb-2">How is Used Car Loan EMI Calculated?</h5>
                  <p className="text-sm text-red-700">
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
              <h3 className="text-xl font-semibold text-gray-800">Used Car Loan Fees and Charges</h3>
              <p className="text-gray-600 text-sm mt-1">The fees and charges for used car loans vary between lenders.</p>
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
          <div className="grid md:grid-cols-1 gap-6">
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
                  <span className="text-red-600">
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

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-red-600 to-red-800 text-white p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Finance Your Used Car?</h2>
          <p className="text-xl mb-6">Apply for your used car loan today and get approved within minutes!</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Request Loan Information</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 h-2 rounded ${
                        step <= currentStep ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Step {currentStep + 1} of 3
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                    <div className="space-y-4">
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
                          placeholder="Enter your email address"
                        />
                        {fieldErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number / WhatsApp *
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
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Loan Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Car Type / Model
                        </label>
                        <input
                          type="text"
                          value={formData.carTypeModel}
                          onChange={(e) => setFormData({ ...formData, carTypeModel: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="e.g., Honda City, Toyota Fortuner"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Car Age / Year of Manufacture
                        </label>
                        <input
                          type="text"
                          value={formData.carAge}
                          onChange={(e) => setFormData({ ...formData, carAge: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="e.g., 2018, 3 years old"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Car Price / Expected Loan Amount *
                        </label>
                        <input
                          type="number"
                          value={formData.carPrice}
                          onChange={(e) => {
                            setFormData({ ...formData, carPrice: e.target.value });
                            validateField('carPrice', e.target.value);
                          }}
                          className={`w-full p-3 border rounded-lg ${
                            fieldErrors.carPrice ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter car price or loan amount"
                        />
                        {fieldErrors.carPrice && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.carPrice}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Down Payment / Own Contribution
                        </label>
                        <input
                          type="number"
                          value={formData.downPayment}
                          onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="Enter down payment amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Loan Tenure
                        </label>
                        <select
                          value={formData.preferredTenure}
                          onChange={(e) => setFormData({ ...formData, preferredTenure: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select preferred tenure</option>
                          <option value="6">6 months</option>
                          <option value="12">12 months</option>
                          <option value="24">24 months</option>
                          <option value="36">36 months</option>
                          <option value="48">48 months</option>
                          <option value="60">60 months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Financial & Additional Information</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Income <span className="text-gray-500">(optional)</span>
                          </label>
                          <input
                            type="number"
                            value={formData.monthlyIncome}
                            onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Enter your monthly income"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Existing Loans / EMIs <span className="text-gray-500">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={formData.existingLoans}
                            onChange={(e) => setFormData({ ...formData, existingLoans: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="e.g., Home loan ₹15,000/month"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message / Queries <span className="text-gray-500">(optional)</span>
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          rows="4"
                          placeholder="Any additional questions or requirements..."
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
                          I agree to be contacted for loan services *
                        </label>
                      </div>
                      {fieldErrors.consent && (
                        <p className="text-red-500 text-sm">{fieldErrors.consent}</p>
                      )}

                      <div className="border-t pt-4">
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                          onChange={handleCaptchaChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}

                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-auto"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!formData.consent || !captchaToken}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Request Loan Info
                  </button>
                )}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying for a Used Car Loan. Our team will review your application and contact you within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsedCarLoanFormPage;
