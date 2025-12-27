'use client'

import React, { useState, useRef } from 'react';
import Turnstile from '../components/Turnstile';
import Meta from '../components/Meta';
import { submitCreditCardApplication } from '../services/firestoreService';

const CreditCardsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardType: 'Shopping',
    monthlyIncome: '',
    employmentType: 'Salaried',
    message: '',
    consent: false
  });

  const handleTabClick = (tabId) => {
    if (typeof window === 'undefined') return;
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

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const sections = ['overview', 'features', 'eligibility', 'documents', 'reviews', 'faqs'];
      const scrollPosition = window.scrollY + 200;

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

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    console.log('✅ Turnstile token received:', token);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!captchaToken) {
      alert('Please complete the verification.');
      return;
    }

    if (!formData.consent) {
      alert('Please agree to be contacted.');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare credit card application data
      const creditCardData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        cardType: formData.cardType,
        monthlyIncome: formData.monthlyIncome,
        employmentType: formData.employmentType,
        message: formData.message,
        consent: formData.consent,
        captchaToken: captchaToken,
        applicationType: 'creditCard',  // Identify this as a credit card application
        submittedAt: new Date().toISOString()
      };

      console.log('📤 Submitting credit card application:', creditCardData);

      // Submit to backend - will be stored in other_data collection
      const result = await submitCreditCardApplication(creditCardData);

      if (result.success) {
        console.log('✅ Credit card application submitted successfully:', result.data);
        setSubmitted(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          cardType: 'Shopping',
          monthlyIncome: '',
          employmentType: 'Salaried',
          message: '',
          consent: false
        });
        setCaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      } else {
        alert(`Error: ${result.error || 'Failed to submit application'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'layout-grid' },
    { id: 'features', label: 'Features', icon: 'star' },
    { id: 'eligibility', label: 'Eligibility', icon: 'check-circle' },
    { id: 'documents', label: 'Documents', icon: 'file-text' },
    { id: 'reviews', label: 'Reviews', icon: 'message-circle' },
    { id: 'faqs', label: 'FAQs', icon: 'help-circle' }
  ];

  const cardTypes = [
    { name: 'Shopping', description: 'Curated to reward cardholders for shopping expenses with points or cashback.' },
    { name: 'Travel', description: 'Offer exciting deals related to travel, from air ticket bookings to reward points.' },
    { name: 'Lifestyle', description: 'Fulfill lifestyle wants with reward points for every swipe, shopping discounts, and cashback.' },
    { name: 'Rewards', description: 'Offer rewards like cashback, points, or travel miles for every dollar spent.' },
    { name: 'Fuel', description: 'Provide maximum benefits on fuel purchases, lowering expenditure on fuel.' },
    { name: 'Business', description: 'Designed for business owners with higher credit limits and exclusive benefits.' },
    { name: 'Secured', description: 'Ideal for building or rebuilding credit with a cash deposit as collateral.' },
    { name: 'Cashback', description: 'Reward cardholders with direct cashback on purchases.' }
  ];

  const features = [
    { title: 'Credit Limit', description: 'The maximum amount you can use. Exceeding it may incur a fee. Limits can change based on habits.' },
    { title: 'Balance', description: 'The total amount you owe, including purchases, charges, and fees.' },
    { title: 'APR (Annual Percentage Rate)', description: 'The interest rate applicable to the balance you carry forward.' },
    { title: 'Grace Period', description: 'The time you have to repay your balance in full before being charged a fee.' },
    { title: 'Rewards & Cashback', description: 'Earn points, cashback, or travel miles for every transaction.' },
    { title: 'Credit Card Fees', description: 'Common fees include annual, finance, late, and over-the-limit fees.' }
  ];

  const eligibilityCriteria = [
    { text: 'Age: Typically 18 or older.', icon: 'calendar' },
    { text: 'Income: Minimum income requirement to ensure repayment ability.', icon: 'dollar-sign' },
    { text: 'Credit Score: A good score indicates responsible credit behavior.', icon: 'star' },
    { text: 'Residential Status: Proof of current address may be needed.', icon: 'map-pin' }
  ];

  const documents = [
    'Identity Proof: Aadhaar Card, PAN card, Driver\'s License, Passport, or Voter\'s ID.',
    'Address Proof: Electricity bill, Telephone bill, Aadhaar Card, etc.',
    'Annual ITR (Self-Employed): To demonstrate financial status.',
    'Latest Salary Slips: For salaried individuals to show income.',
    'Bank Statements: Last 6 months of bank statements (optional but recommended).'
  ];

  const reviews = [
    {
      rating: 4,
      text: "Ruloans offered me a lifetime free credit card from AXIS bank and also guided me on using the credit card the right way. Now I use my credit card for every short and big transaction which in result benefits me with a huge amount of reward points.",
      author: "SHREYA MEHTA"
    },
    {
      rating: 4,
      text: "The employees at ruloans helped me in getting a credit card despite having a low credit score and are now also helping me to increase my credit score which can help me in future for getting any loan. They justify their tagline MUCH MORE THAN MONEY",
      author: "CHIRAG SALUNKE"
    }
  ];

  const faqs = [
    {
      question: 'What is a credit score?',
      answer: 'A credit score is a numerical representation of your creditworthiness, typically ranging from 300 to 900. It reflects your credit history, payment behavior, and financial habits.'
    },
    {
      question: 'What is a credit report?',
      answer: 'A credit report is a detailed record of your credit history, including information about loans, credit cards, payment history, and other financial activities maintained by credit bureaus.'
    },
    {
      question: 'How can you increase your credit score?',
      answer: 'You can increase your credit score by paying bills on time, maintaining low credit utilization, avoiding defaults, and ensuring accurate information in your credit report.'
    },
    {
      question: 'How is credit score calculated?',
      answer: 'Credit scores are calculated based on payment history (35%), credit utilization (30%), credit history length (15%), credit mix (10%), and new credit inquiries (10%).'
    },
    {
      question: 'What is the difference between Credit Score and Credit Report?',
      answer: 'A credit score is a single number that summarizes creditworthiness, while a credit report is a detailed document containing your complete credit history and information.'
    },
    {
      question: 'What are the factors that affect your credit score?',
      answer: 'Payment history, credit utilization ratio, length of credit history, credit mix (different types of credit), recent inquiries, and outstanding debts are the main factors.'
    },
    {
      question: 'How often is your credit score and report updated?',
      answer: 'Credit scores and reports are typically updated monthly when creditors report your account information to credit bureaus. However, changes can occur more frequently.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta 
        title="Credit Cards - Apply Online | Loanzaar" 
        description="Compare and apply for feature-packed credit cards with rewards and benefits. Instant approval on Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Credit Cards</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-6 md:px-16 flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Explore Top <span className="text-red-500">Credit Card Options</span> with Ruloans!
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Make every spending worthy by choosing the right credit card through Ruloans. Get exclusive benefits, rewards, and cashback on every purchase.</p>
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition">Apply Now</button>
          </div>
          <div className="relative">
            <img src="/credit-card-hero.png" alt="Credit card with rewards" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">Credit Cards</text></svg>'} />
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What is a Credit Card?</h2>
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <p className="text-lg text-gray-700 mb-4">
              A credit card is a financial instrument with a pre-loaded balance for transactions, to be paid later. You can pay off the balance fully, interest-free, for up to 50 days. To avoid fines, you can pay a minimum amount due (5% to 10% of the total). The remaining balance is carried forward with interest.
            </p>
            <p className="text-lg text-gray-700">
              With Ruloans, we help you find the perfect credit card that matches your spending habits and lifestyle needs.
            </p>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Credit Cards Available</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardTypes.map((card, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-semibold text-gray-800 mb-3">{card.name}</h4>
                <p className="text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Credit Card Features & Benefits</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-red-500">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Eligibility Section */}
        <section id="eligibility-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Credit Card Eligibility</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-700 mb-6">
              Criteria an individual must meet to qualify for a credit card. Factors include:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {eligibilityCriteria.map((criteria, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">{criteria.text}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 mt-6 italic">Note: Meeting criteria does not guarantee approval.</p>
          </div>
        </section>

        {/* Documents Section */}
        <section id="documents-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Documents Required</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Documents Required to Apply for a Credit Card</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-gray-600">{doc}</span>
                </div>
              ))}
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
                  <span className="text-red-500">
                    {activeFaq === index ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-14">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Apply Now CTA */}
        <div className="text-center bg-gradient-to-r from-red-600 to-red-800 text-white p-8 rounded-lg mb-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your Perfect Credit Card?</h2>
          <p className="text-xl mb-6">Apply today and start earning rewards on every purchase!</p>
          <button
            className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Inline small form area for Turnstile (legacy modal removed) */}
      <div className="max-w-md mx-auto px-4 mb-12">
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
            <input value={formData.fullName} onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); validateField('fullName', e.target.value); }} className="w-full px-4 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
            <input value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); validateField('email', e.target.value); }} className="w-full px-4 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
            <input value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') }); validateField('phone', e.target.value.replace(/\D/g, '')); }} className="w-full px-4 py-2 border rounded" />
          </div>
          <div className="flex justify-center">
            <Turnstile
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
              onVerify={handleCaptchaChange}
              onExpired={() => setCaptchaToken(null)}
            />
          </div>
          <div>
            <label className="inline-flex items-center">
              <input type="checkbox" checked={formData.consent} onChange={(e) => setFormData({ ...formData, consent: e.target.checked })} className="mr-2" />
              <span className="text-sm text-slate-600">I agree to be contacted</span>
            </label>
          </div>
          <div>
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 text-white rounded">{isLoading ? 'Processing...' : 'Submit Application'}</button>
          </div>
        </form>
      </div>

      {/* Success Message */}
      {submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in our credit cards. Our team will contact you soon with the best options tailored to your needs.
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

export default CreditCardsPage;

