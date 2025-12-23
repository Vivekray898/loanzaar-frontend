'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, Shield, Clock, Gift, Layers, Eye, Wallet, TrendingUp,
  Briefcase
} from 'lucide-react';

const PersonalLoanFormPage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(12);
  const [tenure, setTenure] = useState(36);
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
    { id: 'new-customers', icon: Gift, title: 'New Customer Offers', desc: 'Special rates for first-time borrowers.', badge: 'Popular' },
    { id: 'variants', icon: Layers, title: '3 Unique Variants', desc: 'Standard, Flexi, or Secured options.' },
    { id: 'amount', icon: Wallet, title: 'Up to ₹40 Lakhs', desc: 'Substantial funding for major expenses.' },
    { id: 'tenure', icon: Clock, title: 'Flexible Tenure', desc: 'Repay comfortably over up to 84 months.' },
    { id: 'no-collateral', icon: Shield, title: 'No Collateral', desc: '100% unsecured loan with zero risk to assets.' },
    { id: 'transparency', icon: Eye, title: 'No Hidden Fees', desc: 'Complete transparency in all charges.' }
  ];

  const eligibilityCriteria = [
    { icon: 'user', text: 'Age: 21 - 60 years', highlight: false },
    { icon: 'wallet', text: 'Income: ₹15k/mo (Salaried/Self)', highlight: true },
    { icon: 'star', text: 'CIBIL Score: 650+', highlight: true },
    { icon: 'flag', text: 'Indian Citizen', highlight: false },
    { icon: 'briefcase', text: 'Stable Employment', highlight: false }
  ];

  const documents = [
    { title: 'Identity Proof', items: ['PAN Card', 'Aadhaar Card', 'Passport', 'Voter ID'] },
    { title: 'Address Proof', items: ['Aadhaar Card', 'Utility Bills', 'Rent Agreement'] },
    { title: 'Income Proof', items: ['3 Months Salary Slips', '6 Months Bank Statement'] },
    { title: 'Employment', items: ['Company ID Card', 'Appointment Letter'] }
  ];

  const faqs = [
    { q: 'What is a personal loan?', a: 'An unsecured loan for personal use like medical bills, travel, or renovation without collateral.' },
    { q: 'How much can I borrow?', a: 'You can borrow between ₹50,000 to ₹40 Lakhs depending on your eligibility.' },
    { q: 'Minimum credit score required?', a: 'A score of 650+ is recommended for quick approval and better interest rates.' },
    { q: 'Can I foreclose the loan?', a: 'Yes, foreclosure is allowed after payment of the first EMI, usually with a small fee.' },
    { q: 'How long does disbursal take?', a: 'Once approved, the amount is credited to your bank account within 24 to 48 hours.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-4 text-slate-900">
      <Meta title="Personal Loan | Loanzaar" description="Instant personal loans up to ₹40L." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </a>
        <h1 className="text-sm font-bold text-slate-900">Personal Loan</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Instant Approval
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Funds for your <br/> <span className="text-blue-100">next big step.</span>
            </h2>
            <p className="text-blue-50 text-sm mb-6 leading-relaxed">
              Get up to ₹40 Lakhs instantly. No collateral required.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 4.8/5 Rated
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Check className="w-3 h-3 text-green-400" /> 100% Digital
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
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">What is it?</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A personal loan is an unsecured loan you can use for any purpose—medical emergencies, travel, wedding, or home renovation.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wide">Eligibility Check</h3>
                <ul className="space-y-3">
                  {eligibilityCriteria.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-blue-800">
                      <Check className="w-4 h-4 text-blue-500 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Popular Uses</h3>
                <div className="grid grid-cols-2 gap-3">
                   {[
                     { title: 'Debt Consolidation', icon: Layers },
                     { title: 'Home Renovation', icon: Info }, // Using generic icon if 'Home' not imported
                     { title: 'Medical Emergency', icon: FileText },
                     { title: 'Travel & Wedding', icon: Gift }
                   ].map((use, i) => (
                     <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center gap-2">
                        <use.icon className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-medium text-slate-700">{use.title}</span>
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
                    <span className="text-slate-900">₹{(loanAmount/1000).toFixed(0)}k</span>
                  </div>
                  <input 
                    type="range" min="50000" max="4000000" step="10000" 
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
                    type="range" min="12" max="84" step="6" 
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
                    type="range" min="10" max="24" step="0.5" 
                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 text-blue-600">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {feat.title}
                      {feat.badge && <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded-md">{feat.badge}</span>}
                    </h4>
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
                  Keep soft copies of these documents ready for a paperless application.
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
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default PersonalLoanFormPage;