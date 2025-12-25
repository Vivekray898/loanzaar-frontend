'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import BackButton from '../components/BackButton';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, Home, Hammer, Expand, Paintbrush, Globe, Wallet, Briefcase, Clock
} from 'lucide-react';

const HomeLoanPage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(2000000);
  const [interestRate, setInterestRate] = useState(7);
  const [tenure, setTenure] = useState(240);
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
    { id: 'rates', icon: Star, title: 'Attractive Rates', desc: 'Competitive rates starting from 8.50%.' },
    { id: 'docs', icon: FileText, title: 'Minimal Docs', desc: 'Streamlined process for quick approval.' },
    { id: 'tenure', icon: Clock, title: '30-Year Tenure', desc: 'Lower EMIs with long repayment options.' },
    { id: 'construction', icon: Hammer, title: 'Construction Loan', desc: 'Funds to build on your own plot.' },
    { id: 'extension', icon: Expand, title: 'Extension Loan', desc: 'Add a floor or room to existing home.' },
    { id: 'improvement', icon: Paintbrush, title: 'Improvement Loan', desc: 'Renovate or furnish your home.' },
    { id: 'nri', icon: Globe, title: 'NRI Home Loan', desc: 'Special options for Non-Resident Indians.' }
  ];

  const eligibilityCriteria = [
    { icon: 'user', text: 'Age: 21 - 58 (Salaried) / 65 (Self)', highlight: false },
    { icon: 'wallet', text: 'Income: ₹10k/mo (Salaried)', highlight: true },
    { icon: 'briefcase', text: 'Exp: 2-3 Years Stability', highlight: false },
    { icon: 'star', text: 'Credit Score: 750+', highlight: true },
    { icon: 'clock', text: 'Max Age at Maturity: 65/70', highlight: false }
  ];

  const documents = [
    { title: 'Salaried', items: ['Form 16', 'ID Card', '3 Months Salary Slips', '6 Months Bank Stmt'] },
    { title: 'Self-Employed', items: ['PAN/Trade License', 'Business Proof', '3 Years ITR/P&L', '6 Months Bank Stmt'] },
    { title: 'NRI', items: ['Passport/Visa', 'Overseas Bank Stmt', 'Power of Attorney', 'Employment Contract'] }
  ];

  const faqs = [
    { q: 'What is a home loan?', a: 'Secured loan to buy/build property where the property itself is collateral.' },
    { q: 'How do I qualify?', a: 'Age 21-65, stable income, and credit score 750+ are key factors.' },
    { q: 'Can I prepay?', a: 'Yes, floating rate loans usually have zero prepayment charges.' },
    { q: 'Is 100% funding possible?', a: 'Rarely. Most lenders fund 75-90% of property value.' },
    { q: 'Max loan amount?', a: 'Depends on income & property value. Usually 60x monthly income.' },
    { q: 'Co-applicants?', a: 'Spouse, parents, or siblings can be co-applicants to increase eligibility.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-14 text-slate-900">
      <Meta title="Home Loan | Loanzaar" description="Lowest interest rates on home loans." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </BackButton>
        <h1 className="text-sm font-bold text-slate-900">Home Loan</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Lowest Rates
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Own your <br/> <span className="text-emerald-100">Dream Home.</span>
            </h2>
            <p className="text-emerald-50 text-sm mb-6 leading-relaxed">
              Loans up to ₹5 Cr with 30-year tenure. Minimal paperwork.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 8.50%* p.a.
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Check className="w-3 h-3 text-green-400" /> PMAY Benefit
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
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
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
                  A home loan is your gateway to purchasing, constructing, or renovating a property with flexible repayment options up to 30 years.
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <h3 className="text-sm font-bold text-emerald-900 mb-3 uppercase tracking-wide">Key Highlights</h3>
                <ul className="space-y-3">
                  {eligibilityCriteria.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Loan Types</h3>
                <div className="grid grid-cols-2 gap-3">
                   {[
                     { title: 'New Purchase', icon: Home },
                     { title: 'Construction', icon: Hammer },
                     { title: 'Renovation', icon: Paintbrush },
                     { title: 'Extension', icon: Expand }
                   ].map((type, i) => (
                     <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center gap-2">
                        <type.icon className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-medium text-slate-700">{type.title}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* EMI CALCULATOR TAB */}
          {activeTab === 'emi' && (
            <div className="space-y-8">
              <div className="bg-slate-900 text-white p-6 rounded-2xl text-center shadow-lg">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Monthly Installment</p>
                <p className="text-4xl font-bold">₹{emi.toLocaleString()}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
                   <div>
                      <p className="text-[10px] text-slate-400">Total Interest</p>
                      <p className="text-sm font-bold text-yellow-400">₹{(emi * tenure - loanAmount).toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-400">Total Amount</p>
                      <p className="text-sm font-bold text-emerald-400">₹{(emi * tenure).toLocaleString()}</p>
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
                    type="range" min="500000" max="50000000" step="50000" 
                    value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Tenure</span>
                    <span className="text-slate-900">{tenure/12} Years</span>
                  </div>
                  <input 
                    type="range" min="60" max="360" step="12" 
                    value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="text-slate-900">{interestRate}%</span>
                  </div>
                  <input 
                    type="range" min="6" max="15" step="0.1" 
                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
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
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 text-emerald-600">
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
                  Documents vary based on applicant type (Salaried vs Self-Employed).
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
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
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
                    <div className="px-4 pb-14 pt-0 bg-white">
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
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default HomeLoanPage;