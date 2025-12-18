'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { submitToFirestore } from '../services/firestoreService';
// import Meta from '../components/Meta'; // Assuming Meta component exists for SEO

// --- FAQ DATA ---
const faqs = [
  {
    question: 'What is a CIBIL score?',
    answer: 'A CIBIL score is a 3-digit number from 300-900 that reflects your credit health. Lenders use it to assess your loan eligibility.',
  },
  {
    question: 'What is the maximum CIBIL score?',
    answer: 'The maximum CIBIL score is 900, which indicates excellent credit history and financial discipline.',
  },
  {
    question: 'How is my CIBIL score calculated?',
    answer: "It's calculated based on several factors, including your payment history, credit utilization, types of credit, and length of credit history.",
  },
  {
    question: 'Will my CIBIL score improve if I clear my dues and close my loan?',
    answer: 'Yes, clearing dues and responsibly closing loans will positively impact and improve your CIBIL score over time.',
  },
  {
    question: 'Do late payments affect my CIBIL score?',
    answer: 'Yes, late payments have a significant negative impact on your CIBIL score as they suggest poor financial management.',
  },
  {
    question: 'How can I improve my CIBIL score?',
    answer: 'You can improve it by paying bills on time, keeping credit card balances low, maintaining a mix of credit types, and regularly checking your credit report for errors.',
  },
  {
    question: 'Would my score be affected if I checked my CIBIL score?',
    answer: 'No, checking your own CIBIL score is a "soft inquiry" and does not affect your credit score.',
  },
  {
    question: 'Where can I check my CIBIL score for a loan?',
    answer: 'You can check it for free on our website or directly through the CIBIL bureau.',
  },
  {
    question: 'What factors affect my CIBIL score?',
    answer: 'Key factors include payment history, credit utilization ratio, age of credit history, credit mix, and recent credit inquiries.',
  },
  {
    question: 'What is the difference between a CIBIL report and a CIBIL score?',
    answer: 'The CIBIL score is a single 3-digit number. The CIBIL report is a detailed summary of your entire credit history, which is used to calculate the score.',
  },
];

// --- FAQ ITEM COMPONENT ---
const FaqItem = ({ faq, index, activeFaq, setActiveFaq }) => {
  const isOpen = activeFaq === index;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        onClick={() => setActiveFaq(isOpen ? null : index)}
        className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 sm:px-6 py-4 text-left"
      >
        <span className="text-base font-semibold text-slate-900">{faq.question}</span>
        <svg
          className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-6 pb-5 text-sm text-slate-600 leading-relaxed">
            {faq.answer}
          </div>
        </div>
      </div>
    </div>
  );
};


