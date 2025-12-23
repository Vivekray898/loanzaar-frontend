'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, Building, Wallet, Shield, Clock, TrendingUp, Home
} from 'lucide-react';

const LoanAgainstPropertyPage = () => {
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

  // --- Data Preserved from Original ---
  const features = [
    { id: 'eligibility', icon: Check, title: 'Flexible Eligibility', desc: 'Wide range of criteria accepted.' },
    { id: 'value', icon: Wallet, title: 'High Loan Value', desc: 'Loans from ₹10 Lakh to ₹5 Crore.' },
    { id: 'collateral', icon: Building, title: 'Versatile Collateral', desc: 'Residential, commercial, or industrial.' },
    { id: 'usage', icon: TrendingUp, title: 'Multipurpose Use', desc: 'Business, education, or personal needs.' },
    { id: 'tenure', icon: Clock, title: 'Longer Tenure', desc: 'Repay comfortably over 5 to 20 years.' },
    { id: 'score', icon: Star, title: 'Improve Score', desc: 'Timely repayment boosts credit history.' }
  ];

  const eligibilityCriteria = [
    { icon: 'flag', text: 'Nationality: Indian Citizen', highlight: false },
    { icon: 'wallet', text: 'Stable Income Source', highlight: true },
    { icon: 'star', text: 'Strong Credit History', highlight: true },
    { icon: 'home', text: 'Clear Property Title', highlight: true },
    { icon: 'building', text: 'Market Value Assessment', highlight: false }
  ];

  const documents = [
    { title: 'Identity & Address', items: ['Aadhaar', 'Passport', 'Voter ID', 'Utility Bill'] },
    { title: 'Income Proof', items: ['Salary Slips', 'ITR', 'Bank Statements'] },
    { title: 'Property Docs', items: ['Title Deed', 'Sale Agreement', 'Tax Receipts'] },
    { title: 'Business Proof', items: ['Registration Cert', 'GST Returns (Self-Employed)'] }
  ];

  const faqs = [
    { q: 'What can I use LAP for?', a: 'Business expansion, education, weddings, debt consolidation, or any personal need.' },
    { q: 'How much loan can I get?', a: 'Depends on property market value (LTV) and your repayment capacity.' },
    { q: 'Interest rates vs Personal Loan?', a: 'LAP rates are generally much lower than unsecured personal loans.' },
    { q: 'Can I use the property?', a: 'Yes, you continue to use/occupy the property; only papers are mortgaged.' },
    { q: 'What is LAP Overdraft?', a: 'Withdraw funds up to a limit and pay interest only on used amount.' },
    { q: 'Can I transfer my LAP?', a: 'Yes, Balance Transfer facility is available for better rates.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-4 text-slate-900">
      <Meta title="Loan Against Property | Loanzaar" description="Unlock your property's value." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </a>
        <h1 className="text-sm font-bold text-slate-900">Loan Against Property</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Lowest Interest Rates
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Unlock the value of <br/> <span className="text-indigo-100">your property.</span>
            </h2>
            <p className="text-indigo-50 text-sm mb-6 leading-relaxed">
              Get up to ₹5 Crore for business or personal needs.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> High LTV
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Check className="w-3 h-3 text-green-400" /> Overdraft Facility
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tabbed Content Container */}
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
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
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
                <h3 className="text-lg font-bold text-slate-900 mb-2">Overview</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A Loan Against Property (LAP) allows you to leverage your residential or commercial property to get high-value funds at lower interest rates.
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide">Why Choose LAP?</h3>
                <div className="grid grid-cols-2 gap-3">
                   {[
                     { title: 'High Amount', val: '₹5 Cr', sub: 'Max limit' },
                     { title: 'Low Interest', val: '9.50%', sub: 'Starting p.a.' },
                     { title: 'Tenure', val: '20 Years', sub: 'Long repayment' },
                     { title: 'Flexibility', val: 'Any Use', sub: 'Business/Personal' },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white p-3 rounded-lg border border-indigo-50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{stat.title}</p>
                        <p className="text-sm font-bold text-indigo-700">{stat.val}</p>
                     </div>
                   ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Eligibility</h3>
                <ul className="space-y-3">
                  {eligibilityCriteria.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {item.text}
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
                      <p className="text-sm font-bold text-indigo-400">₹{(emi * tenure).toLocaleString()}</p>
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
                    type="range" min="1000000" max="50000000" step="100000" 
                    value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Tenure</span>
                    <span className="text-slate-900">{tenure/12} Years</span>
                  </div>
                  <input 
                    type="range" min="60" max="240" step="12" 
                    value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="text-slate-900">{interestRate}%</span>
                  </div>
                  <input 
                    type="range" min="8" max="15" step="0.1" 
                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FEATURES TAB */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 gap-3">
              {features.map((feat) => (
                <div key={feat.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 text-indigo-600">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{feat.title}</h4>
                    <p className="text-xs text-slate-500 leading-tight mt-1">{feat.desc}</p>
                  </div>
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
                  Property documents (Title Deed, etc.) are mandatory for processing.
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
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
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
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">EMI Starts at</p>
            <p className="text-lg font-bold text-slate-900">₹{emi.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default LoanAgainstPropertyPage;