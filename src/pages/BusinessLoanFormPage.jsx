'use client'

import React, { useState, useEffect, useRef } from 'react';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, ArrowRight } from 'lucide-react';

const BusinessLoanFormPage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(12);
  const [tenure, setTenure] = useState(36);
  const [emi, setEmi] = useState(0);

  // Form State (Simplified for mobile demo)
  const [showApplySheet, setShowApplySheet] = useState(false); // Controls a modal/sheet

  // --- EMI Calculation Logic ---
  useEffect(() => {
    const r = interestRate / 12 / 100;
    const n = tenure;
    const e = loanAmount * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    setEmi(Math.round(e));
  }, [loanAmount, interestRate, tenure]);

  const handleApplyClick = () => {
    // Scroll to form or open modal
    // For this mobile-first design, we'll imagine it opens a sheet, but here we can just alert
    alert("Opens Application Form Sheet"); 
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-4 text-slate-900">
      <Meta title="Business Loan | Loanzaar" description="Fast business loans for growth." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </a>
        <h1 className="text-sm font-bold text-slate-900">Business Loan</h1>
        <div className="w-8"></div> {/* Spacer for center alignment */}
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Instant Approval
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Grow your business <br/> with zero friction.
            </h2>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              Collateral-free loans up to ₹50L with paperless processing.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 4.9 Rating
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Check className="w-3 h-3 text-green-400" /> 24h Disbursal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tabbed Information (App-like Navigation) */}
      <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] -mt-2 pt-2 min-h-screen">
        
        {/* Scrollable Tabs */}
        <div className="flex overflow-x-auto gap-2 px-4 py-4 scrollbar-hide border-b border-slate-100 sticky top-14 bg-white z-40">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'emi', label: 'Calculator', icon: Calculator },
            { id: 'docs', label: 'Documents', icon: FileText },
            { id: 'faqs', label: 'FAQs', icon: HelpCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
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
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Why choose us?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: 'High Amount', val: '₹50 Lakhs', sub: 'Max limit' },
                    { title: 'Low Interest', val: '11.99%', sub: 'Starting p.a.' },
                    { title: 'Tenure', val: '60 Months', sub: 'Flexible repayment' },
                    { title: 'Speed', val: '2 Days', sub: 'Disbursal time' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{stat.title}</p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">{stat.val}</p>
                      <p className="text-[10px] text-slate-500">{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Eligibility</h3>
                <ul className="space-y-3">
                  {[
                    'Business vintage of at least 2 years',
                    'Annual turnover > ₹10 Lakhs',
                    'Age between 21 to 65 years',
                    'CIBIL Score > 700'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="mt-0.5 min-w-[20px]">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
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
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Your Monthly EMI</p>
                <p className="text-4xl font-bold">₹{emi.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-2">Total Interest: ₹{(emi * tenure - loanAmount).toLocaleString()}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Loan Amount</span>
                    <span className="text-slate-900">₹{(loanAmount/100000).toFixed(1)}L</span>
                  </div>
                  <input 
                    type="range" min="100000" max="5000000" step="10000" 
                    value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Tenure</span>
                    <span className="text-slate-900">{tenure} Months</span>
                  </div>
                  <input 
                    type="range" min="12" max="60" step="6" 
                    value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="text-slate-900">{interestRate}%</span>
                  </div>
                  <input 
                    type="range" min="8" max="24" step="0.5" 
                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-xs text-orange-800 leading-relaxed">
                  Keep these handy for faster approval. We support Digilocker for instant verification.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {['PAN Card', 'Aadhaar Card', 'Last 12 months Bank Statement', 'Business Proof (GST/Udyam)', 'ITR for last 2 years'].map((doc, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-700 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-200">
                      {i + 1}
                    </div>
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQS TAB */}
          {activeTab === 'faqs' && (
            <div className="space-y-3">
              {[
                { q: "How much loan can I get?", a: "Depending on your turnover and credit score, you can get between ₹1 Lakh to ₹50 Lakhs." },
                { q: "Is collateral required?", a: "No, our business loans are completely collateral-free." },
                { q: "Minimum turnover required?", a: "Your business should have an annual turnover of at least ₹10 Lakhs." }
              ].map((item, i) => (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex justify-between items-center p-4 bg-white text-left"
                  >
                    <span className="text-sm font-semibold text-slate-800">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === i && (
                    <div className="px-4 pb-4 pt-0 bg-white">
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
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">EMI Starts at</p>
            <p className="text-lg font-bold text-slate-900">₹{emi.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default BusinessLoanFormPage;