const CibilScoreCheckerPage = () => {
  const [panNumber, setPanNumber] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0); // State for active FAQ

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan) return 'PAN number is required';
    if (!panRegex.test(pan.toUpperCase())) return 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleModalOpen();
  };
  // Modal submit handler
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return setModalError('Full Name is required');
    if (!/^[0-9]{10}$/.test(phone)) return setModalError('Phone must be 10 digits');
    setModalError('');
    setIsSubmitting(true);
    try {
  // Save to cibil_score collection
  await submitToFirestore('cibilScore', { fullName, phone, pan: panNumber, requestedAt: new Date().toISOString() });
      setSubmitSuccess(true);
      // Auto-close after 2s
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFullName(''); setPhone(''); setPanNumber('');
      }, 2000);
    } catch (err) {
      setModalError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Open modal only if PAN is valid
  const handleModalOpen = () => {
    const error = validatePAN(panNumber);
    if (error) {
      setFieldError(error);
    } else {
      setFieldError('');
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* <Meta
        title="CIBIL Score Checker | Loanzaar"
        description="Instantly check your CIBIL score online. Enter your PAN to get a free, detailed credit report. Powered by CIBIL."
      /> */}
      <div className="min-h-screen bg-[#f8fafc]">
        {/* --- MODAL DIALOG --- */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 animate-fade-in-scale"
              onClick={e => e.stopPropagation()}
            >
              {!submitSuccess ? (
                <>
                  <div className="flex justify-between items-center p-5 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">One Last Step...</h3>
                    <button 
                      className="p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800" 
                      onClick={() => setIsModalOpen(false)}
                    >
                      &times;
                    </button>
                  </div>
                  <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                        placeholder="e.g., Ramesh Kumar"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        id="phone"
                        type="tel"
                        maxLength="10"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                    {modalError && <p className="text-red-600 text-sm font-medium text-center">{modalError}</p>}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-3 bg-[#e53945] text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-[#d32f2f] disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5"
                    >
                      {isSubmitting ? 'Submitting...' : 'Get CIBIL Score'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center p-8 sm:p-12">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h3>
                  <p className="text-slate-600">Your CIBIL score request has been received. We will notify you shortly.</p>
                </div>
              )}
            </div>
          </div>
        )}
        <style>{`
          @keyframes fade-in-scale {
            0% {
              transform: scale(0.95);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-fade-in-scale {
            animation: fade-in-scale 0.3s ease-out forwards;
          }
        `}</style>
        <nav className="py-4 px-4 sm:px-8 text-sm text-gray-700 flex items-center gap-2 border-b bg-white">
          <Link href="/" className="hover:text-red-500">Home</Link>
          <span>&gt;</span>
          <span className="text-red-500 font-semibold">Check Your Cibil Score</span>
        </nav>

        <div className="flex justify-center items-center py-10 sm:py-16 px-4">
          <div className="bg-white rounded-2xl shadow-xl flex flex-col lg:flex-row w-full max-w-5xl min-h-[500px] overflow-hidden">
            {/* Left Side: Image & Info */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-white p-8 lg:p-10 text-center">
              <img src="https://placehold.co/224x224/e0f2fe/0c4a6e?text=CIBIL&font=sans" alt="CIBIL Score" className="w-48 h-48 sm:w-56 sm:h-56 object-contain mb-6 rounded-full border-4 border-white shadow-md" />
              <div className="text-lg font-semibold text-gray-700 mb-2">Join 50k+ Monthly Users</div>
              <p className="text-sm text-gray-500 mb-6">Checking your score with us is fast, free, and won't impact your credit.</p>
              <div className="flex justify-center gap-4 sm:gap-6 mt-4">
                <img src="https://placehold.co/40x40/ffffff/3b82f6?text=💰" alt="Loan" className="w-10 h-10 rounded-full" title="Personal Loan" />
                <img src="https://placehold.co/40x40/ffffff/ef4444?text=🚗" alt="Car" className="w-10 h-10 rounded-full" title="Car Loan" />
                <img src="https://placehold.co/40x40/ffffff/10b981?text=🎓" alt="Education" className="w-10 h-10 rounded-full" title="Education Loan" />
                <img src="https://placehold.co/40x40/ffffff/f59e0b?text=🪙" alt="Gold" className="w-10 h-10 rounded-full" title="Gold Loan" />
                <img src="https://placehold.co/40x40/ffffff/8b5cf6?text=🏠" alt="Home" className="w-10 h-10 rounded-full" title="Home Loan"/>
              </div>
            </div>
            {/* Right Side: Form */}
            <div className="w-full lg:w-3/5 flex flex-col justify-center px-6 sm:px-10 py-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Get Your Free CIBIL Score</h2>
              <p className="text-gray-600 mb-6">Please provide us with your PAN number to proceed.</p>
              <form onSubmit={handleSubmit} className="w-full max-w-md">
                <label htmlFor="pan" className="block text-base font-medium text-gray-700 mb-2">Enter your PAN</label>
                <input
                  id="pan"
                  type="text"
                  value={panNumber}
                  onChange={e => setPanNumber(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${fieldError ? 'border-red-500 ring-red-200' : 'border-gray-300'}`}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  required
                />
                {fieldError && <div className="text-red-600 text-sm mt-2 font-medium">{fieldError}</div>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-8 py-3 bg-[#e53945] text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-[#d32f2f] disabled:opacity-60 hover:shadow-lg hover:-translate-y-0.5"
                >
                  {isLoading ? 'Processing...' : 'Continue'}
                </button>
                <div className="mt-6 flex justify-center">
                  <img src="https://placehold.co/100x32/ffffff/64748b?text=CIBIL" alt="Powered by CIBIL" className="h-8" />
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* --- FAQ Section --- */}
        <section className="py-10 sm:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
               <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Frequently Asked Questions
               </h2>
               <p className="mt-3 text-base text-slate-600">
                Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
               </p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FaqItem
                  key={index}
                  faq={faq}
                  index={index}
                  activeFaq={activeFaq}
                  setActiveFaq={setActiveFaq}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CibilScoreCheckerPage;

