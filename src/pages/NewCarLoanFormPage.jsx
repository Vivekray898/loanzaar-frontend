'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';

const NewCarLoanFormPage = () => {
  // State for tabs, EMI calculator, and FAQs
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(9);
  const [tenure, setTenure] = useState(60);
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
    email: '',
    phone: '',
    carMakeModel: '',
    carVariant: '',
    carPrice: '',
    downPayment: '',
    monthlyIncome: '',
    existingLoans: '',
    preferredTenure: '',
    interestQueries: '',
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
        setSubmitted(true);        setCurrentStep(0);
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          cityState: '',
          ageDob: '',
          carType: 'New Car',
          carModel: '',
          carPrice: '',
          downPayment: '',
          loanAmount: 1000000,
          loanPurpose: 'Purchase New Car',
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
      case 'carPrice':
        if (!value || value <= 0) {
          errors.carPrice = 'Please enter a valid car price or expected loan amount';
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
      const fields = ['carMakeModel', 'carPrice'];
      fields.forEach(field => {
        const fieldErrors = validateField(field, formData[field]);
        if (Object.keys(fieldErrors).length > 0) {
          Object.assign(newErrors, fieldErrors);
          isValid = false;
        }
      });
    } else if (step === 2) {
      const fields = ['preferredTenure'];
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
    { title: 'Quick Car Ownership', description: 'Get your dream new car without waiting to save up all the money (Avail up to 100% of On Road Cost).', icon: 'zap' },
    { title: 'Flexible Financing', description: 'We lend you the funds needed to buy the car, and you pay us back in smaller, manageable installments or OD facilities.', icon: 'settings' },
    { title: 'Enjoy the Newness', description: 'Experience the excitement of a brand-new car with all its latest features.', icon: 'star' },
    { title: 'Options Galore', description: 'Choose from a wide range of new car models that suit your taste and needs.', icon: 'layers' },
    { title: 'Building Credit', description: 'Making regular payments can help improve your credit score over time.', icon: 'trending-up' },
    { title: 'Warranty Coverage', description: 'Many new cars come with warranties that provide peace of mind.', icon: 'shield' }
  ];

  const eligibilityCriteria = [
    { text: 'Age: Generally 21-65 years.', icon: 'calendar' },
    { text: 'Income: Minimum monthly or yearly earnings.', icon: 'dollar-sign' },
    { text: 'Employment: Stable job with experience (1-2 years).', icon: 'briefcase' },
    { text: 'Credit Score: Good score, often 700 or higher.', icon: 'star' },
    { text: 'Down Payment: A certain percentage of the car\'s cost.', icon: 'percent' },
    { text: 'Documentation: ID, address, income proofs, car papers.', icon: 'file-text' },
    { text: 'Loan Amount: Based on income and repayment ability.', icon: 'calculator' },
    { text: 'Debt-to-Income Ratio: Consideration of existing debts.', icon: 'bar-chart' },
    { text: 'For Salaried Individuals: At least 21 years old at application and no older than 60 at loan tenure end. Worked for at least two years, with at least one year with current employer. Minimum earning of Rs. 2,50,000 per year, including the income of the spouse/co-applicant.', icon: 'user' },
    { text: 'For Self-Employed Individuals: At least 25 years old at application and no older than 65 at loan tenure end. Been in business for at least three years. Should earn at least Rs. 2,50,000 per year.', icon: 'users' }
  ];

  const documents = [
    'KYC documents (Valid Photo ID Proofs)',
    'PAN Card',
    'Last 2 years\' ITR as proof of income',
    'Salary Slip (latest 3 months)',
    'Salary account statement (latest 6 months)',
    'Signature Verification Proof',
    'Proforma Invoice of the Car'
  ];

  const fees = [
    { particular: 'Processing Fees', charges: 'Starting from 6200 onwards' },
    { particular: 'Stamp Duty', charges: 'As Per State Government Rates' }
  ];

  const reviews = [
    { rating: 4, text: "I was worried about hidden charges and high fees when applying for a new car loan, but Ruloans was completely transparent from the start. They offered me an affordable loan with no hidden costs or unnecessary extras...", author: "Umesh Bhagde" },
    { rating: 4, text: "I was dreading the paperwork and complicated procedures of applying for a new car loan, but Ruloans made everything smooth and convenient. They handled all the heavy lifting, and I barely had to worry about anything...", author: "Akshay Sharma" },
    { rating: 4, text: "What I loved most about Ruloans is their flexibility. I was worried that my budget wouldn't allow me to get the car I wanted, but they worked out a loan plan that fit perfectly into my financial situation...", author: "Shraddha Salunke" }
  ];

  const faqs = [
    { question: 'What is a new car loan?', answer: 'A new car loan is a type of auto loan specifically designed for purchasing a brand-new vehicle from a dealership.' },
    { question: 'How do new car loans work?', answer: 'You apply for a loan amount based on the car\'s price, make a down payment, and repay the remaining amount through monthly EMIs over an agreed tenure.' },
    { question: 'What\'s a down payment?', answer: 'A down payment is the initial amount you pay upfront for the car purchase, reducing the loan amount you need to borrow.' },
    { question: 'What\'s an interest rate?', answer: 'The interest rate is the percentage charged by the lender for borrowing money, which affects your monthly EMI and total loan cost.' },
    { question: 'How long is a new car loan?', answer: 'New car loan tenures typically range from 12 to 72 months, depending on the lender and your repayment capacity.' },
    { question: 'Can I choose my monthly payment?', answer: 'Yes, you can choose your monthly EMI amount based on your loan amount, interest rate, and preferred tenure.' },
    { question: 'Can I customize the car with a loan?', answer: 'Yes, you can include customization costs in your loan amount, subject to lender approval and eligibility criteria.' },
    { question: 'What\'s a loan term?', answer: 'A loan term is the duration over which you repay the loan, typically ranging from 1 to 7 years for new car loans.' },
    { question: 'Can I pay off the loan early?', answer: 'Yes, most lenders allow prepayment. However, there might be prepayment charges depending on the lender and loan terms.' },
    { question: 'How do I get a new car loan?', answer: 'You can apply online through our website, provide the required documents, and get approved within minutes based on your eligibility.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta 
        title="New Car Loan - Buy Your Dream Car | Loanzaar" 
        description="Get financing for your new car with low interest rates and flexible tenure. Quick approval and easy documentation at Loanzaar."
      />
      {/* Breadcrumb Navigation */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <a href="/car-loan" className="hover:text-red-500">Car Loan</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">New Car Loan</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-surface-bg to-slate-50 py-20 px-6 md:px-16 flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Finance Your New Car Easily with Our <span className="text-red-500">Car Loan Options!</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Secure a Car Loan Option with Lower Interest Rates in the Market, designed to help you finance your new car purchase affordably.</p>          </div>
          <div className="relative">
            <img src="/new-car-loan-hero.png" alt="New car loan concept with car and financial charts" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">New Car Loan</text></svg>'} />
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">New Car Loan Overview</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">New Car Loan Features</h3>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">New Car Loan Features & Benefits</h2>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">New Car Loan Eligibility</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">What is New Car Loan Eligibility?</h3>
            <p className="text-gray-600 mb-6">
              New car loan eligibility is about whether you can get a loan to buy a brand-new vehicle. It depends on things like how much you earn, your credit score, and if you have other debts. Lenders use these details to decide if you can repay the loan. If you meet their criteria, you're eligible for the loan; if not, you might need to wait or improve your financial situation before getting a new car loan.
            </p>

            <h4 className="text-xl font-semibold text-gray-800 mb-4">New Car Loan Eligibility Criteria for Top Banks</h4>
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
              <h5 className="font-semibold text-red-800 mb-3">Factors Affecting New Car Loan Eligibility:</h5>
              <ul className="text-red-700 space-y-1">
                <li>• Credit Score</li>
                <li>• Income Level</li>
                <li>• Employment Stability</li>
                <li>• Debt-to-Income Ratio</li>
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
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Documents Required to Apply for New Car Loan</h3>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">New Car Loan EMI Calculator</h2>
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
                  <h5 className="font-semibold text-red-800 mb-2">How is New Car Loan EMI Calculated?</h5>
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
              <h3 className="text-xl font-semibold text-gray-800">New Car Loan Fees and Charges</h3>
              <p className="text-gray-600 text-sm mt-1">The fees and charges for new car loans vary between lenders.</p>
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
        <div className="text-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Finance Your New Car?</h2>
          <p className="text-xl mb-6">Apply for your new car loan today and get approved within minutes!</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Application Modal */}
      {/* Success Modal */}
      {submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest! Our team will contact you soon with loan information tailored to your needs.
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

export default NewCarLoanFormPage;
