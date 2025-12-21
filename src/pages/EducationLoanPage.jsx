'use client'

import React, { useState, useEffect, useRef } from 'react';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, GraduationCap, IndianRupee, Clock, Shield, Users 
} from 'lucide-react';

const EducationLoanPage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(10);
  const [tenure, setTenure] = useState(120);
  const [emi, setEmi] = useState(0);

  // --- EMI Calculation Logic ---
  useEffect(() => {
    const r = interestRate / 12 / 100;
    const n = tenure;
    const e = loanAmount * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    setEmi(Math.round(e));
  }, [loanAmount, interestRate, tenure]);

  const handleApplyClick = () => {
    alert("Opens Application Form Sheet"); 
  };

  // Data preserved from original code
  const features = [
    { id: 'high-value', icon: IndianRupee, title: 'High-Value Loans', desc: 'Secure funding for all expenses, from tuition to accommodation.' },
    { id: 'rates', icon: Star, title: 'Attractive Rates', desc: 'Benefit from competitive interest rates for manageable repayment.' },
    { id: 'pre-admission', icon: Clock, title: 'Pre-Admission', desc: 'Get sanctioned before admission is confirmed.' },
    { id: 'moratorium', icon:  Clock, title: 'Moratorium Period', desc: 'Repayment starts after course completion.' },
    { id: 'co-borrower', icon: Users, title: 'Co-borrower Option', desc: 'Parents can be co-borrowers to improve eligibility.' },
    { id: 'tax', icon: FileText, title: 'Tax Benefits', desc: 'Interest eligible for tax deduction under Section 80E.' },
    { id: 'coverage', icon: GraduationCap, title: 'Wide Coverage', desc: 'Loans for institutions in India and abroad.' },
    { id: 'collateral', icon: Shield, title: 'Collateral Options', desc: 'Secured and unsecured loans available.' }
  ];

  const eligibility = [
    'Age: 18+ years',
    'Proof of admission to eligible institution',
    'Co-borrower with stable income required',
    'Good academic record helps',
    'Good credit history of co-borrower',
    'Collateral for high-value loans'
  ];

  const documents = [
    { title: 'Student', items: ['ID Proof (Aadhaar/PAN)', 'Admission Proof', 'Academic Records', 'Address Proof'] },
    { title: 'Co-applicant', items: ['ID & Address Proof', 'Income Proof', 'Credit History', 'Relationship Proof'] },
    { title: 'Income (Salaried)', items: ['3 Months Salary Slips', 'Form 16 / ITR', '6 Months Bank Stmt'] },
    { title: 'Income (Self)', items: ['3 Years ITR', 'P&L Account', 'Balance Sheet', 'Biz Registration'] }
  ];

  const faqs = [
    { q: 'What is an education loan?', a: 'Financial aid to pay for tuition, books, and living costs for higher education.' },
    { q: 'Who is eligible?', a: 'Students 18+ with admission to eligible institutes and a co-borrower with stable income.' },
    { q: 'What is a moratorium period?', a: 'A grace period after course completion where no repayment is required.' },
    { q: 'When does repayment start?', a: 'Usually 6 months after course completion or after securing a job.' },
    { q: 'Can I prepay the loan?', a: 'Yes, most lenders allow prepayment without penalties.' },
    { q: 'Is there a tax benefit?', a: 'Yes, interest paid is deductible under Section 80E.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      <Meta title="Education Loan | Loanzaar" description="Finance your child's education with flexible loans." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </a>
        <h1 className="text-sm font-bold text-slate-900">Education Loan</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Study Abroad & India
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Fund your <br/> <span className="text-purple-200">Academic Dreams.</span>
            </h2>
            <p className="text-purple-100 text-sm mb-6 leading-relaxed">
              100% financing for tuition & living. Pre-admission sanction available.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 100% Secure
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Check className="w-3 h-3 text-green-400" /> Tax Benefit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tabbed Information Container */}
      <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] -mt-2 pt-2 min-h-screen">
        
        {/* Scrollable Tabs */}
        <div className="flex overflow-x-auto gap-2 px-4 py-4 scrollbar-hide border-b border-slate-100 sticky top-14 bg-white z-40">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'emi', label: 'Calculator', icon: Calculator },
            { id: 'features', label: 'Features', icon: Star },
            { id: 'docs', label: 'Docs', icon: FileText },
            { id: 'faqs', label: 'FAQs', icon: HelpCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${activeTab === tab.id 
                  ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                  : 'bg-slate-50 text-slate-500 border border-transparent'}
              `}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">What is it?</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  An education loan helps pay for tuition, books, and living expenses for higher studies in India or abroad.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <h3 className="text-sm font-bold text-purple-900 mb-3 uppercase tracking-wide">Key Benefits</h3>
                <ul className="space-y-3">
                  {[
                    'High-Value Loans for all expenses',
                    'Attractive Interest Rates',
                    'Pre-Admission Sanction advantage'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-purple-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Eligibility Criteria</h3>
                <ul className="space-y-2">
                  {eligibility.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* EMI CALCULATOR TAB */}
          {activeTab === 'emi' && (
            <div className="space-y-8">
              <div className="bg-slate-900 text-white p-6 rounded-2xl text-center shadow-lg">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Estimated Monthly EMI</p>
                <p className="text-4xl font-bold">₹{emi.toLocaleString()}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
                   <div>
                      <p className="text-[10px] text-slate-400">Total Interest</p>
                      <p className="text-sm font-bold text-yellow-400">₹{(emi * tenure - loanAmount).toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-400">Total Amount</p>
                      <p className="text-sm font-bold text-blue-400">₹{(emi * tenure).toLocaleString()}</p>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Loan Amount</span>
                    <span className="text-slate-900">₹{(loanAmount/100000).toFixed(1)}L</span>
                  </div>
                  <input 
                    type="range" min="50000" max="10000000" step="50000" 
                    value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Tenure</span>
                    <span className="text-slate-900">{tenure} Months</span>
                  </div>
                  <input 
                    type="range" min="12" max="180" step="12" 
                    value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="text-slate-900">{interestRate}%</span>
                  </div>
                  <input 
                    type="range" min="8" max="15" step="0.25" 
                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FEATURES TAB */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-2 gap-3">
              {features.map((feat) => (
                <div key={feat.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-purple-600">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{feat.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">{feat.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-xs text-orange-800 leading-relaxed">
                  Documents required for both Student and Co-applicant.
                </p>
              </div>
              
              {documents.map((section, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {section.title}
                  </div>
                  <div className="p-4 bg-white grid grid-cols-1 gap-2">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FAQS TAB */}
          {activeTab === 'faqs' && (
            <div className="space-y-3">
              {faqs.map((item, i) => (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex justify-between items-center p-4 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-800 pr-4">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === i && (
                    <div className="px-4 pb-4 pt-0 bg-white">
                      <div className="h-px bg-slate-100 w-full mb-3"></div>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* 4. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-50">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Education Loan</p>
            <p className="text-xs text-slate-400">Up to ₹1 Cr</p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-200"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default EducationLoanPage;