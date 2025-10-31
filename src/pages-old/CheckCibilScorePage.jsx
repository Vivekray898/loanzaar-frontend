'use client'

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false });
import Meta from '../components/Meta';

const CheckCibilScorePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    panNumber: '',
    dateOfBirth: '',
    consent: false
  });

  const handleTabClick = (tabId) => {
    const section = document.getElementById(`${tabId}-section`);
    if (section) {
      const headerOffset = 130;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setActiveTab(tabId);
  };

  const validateField = (field, value) => {
    const errors = { ...fieldErrors };

    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          errors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.fullName = 'Full name must be at least 2 characters';
        } else {
          delete errors.fullName;
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
      case 'panNumber':
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!value) {
          errors.panNumber = 'PAN number is required';
        } else if (!panRegex.test(value.toUpperCase())) {
          errors.panNumber = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
        } else {
          delete errors.panNumber;
        }
        break;
      case 'dateOfBirth':
        if (!value) {
          errors.dateOfBirth = 'Date of birth is required';
        } else {
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18) {
            errors.dateOfBirth = 'You must be at least 18 years old';
          } else if (age > 100) {
            errors.dateOfBirth = 'Please enter a valid date of birth';
          } else {
            delete errors.dateOfBirth;
          }
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
    if (!formData.panNumber) errors.panNumber = 'PAN number is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!captchaToken) {
      alert('Please complete the reCAPTCHA verification.');
      return;
    }

    if (!formData.consent) {
      alert('Please agree to the terms and conditions.');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare CIBIL score check data
      const cibilData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        panNumber: formData.panNumber.toUpperCase(),
        dateOfBirth: formData.dateOfBirth,
        consent: formData.consent,
        captchaToken: captchaToken,
        applicationType: 'cibilCheck',
        submittedAt: new Date().toISOString()
      };

      console.log('📤 Submitting CIBIL score check request:', cibilData);

      // For now, simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('✅ CIBIL score check request submitted successfully');
      setSubmitted(true);
      setShowModal(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        panNumber: '',
        dateOfBirth: '',
        consent: false
      });
      setCaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }

      // Show success message
      alert('Your CIBIL score check request has been submitted successfully! You will receive your report via email within 24 hours.');

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'layout-grid' },
    { id: 'ranges', label: 'Score Ranges', icon: 'bar-chart' },
    { id: 'how-to-check', label: 'How to Check', icon: 'search' },
    { id: 'benefits', label: 'Benefits', icon: 'star' },
    { id: 'tips', label: 'Tips to Improve', icon: 'lightbulb' },
    { id: 'faqs', label: 'FAQs', icon: 'help-circle' }
  ];

  const scoreRanges = [
    {
      range: '750 - 900',
      category: 'Excellent',
      implication: 'You are a low-risk borrower. Expect quick approvals and the best interest rates.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      range: '700 - 749',
      category: 'Good',
      implication: 'Loan approval chances are high. You can negotiate for favorable terms.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      range: '650 - 699',
      category: 'Average',
      implication: 'Approval is possible, but likely with higher interest rates.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      range: '550 - 649',
      category: 'Poor',
      implication: 'Lenders see you as high-risk. Focus on improving your score before applying.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      range: 'Below 550',
      category: 'Bad',
      implication: 'Loan approval is highly unlikely. Immediate financial discipline is needed.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  const benefits = [
    {
      title: 'Effortless Loan Approvals',
      description: 'Breeze through the application process with lenders.',
      icon: '✅'
    },
    {
      title: 'Lower Interest Rates',
      description: 'Save money with more competitive and affordable loan terms.',
      icon: '💰'
    },
    {
      title: 'Higher Credit Limits',
      description: 'Gain access to greater purchasing power on credit cards.',
      icon: '📈'
    },
    {
      title: 'Faster Processing',
      description: 'Experience quicker turnarounds on your loan and credit applications.',
      icon: '⚡'
    }
  ];

  const improvementTips = [
    {
      title: 'Always Pay on Time',
      description: 'Set reminders or auto-payments for all your bills to avoid late fees, which heavily impact your score.',
      icon: '⏰'
    },
    {
      title: 'Control Credit Usage',
      description: 'Keep your credit card balances below 30% of your total available limit.',
      icon: '💳'
    },
    {
      title: 'Maintain a Healthy Credit Mix',
      description: 'A combination of secured (like a car loan) and unsecured (like a credit card) credit is viewed favorably.',
      icon: '🔄'
    },
    {
      title: 'Avoid Closing Old Accounts',
      description: 'A longer credit history is beneficial. Keep old, well-managed accounts open.',
      icon: '📅'
    },
    {
      title: 'Apply for New Credit Thoughtfully',
      description: 'Too many applications in a short period can temporarily lower your score. Apply only when necessary.',
      icon: '🎯'
    },
    {
      title: 'Regularly Review Your Credit Report',
      description: 'Check for and dispute any errors or inaccuracies to ensure your report is correct.',
      icon: '🔍'
    }
  ];

  const faqs = [
    {
      question: 'What is a CIBIL score?',
      answer: 'A CIBIL score is a three-digit number, ranging from 300 to 900, that summarizes your credit history and represents your financial reliability. Lenders use this score to evaluate the risk of lending you money.'
    },
    {
      question: 'What is the maximum CIBIL score?',
      answer: 'The maximum CIBIL score is 900, which indicates excellent creditworthiness and financial reliability.'
    },
    {
      question: 'How is my CIBIL score calculated?',
      answer: 'Your CIBIL score is calculated based on factors like payment history (35%), credit utilization (30%), length of credit history (15%), credit mix (10%), and new credit inquiries (10%).'
    },
    {
      question: 'Will my score be affected if I checked my CIBIL score?',
      answer: 'No, checking your own CIBIL score does not affect your credit score. Only hard inquiries from lenders when you apply for credit can impact your score.'
    },
    {
      question: 'Do late payments affect my CIBIL score?',
      answer: 'Yes, late payments significantly affect your CIBIL score. Payment history is the most important factor (35% weight) in score calculation.'
    },
    {
      question: 'How can I improve my CIBIL score?',
      answer: 'You can improve your CIBIL score by paying bills on time, keeping credit utilization low, maintaining a good credit mix, avoiding unnecessary credit applications, and regularly reviewing your credit report for errors.'
    },
    {
      question: 'Where can I check my CIBIL score for a loan?',
      answer: 'You can check your CIBIL score through authorized credit bureaus like CIBIL, or through financial service providers like Loanzaar that offer instant, free CIBIL score checks.'
    },
    {
      question: 'What factors affect my CIBIL score?',
      answer: 'Payment history (35%), credit utilization ratio (30%), length of credit history (15%), credit mix (10%), and new credit inquiries (10%) are the main factors affecting your CIBIL score.'
    },
    {
      question: 'What is the difference between a CIBIL report and a CIBIL score?',
      answer: 'A CIBIL score is a single three-digit number that summarizes your creditworthiness, while a CIBIL report is a detailed document containing your complete credit history, including account details, payment records, and credit inquiries.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta
        title="Check CIBIL Score Online for Free | Loanzaar"
        description="Get your free CIBIL score and detailed credit report instantly online. Check CIBIL score ranges, improve tips, and benefits. India's leading loan platform."
      />

      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Check CIBIL Score</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-6 md:px-16 flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              INSTANT & FREE <span className="text-red-500">CIBIL SCORE CHECK</span> ONLINE WITH LOANZAAR
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Unlock Your Financial Health. Get Your Free CIBIL Score and Detailed Credit Report Instantly from Loanzaar, India's Leading Loan Distribution Company.
            </p>
            <Link
              href="/check-cibil-score/cibil-score-checker"
              className="inline-block bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition"
            >
              Check My CIBIL Score Now
            </Link>
          </div>
          <div className="relative">
            <img
              src="/cibil-score-hero.png"
              alt="Check CIBIL Score Online"
              className="w-full h-auto"
              onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">CIBIL Score Check</text></svg>'}
            />
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">WHAT IS A CIBIL SCORE?</h2>
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <p className="text-lg text-gray-700 mb-4">
              A CIBIL score is a three-digit number, ranging from 300 to 900, that summarizes your credit history and represents your financial reliability. Lenders use this score to evaluate the risk of lending you money. A higher score signifies strong credit health, opening doors to better loan terms and lower interest rates.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Why Checking Your CIBIL Score Matters</h3>
              <p className="text-blue-700">
                Regularly monitoring your CIBIL score online is crucial. It allows you to understand your financial standing, identify any errors in your credit report, and take proactive steps to improve your creditworthiness, ensuring you're always prepared for future financial needs.
              </p>
            </div>
          </div>
        </section>

        {/* Score Ranges Section */}
        <section id="ranges-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">UNDERSTANDING YOUR CIBIL SCORE RANGE</h2>
          <p className="text-lg text-gray-700 mb-8">
            Your CIBIL score falls into a specific category, indicating your credit health to lenders.
          </p>
          <div className="grid gap-6">
            {scoreRanges.map((range, index) => (
              <div key={index} className={`p-6 rounded-lg shadow-md border-2 ${range.bgColor} ${range.borderColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-900">{range.range}</div>
                    <div className={`text-xl font-semibold ${range.color}`}>{range.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Creditworthiness</div>
                    <div className={`font-semibold ${range.color}`}>{range.category}</div>
                  </div>
                </div>
                <div className="text-gray-700">
                  <strong>Implication for Loans:</strong> {range.implication}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Check Section */}
        <section id="how-to-check-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">HOW TO CHECK YOUR CIBIL SCORE FOR FREE</h2>
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <p className="text-lg text-gray-700 mb-6">
              Getting your instant CIBIL report with Loanzaar is simple and secure.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Visit Our Website</h3>
                  <p className="text-gray-600">Navigate to the 'Check CIBIL Score' section on the Loanzaar portal.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sign In</h3>
                  <p className="text-gray-600">Enter your mobile number for secure verification.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Provide Details</h3>
                  <p className="text-gray-600">Complete the short form with your information, including your PAN number.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Get Your Report</h3>
                  <p className="text-gray-600">Instantly view your CIBIL score and detailed credit report for free.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">BENEFITS OF A HIGH CIBIL SCORE</h2>
          <p className="text-lg text-gray-700 mb-8">
            A strong CIBIL score offers significant advantages:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{benefit.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 text-red-500">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section id="tips-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">TIPS TO IMPROVE YOUR CIBIL SCORE</h2>
          <p className="text-lg text-gray-700 mb-8">
            Boost your financial standing with these expert strategies:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {improvementTips.map((tip, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{tip.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 text-blue-600">{tip.title}</h3>
                    <p className="text-gray-600">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section id="faqs-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">FREQUENTLY ASKED QUESTIONS (FAQs)</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="text-lg font-semibold text-gray-800">{faq.question}</span>
                  <span className="text-red-500">
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
        <div className="text-center bg-gradient-to-r from-red-600 to-red-800 text-white p-8 rounded-lg mb-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Check Your CIBIL Score?</h2>
          <p className="text-xl mb-6">Get your free CIBIL score and detailed credit report instantly!</p>
          <Link
            href="/cibil-score-checker"
            className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Check My CIBIL Score Now
          </Link>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Check Your CIBIL Score</h2>
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
                      Phone Number *
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
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, panNumber: e.target.value.toUpperCase() });
                        validateField('panNumber', e.target.value);
                      }}
                      className={`w-full p-3 border rounded-lg ${
                        fieldErrors.panNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter PAN number (e.g., ABCDE1234F)"
                      maxLength="10"
                    />
                    {fieldErrors.panNumber && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.panNumber}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => {
                        setFormData({ ...formData, dateOfBirth: e.target.value });
                        validateField('dateOfBirth', e.target.value);
                      }}
                      className={`w-full p-3 border rounded-lg ${
                        fieldErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {fieldErrors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.dateOfBirth}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/terms-of-service" className="text-blue-600 hover:text-blue-800">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800">
                      Privacy Policy
                    </a>
                    . I consent to receive my CIBIL score and credit report via email.
                  </label>
                </div>

                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key
                    onChange={(token) => setCaptchaToken(token)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Get My Free CIBIL Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckCibilScorePage;
