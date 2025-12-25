'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import BackButton from '../components/BackButton';
import { submitLoanApplication } from '../config/api';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, RefreshCw, DollarSign, TrendingUp, Clock, Settings, Target,
  BarChart, Calendar, Briefcase, User, Shield
} from 'lucide-react';

const CarRefinanceFormPage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(9);
  const [tenure, setTenure] = useState(60);
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
    { title: 'Lower Payments', icon: DollarSign, desc: 'Reduce monthly EMI burden.' },
    { title: 'Max Funding', icon: TrendingUp, desc: 'Up to 250% valuation funding.' },
    { title: 'Shorten Term', icon: Clock, desc: 'Pay off loan faster.' },
    { title: 'Switch Lender', icon: RefreshCw, desc: 'Move to better terms.' },
    { title: 'Adjust Terms', icon: Settings, desc: 'Tailor to current needs.' },
    { title: 'Debt Free', icon: Target, desc: 'Become debt-free sooner.' }
  ];

  const eligibilityCriteria = [
    { icon: 'calendar', text: 'Age: 21 - 65 Years', highlight: false },
    { icon: 'dollar-sign', text: 'Income: Min ₹2.5L / year', highlight: true },
    { icon: 'star', text: 'Score: 680+ Credit Score', highlight: true },
    { icon: 'check-circle', text: 'Paid EMIs: Min 12 EMIs paid', highlight: true },
    { icon: 'briefcase', text: 'Employment: 2 Years Stability', highlight: false }
  ];

  const documents = [
    { title: 'KYC Docs', items: ['PAN', 'Aadhaar', 'License'] },
    { title: 'Income Proof', items: ['ITR/Slips', 'Bank Statement'] },
    { title: 'Car Docs', items: ['RC Copy', 'Insurance Copy'] },
    { title: 'Loan Track', items: ['SOA of current loan'] }
  ];

  const faqs = [
    { q: 'What is car refinancing?', a: 'Replacing your current car loan with a new one for better terms like lower interest or tenure.' },
    { q: 'Why refinance?', a: 'To lower monthly payments, reduce interest rate, or shorten loan tenure.' },
    { q: 'Can any car be refinanced?', a: 'Generally yes, if it has equity and is less than 15 years old at loan maturity.' },
    { q: 'Does it affect credit score?', a: 'Temporarily dips due to inquiry, but timely payments improve it long-term.' },
    { q: 'Are there fees?', a: 'Yes, processing fees, valuation charges, and RTO charges may apply.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-14 text-slate-900">
      <Meta title="Car Refinance | Loanzaar" description="Lower your car EMI today." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </BackButton>
        <h1 className="text-sm font-bold text-slate-900">Car Refinance</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-6 text-white shadow-xl shadow-red-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Reduce EMI
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Stop Overpaying <br/> <span className="text-red-100">for your Car.</span>
            </h2>
            <p className="text-red-50 text-sm mb-6 leading-relaxed">
              Refinance now to lower rates and unlock cash equity.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <RefreshCw className="w-3 h-3 text-cyan-400" /> Easy Switch
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-3 h-3 text-green-400" /> Max Funding
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
                  ? 'bg-red-50 text-red-600 border border-red-100' 
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
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Car refinance replaces your existing loan with a new one offering better terms, like lower interest rates or adjusted tenure.
                </p>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                      <h4 className="text-xs font-bold text-red-800 mb-1">Lower Rates</h4>
                      <p className="text-[10px] text-red-600 leading-tight">Save on interest.</p>
                   </div>
                   <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                      <h4 className="text-xs font-bold text-red-800 mb-1">Cash Out</h4>
                      <p className="text-[10px] text-red-600 leading-tight">Top-up available.</p>
                   </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Eligibility</h3>
                <ul className="space-y-2">
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
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">New Monthly EMI</p>
                <p className="text-4xl font-bold">₹{emi.toLocaleString()}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
                   <div>
                      <p className="text-[10px] text-slate-400">Total Interest</p>
                      <p className="text-sm font-bold text-yellow-400">₹{(emi * tenure - loanAmount).toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-400">Total Amount</p>
                      <p className="text-sm font-bold text-red-400">₹{(emi * tenure).toLocaleString()}</p>
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
                    type="range" min="100000" max="4700000" step="50000" 
                    value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Tenure</span>
                    <span className="text-slate-900">{tenure} Months</span>
                  </div>
                  <input 
                    type="range" min="12" max="72" step="6" 
                    value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="text-slate-900">{interestRate}%</span>
                  </div>
                  <input 
                    type="range" min="7" max="15" step="0.1" 
                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FEATURES TAB */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-2 gap-3">
              {features.map((feat) => (
                <div key={feat.title} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-red-600">
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
                  Existing loan track record is crucial for approval.
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
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
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
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">New EMI</p>
            <p className="text-lg font-bold text-slate-900">₹{emi.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-200"
          >
            Refinance Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default CarRefinanceFormPage;