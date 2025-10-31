'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';

const CarRefinanceFormPage = () => {
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
    carMakeModel: '',
    carYear: '',
    currentLoanAmount: '',
    currentLender: '',
    monthlyEMI: '',
    tenureRemaining: '',
    desiredLoanAmount: '',
    preferredTenure: '',
    refinanceReason: '',
    consent: false
  });

  // --- Scroll and Active Tab Logic ---
  const handleTabClick = (tabId) => {
    const section = document.getElementById(`${tabId}-section`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveTab(tabId);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('-section', '');
            setActiveTab(id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll('[id$="-section"]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // --- EMI Calculation ---
  useEffect(() => {
    const principal = loanAmount;
    const rate = interestRate / 100 / 12;
    const time = tenure;

    if (principal > 0 && rate > 0 && time > 0) {
      const emiValue = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
      const totalAmountValue = emiValue * time;
      const totalInterestValue = totalAmountValue - principal;

      setEmi(Math.round(emiValue));
      setTotalAmount(Math.round(totalAmountValue));
      setTotalInterest(Math.round(totalInterestValue));
    }
  }, [loanAmount, interestRate, tenure]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < 2) {
      nextStep();
      return;
    }

    try {
      const response = await fetch('/api/submit-loan-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          captchaToken,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setShowModal(false);
        setCurrentStep(0);
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          cityState: '',
          ageDob: '',
          carType: 'Car Refinance',
          carModel: '',
          carPrice: '',
          downPayment: '',
          loanAmount: 1000000,
          loanPurpose: 'Car Refinance',
          tenure: '',
          employmentType: 'Salaried',
          monthlyIncome: '',
          existingLoans: 'No',
          creditScore: '',
          bankStatement: 'No',
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

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  // --- Validation Functions ---
  const validateField = (fieldName, value) => {
    const errors = {};

    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) {
          errors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.fullName = 'Full name must be at least 2 characters';
        }
        break;
      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!value) {
          errors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(value)) {
          errors.phone = 'Please enter a valid 10-digit phone number';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'carMakeModel':
        if (!value.trim()) {
          errors.carMakeModel = 'Car make & model is required';
        }
        break;
      case 'carYear':
        if (!value) {
          errors.carYear = 'Car year is required';
        } else if (value < 2000 || value > new Date().getFullYear()) {
          errors.carYear = 'Please enter a valid car year';
        }
        break;
      case 'currentLoanAmount':
        if (!value || value <= 0) {
          errors.currentLoanAmount = 'Current loan amount is required';
        }
        break;
      case 'desiredLoanAmount':
        if (!value || value <= 0) {
          errors.desiredLoanAmount = 'Desired loan amount is required';
        }
        break;
      case 'preferredTenure':
        if (!value) {
          errors.preferredTenure = 'Please select a preferred loan tenure';
        }
        break;
      default:
        break;
    }

    return errors;
  };

  const validateStep = (step) => {
    let isValid = true;
    const newErrors = {};

    if (step === 0) {
      const fields = ['fullName', 'email', 'phone'];
      fields.forEach(field => {
        const fieldErrors = validateField(field, formData[field]);
        if (Object.keys(fieldErrors).length > 0) {
          Object.assign(newErrors, fieldErrors);
          isValid = false;
        }
      });
    } else if (step === 1) {
      const fields = ['carMakeModel', 'carYear', 'currentLoanAmount'];
      fields.forEach(field => {
        const fieldErrors = validateField(field, formData[field]);
        if (Object.keys(fieldErrors).length > 0) {
          Object.assign(newErrors, fieldErrors);
          isValid = false;
        }
      });
    } else if (step === 2) {
      const fields = ['desiredLoanAmount', 'preferredTenure'];
      fields.forEach(field => {
        const fieldErrors = validateField(field, formData[field]);
        if (Object.keys(fieldErrors).length > 0) {
          Object.assign(newErrors, fieldErrors);
          isValid = false;
        }
      });
    }

    setFieldErrors(newErrors);
    return isValid;
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
    { title: 'Lower Payments', description: 'Get a new loan with a lower interest rate, reducing your monthly payments.', icon: 'dollar-sign' },
    { title: 'Max Funding', description: 'Get Up to 250% Market Valuation Funding.', icon: 'trending-up' },
    { title: 'Shorten Loan Term', description: 'Opt for a shorter loan duration to pay off your car sooner.', icon: 'clock' },
    { title: 'Different Lender', description: 'Switch to a new lender for potentially better terms.', icon: 'refresh-cw' },
    { title: 'Adjustable Terms', description: 'Tailor the loan terms to better match your current financial situation.', icon: 'settings' },
    { title: 'Pay Off Sooner', description: 'Shorter loan terms help you become debt-free faster.', icon: 'target' },
    { title: 'Improved Financial Situation', description: 'Adjusting terms can align your loan with your current circumstances.', icon: 'bar-chart' }
  ];

  const eligibilityCriteria = [
    { text: 'Age: Generally 21-65 years.', icon: 'calendar' },
    { text: 'Income: Minimum monthly or yearly earnings.', icon: 'dollar-sign' },
    { text: 'Employment: Stable job with experience (1-2 years).', icon: 'briefcase' },
    { text: 'Credit Score: Good score, often 680 or higher.', icon: 'star' },
    { text: 'Documentation: ID, address, income proofs, car papers.', icon: 'file-text' },
    { text: 'Loan Amount: Based on income and repayment ability.', icon: 'calculator' },
    { text: 'Debt-to-Income Ratio: Consideration of existing debts.', icon: 'bar-chart' },
    { text: 'Paid EMIs: Car owners who have paid at least 12 EMIs on an active car loan.', icon: 'check-circle' },
    { text: 'For Salaried Individuals: At least 21 years old at application and no older than 60 at loan tenure end. Worked for at least two years, with at least one year with current employer. Minimum earning of Rs. 2,50,000 per year, including the income of the spouse/co-applicant. Individuals who own a car have paid at least 12 EMIs if there is an active loan.', icon: 'user' },
    { text: 'For Self-Employed Individuals: At least 25 years old at application and no older than 60 at loan tenure end. Been in business for at least two years. Should earn at least Rs. 2,50,000 per year. Individuals who own a car have paid at least 12 EMIs if there is an active loan.', icon: 'users' }
  ];

  const documents = [
    'KYC documents (Valid Photo ID Proofs)',
    'PAN Card',
    'Last 2 years\' ITR as proof of income (for self-employed individuals)',
    'Salary Slip (latest 3 months)',
    'Salary account statement (latest 6 months)',
    'Signature Verification Proof',
    'Registration Certificate of the Car',
    'Loan track (if there is an active loan on the car)',
    'Car Insurance'
  ];

  const fees = [
    { particular: 'Processing Fees', charges: '1.5% to 4% of loan amount' },
    { particular: 'Valuation Charges', charges: '500 onwards' },
    { particular: 'Stamp Duty', charges: 'As Per State Government Rates' },
    { particular: 'RTO Charges', charges: 'As Per State Government Rates' }
  ];

  const reviews = [
    { rating: 4, text: "I was looking for an instant business loan... after meeting Ruloans, I came to know that I can mortgage my car... With the help of Ruloans, I applied for a Car Refinance and got my loan disbursed within a span of four days with the lowest rate possible in the market.", author: "Neeraj Singh" },
    { rating: 4, text: "Cars are always called as a liability, but the right person can help you turn that liability into an asset. Such a person was Praveen from Ruloans, who guided me about Car Refinance and also helped me secure a loan against my existing car.", author: "Mayuresh Waghmare" }
  ];

  const faqs = [
    { question: 'What\'s car refinancing?', answer: 'Car refinancing is the process of replacing your existing car loan with a new loan that has better terms, such as a lower interest rate, different loan term, or different lender.' },
    { question: 'Why would I refinance my car?', answer: 'You might refinance to get a lower interest rate, reduce monthly payments, shorten your loan term, or switch to a different lender with better terms.' },
    { question: 'Can I refinance any type of car?', answer: 'Generally, cars that are financed and have some equity can be refinanced. The car should typically be less than 15 years old at the end of the new loan term.' },
    { question: 'How do I know if I should refinance?', answer: 'Consider refinancing if you can get a lower interest rate, want to change your loan term, or if your credit score has improved significantly since your original loan.' },
    { question: 'What\'s equity and why does it matter?', answer: 'Equity is the difference between your car\'s market value and what you owe on it. Positive equity is required for refinancing as it provides security for the new loan.' },
    { question: 'Does refinancing affect my credit score?', answer: 'Refinancing may temporarily lower your credit score due to a hard inquiry and new loan account, but consistent payments can improve it over time.' },
    { question: 'Can I refinance if my credit score has improved?', answer: 'Yes, an improved credit score can help you qualify for better interest rates and terms when refinancing.' },
    { question: 'Are there fees for refinancing?', answer: 'Yes, refinancing typically involves fees such as processing fees, valuation charges, stamp duty, and RTO charges, similar to getting a new loan.' },
    { question: 'Can I choose a shorter loan term when I refinance?', answer: 'Yes, you can often choose a shorter loan term when refinancing, which means higher monthly payments but less total interest paid over time.' },
    { question: 'How do I start the refinancing process?', answer: 'Contact lenders to check your eligibility, gather required documents, compare offers, and apply for the best refinancing option that suits your needs.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta 
        title="Car Loan Refinance - Lower Your EMI | Loanzaar" 
        description="Refinance your existing car loan for lower EMI and better terms. Save money with competitive rates at Loanzaar."
      />
      {/* Breadcrumb Navigation */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <a href="/car-loan" className="hover:text-red-500">Car Loan</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Car Refinance</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-6 md:px-16 flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Finance Your New Car Easily with Our <span className="text-red-500">Car Loan Options!</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Secure a Car Loan Option with Lower Interest Rates in the Market, designed to help you finance your new car purchase affordably.</p>
            <button onClick={() => setShowModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition">Apply Now</button>
          </div>
          <div className="relative">
            <img src="https://cdn.jsdelivr.net/gh/creativoxa/loanzaar/b2c/banners/car-loan-b.avif" alt="Car refinance concept with car and financial charts" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">Car Refinance</text></svg>'} />
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
        {/* Overview Section */}
        <section id="overview-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Car Refinance Overview</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Car Refinance Features</h3>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Car Refinance Features & Benefits</h2>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Car Refinance Eligibility</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">What is Car Refinance Eligibility?</h3>
            <p className="text-gray-600 mb-6">
              Car refinance eligibility is about whether you can replace your existing car loan with a new one that has better terms. It depends on factors like your income, credit score, car ownership history, and how much you've paid on your current loan. Lenders use these details to decide if you can get refinancing. If you meet their criteria, you're eligible for refinancing; if not, you might need to wait or improve your financial situation before applying.
            </p>

            <h4 className="text-xl font-semibold text-gray-800 mb-4">Car Refinance Eligibility Criteria for Top Banks</h4>
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
              <h5 className="font-semibold text-red-800 mb-3">Factors Affecting Car Refinance Eligibility:</h5>
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
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Documents Required to Apply for Car Refinance</h3>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Car Refinance EMI Calculator</h2>
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
                  <h5 className="font-semibold text-red-800 mb-2">How is Car Refinance EMI Calculated?</h5>
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
              <h3 className="text-xl font-semibold text-gray-800">Car Refinance Fees and Charges</h3>
              <p className="text-gray-600 text-sm mt-1">The fees and charges for car refinance vary between lenders.</p>
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
          <h2 className="text-3xl font-bold mb-4">Ready to Refinance Your Car?</h2>
          <p className="text-xl mb-6">Apply for car refinance today and get better terms on your existing loan!</p>
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
                <h2 className="text-2xl font-bold text-gray-900">Apply for Car Refinance</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2">
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
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Personal Info</h3>
                  <div className="grid md:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (fieldErrors.fullName) {
                            setFieldErrors({ ...fieldErrors, fullName: '' });
                          }
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
                          if (fieldErrors.email) {
                            setFieldErrors({ ...fieldErrors, email: '' });
                          }
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
                        Phone Number / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (fieldErrors.phone) {
                            setFieldErrors({ ...fieldErrors, phone: '' });
                          }
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
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Existing Car & Loan Info</h3>
                  <div className="grid md:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Car Make & Model *
                      </label>
                      <input
                        type="text"
                        value={formData.carMakeModel}
                        onChange={(e) => {
                          setFormData({ ...formData, carMakeModel: e.target.value });
                          if (fieldErrors.carMakeModel) {
                            setFieldErrors({ ...fieldErrors, carMakeModel: '' });
                          }
                        }}
                        className={`w-full p-3 border rounded-lg ${
                          fieldErrors.carMakeModel ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Honda City, Toyota Fortuner"
                      />
                      {fieldErrors.carMakeModel && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.carMakeModel}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Car Year / Age *
                      </label>
                      <input
                        type="number"
                        value={formData.carYear}
                        onChange={(e) => {
                          setFormData({ ...formData, carYear: e.target.value });
                          if (fieldErrors.carYear) {
                            setFieldErrors({ ...fieldErrors, carYear: '' });
                          }
                        }}
                        className={`w-full p-3 border rounded-lg ${
                          fieldErrors.carYear ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 2020"
                        min="2000"
                        max={new Date().getFullYear()}
                      />
                      {fieldErrors.carYear && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.carYear}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Loan Amount / Outstanding Balance *
                      </label>
                      <input
                        type="number"
                        value={formData.currentLoanAmount}
                        onChange={(e) => {
                          setFormData({ ...formData, currentLoanAmount: e.target.value });
                          if (fieldErrors.currentLoanAmount) {
                            setFieldErrors({ ...fieldErrors, currentLoanAmount: '' });
                          }
                        }}
                        className={`w-full p-3 border rounded-lg ${
                          fieldErrors.currentLoanAmount ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter current outstanding loan amount"
                      />
                      {fieldErrors.currentLoanAmount && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.currentLoanAmount}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Lender / Bank
                      </label>
                      <input
                        type="text"
                        value={formData.currentLender}
                        onChange={(e) => setFormData({ ...formData, currentLender: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="e.g., HDFC Bank, SBI, ICICI"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly EMI
                      </label>
                      <input
                        type="number"
                        value={formData.monthlyEMI}
                        onChange={(e) => setFormData({ ...formData, monthlyEMI: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Enter your current monthly EMI"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Tenure Remaining
                      </label>
                      <input
                        type="text"
                        value={formData.tenureRemaining}
                        onChange={(e) => setFormData({ ...formData, tenureRemaining: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="e.g., 24 months remaining"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Refinance Preferences</h3>
                  
                  <div className="grid md:grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Desired Loan Amount *
                      </label>
                      <input
                        type="number"
                        value={formData.desiredLoanAmount}
                        onChange={(e) => {
                          setFormData({ ...formData, desiredLoanAmount: e.target.value });
                          if (fieldErrors.desiredLoanAmount) {
                            setFieldErrors({ ...fieldErrors, desiredLoanAmount: '' });
                          }
                        }}
                        className={`w-full p-3 border rounded-lg ${
                          fieldErrors.desiredLoanAmount ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter desired loan amount"
                      />
                      {fieldErrors.desiredLoanAmount && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.desiredLoanAmount}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Loan Tenure *
                      </label>
                      <select
                        value={formData.preferredTenure}
                        onChange={(e) => {
                          setFormData({ ...formData, preferredTenure: e.target.value });
                          if (fieldErrors.preferredTenure) {
                            setFieldErrors({ ...fieldErrors, preferredTenure: '' });
                          }
                        }}
                        className={`w-full p-3 border rounded-lg ${
                          fieldErrors.preferredTenure ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select preferred tenure</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="24">24 months</option>
                        <option value="36">36 months</option>
                        <option value="48">48 months</option>
                        <option value="60">60 months</option>
                      </select>
                      {fieldErrors.preferredTenure && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.preferredTenure}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Refinance / Message
                      </label>
                      <textarea
                        value={formData.refinanceReason}
                        onChange={(e) => setFormData({ ...formData, refinanceReason: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="e.g., lower EMI, better interest rate, top-up amount needed"
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-start space-x-3 mb-4">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                        className="mt-1"
                      />
                      <label htmlFor="consent" className="text-sm text-gray-600">
                        I agree to be contacted for refinance services
                      </label>
                    </div>

                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      onChange={handleCaptchaChange}
                    />
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
                    Request Refinance Info
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in refinancing! Our team will contact you soon with refinance options tailored to your needs.
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

export default CarRefinanceFormPage;
