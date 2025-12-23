'use client'

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false });
import Meta from '../components/Meta';
import { 
  ChevronDown, 
  ShieldCheck, 
  BarChart3, 
  Search, 
  Star, 
  Lightbulb, 
  HelpCircle, 
  LayoutGrid,
  CreditCard,
  Calendar,
  User,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

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
    if (!validateForm()) return;
    if (!captchaToken) { alert('Please complete the reCAPTCHA verification.'); return; }
    if (!formData.consent) { alert('Please agree to the terms and conditions.'); return; }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
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
      setTimeout(() => {
        setSubmitted(false);
        setShowModal(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'ranges', label: 'Score Ranges', icon: BarChart3 },
    { id: 'how-to-check', label: 'How to Check', icon: Search },
    { id: 'benefits', label: 'Benefits', icon: Star },
    { id: 'tips', label: 'Tips to Improve', icon: Lightbulb },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle }
  ];

  const scoreRanges = [
    {
      range: '750 - 900',
      category: 'Excellent',
      implication: 'You are a low-risk borrower. Expect quick approvals and the best interest rates.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
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

  const inputClass = (hasError) => `
    block w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all duration-200 text-sm
    ${hasError 
      ? 'border-red-300 text-red-900 placeholder-red-300 bg-red-50/50 focus:ring-1 focus:ring-red-500 focus:border-red-500' 
      : 'border-slate-200 text-slate-700 placeholder-slate-400 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
    }
  `;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-10">
      <Meta
        title="Check CIBIL Score Online for Free | Loanzaar"
        description="Get your free CIBIL score and detailed credit report instantly online. Check CIBIL score ranges, improve tips, and benefits. India's leading loan platform."
      />

      {/* 1. Header (Mobile Friendly) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronDown className="w-3 h-3 -rotate-90" />
          <span className="text-slate-900 font-bold">CIBIL Score</span>
        </div>
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-900 py-12 md:py-24 px-6 md:px-16 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
               <ShieldCheck className="w-3 h-3" /> Secure & Verified
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              INSTANT & FREE <br/>
              <span className="text-blue-400">CIBIL SCORE CHECK</span> <br/>
              ONLINE WITH LOANZAAR
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-lg leading-relaxed">
              Unlock Your Financial Health. Get Your Free CIBIL Score and Detailed Credit Report Instantly from Loanzaar, India's Leading Loan Distribution Company.
            </p>
            <div className="pt-4 flex flex-col items-center md:items-start gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="w-full md:w-auto px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Check My CIBIL Score Now <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                 <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Free</span>
                 <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Safe & Secure</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative p-6">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
              <img
                src="/cibil-score-hero.png"
                alt="Check CIBIL Score Online"
                className="w-full h-auto drop-shadow-2xl relative z-10"
                onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%231e293b"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%233b82f6">CIBIL Score Check</text></svg>'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tab Navigation */}
      <nav className="sticky top-14 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto space-x-2 py-3 px-4 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 4. Content Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-20">
        
        {/* Overview Section */}
        <section id="overview-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
               <LayoutGrid className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">What is a CIBIL Score?</h2>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-base text-slate-600 leading-relaxed mb-6">
              A CIBIL score is a three-digit number, ranging from 300 to 900, that summarizes your credit history and represents your financial reliability. Lenders use this score to evaluate the risk of lending you money. A higher score signifies strong credit health, opening doors to better loan terms and lower interest rates.
            </p>
            <div className="bg-slate-50 border border-blue-100 p-5 rounded-2xl flex gap-4">
              <div className="mt-1 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                 <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Why Checking Your CIBIL Score Matters</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Regularly monitoring your CIBIL score online is crucial. It allows you to understand your financial standing, identify any errors in your credit report, and take proactive steps to improve your creditworthiness, ensuring you're always prepared for future financial needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Score Ranges Section */}
        <section id="ranges-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
               <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Understanding Your Range</h2>
          </div>
          <p className="text-base text-slate-500 mb-8 leading-relaxed">
            Your CIBIL score falls into a specific category, indicating your credit health to lenders.
          </p>
          <div className="grid gap-4">
            {scoreRanges.map((range, index) => (
              <div key={index} className={`p-5 rounded-2xl border-2 transition-all hover:shadow-md ${range.bgColor} ${range.borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xl font-black text-slate-900">{range.range}</div>
                  <div className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white shadow-sm ${range.color}`}>
                    {range.category}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-900">Implication for Loans:</span> {range.implication}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Check Section */}
        <section id="how-to-check-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
               <Search className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">How to Check for Free</h2>
          </div>
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-base text-slate-600 mb-8">
              Getting your instant CIBIL report with Loanzaar is simple and secure.
            </p>
            <div className="space-y-10 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
              {[
                { title: 'Visit Our Website', desc: "Navigate to the 'Check CIBIL Score' section on the Loanzaar portal." },
                { title: 'Sign In', desc: "Enter your mobile number for secure verification." },
                { title: 'Provide Details', desc: "Complete the short form with your information, including your PAN number." },
                { title: 'Get Your Report', desc: "Instantly view your CIBIL score and detailed credit report for free." }
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-6 relative z-10">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-lg shadow-blue-200">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits-section">
           <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
               <Star className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">High Score Benefits</h2>
          </div>
          <p className="text-base text-slate-500 mb-8 leading-relaxed">
            A strong CIBIL score offers significant advantages:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="text-2xl shrink-0">{benefit.icon}</div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section id="tips-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
               <Lightbulb className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Improve Your Score</h2>
          </div>
          <p className="text-base text-slate-500 mb-8 leading-relaxed">
            Boost your financial standing with these expert strategies:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {improvementTips.map((tip, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 group transition-all hover:bg-slate-900 hover:text-white">
                <div className="text-2xl group-hover:scale-125 transition-transform">{tip.icon}</div>
                <h3 className="text-base font-bold group-hover:text-blue-400 transition-colors">{tip.title}</h3>
                <p className="text-sm text-slate-500 group-hover:text-slate-400 leading-relaxed transition-colors">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section id="faqs-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
               <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Common Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center group active:bg-slate-50 transition-all"
                >
                  <span className="text-sm font-bold text-slate-800 pr-4">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-800 p-8 md:p-12 rounded-[2rem] text-center text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 uppercase tracking-tight">Ready to Check Your Score?</h2>
            <p className="text-blue-100 text-sm md:text-base mb-8 max-w-lg mx-auto leading-relaxed">Get your free CIBIL score and detailed credit report instantly!</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-3 bg-white text-blue-700 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all"
            >
              Check Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl transform transition-all duration-300 max-h-[95vh] overflow-y-auto">
            {!submitted ? (
              <div className="px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                   <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">One Last Step</h3>
                    <p className="text-xs text-slate-500 font-medium">Verify your details to fetch your report.</p>
                   </div>
                  <button onClick={closeModal} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name *</label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => {
                            setFormData({ ...formData, fullName: e.target.value });
                            validateField('fullName', e.target.value);
                          }}
                          className={inputClass(fieldErrors.fullName)}
                          placeholder="As per PAN Card"
                        />
                      </div>
                      {fieldErrors.fullName && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{fieldErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">PAN Number *</label>
                      <div className="relative group">
                        <CreditCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="text"
                          value={formData.panNumber}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setFormData({ ...formData, panNumber: val });
                            validateField('panNumber', val);
                          }}
                          className={inputClass(fieldErrors.panNumber)}
                          placeholder="ABCDE1234F"
                          maxLength="10"
                        />
                      </div>
                      {fieldErrors.panNumber && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{fieldErrors.panNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address *</label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            validateField('email', e.target.value);
                          }}
                          className={inputClass(fieldErrors.email)}
                          placeholder="john@example.com"
                        />
                      </div>
                      {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{fieldErrors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number *</label>
                        <div className="relative group">
                          <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="tel"
                            maxLength="10"
                            value={formData.phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setFormData({ ...formData, phone: val });
                              validateField('phone', val);
                            }}
                            className={inputClass(fieldErrors.phone)}
                            placeholder="9998887770"
                          />
                        </div>
                        {fieldErrors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{fieldErrors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">DOB *</label>
                        <div className="relative group">
                          <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => {
                              setFormData({ ...formData, dateOfBirth: e.target.value });
                              validateField('dateOfBirth', e.target.value);
                            }}
                            className={inputClass(fieldErrors.dateOfBirth)}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        {fieldErrors.dateOfBirth && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{fieldErrors.dateOfBirth}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="consent" className="text-[10px] text-slate-500 leading-normal">
                      I agree to the <Link href="/terms-of-service" className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy-policy" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>. I consent to receive my CIBIL score and credit report via email.
                    </label>
                  </div>

                  <div className="flex justify-center transform origin-center scale-90">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      onChange={(token) => setCaptchaToken(token)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Get My Free Score'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center text-center px-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2">Request Received!</h3>
                <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed">
                   Your CIBIL score check request has been submitted successfully! You will receive your report via email within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckCibilScorePage;