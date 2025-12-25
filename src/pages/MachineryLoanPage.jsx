'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import BackButton from '../components/BackButton';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, Settings, TrendingUp, IndianRupee, Layers, Shield, Zap, Briefcase, RefreshCw, ShoppingCart, Building
} from 'lucide-react';

const MachineryLoanPage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [interestRate, setInterestRate] = useState(12);
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
    { id: 'wide-range', icon: Layers, title: 'Wide Range', desc: 'Various machinery loan products.' },
    { id: 'high-amount', icon: IndianRupee, title: 'High Amount', desc: '₹5 Lakh to ₹5 Crore.' },
    { id: 'tenure', icon:  Settings, title: 'Flexible Tenure', desc: '12 to 60 Months.' },
    { id: 'docs', icon: FileText, title: 'Minimal Docs', desc: 'Digital application process.' },
    { id: 'financing', icon: TrendingUp, title: 'High Financing', desc: 'Up to 100% of equipment price.' },
    { id: 'rates', icon: Star, title: 'Competitive Rates', desc: 'Starting from 12%.' },
    { id: 'collateral', icon: Shield, title: 'No Collateral', desc: 'For many loan products.' },
    { id: 'speed', icon: Zap, title: 'Quick Disbursal', desc: 'Fast processing.' },
    { id: 'repayment', icon: RefreshCw, title: 'Custom Repayment', desc: 'Flexible options.' }
  ];

  const financingOptions = [
    { title: 'Medical Equipment', desc: 'Healthcare machinery.' },
    { title: 'Construction Machinery', desc: 'Heavy equipment.' },
    { title: 'Manufacturing Equipment', desc: 'Production facilities.' },
    { title: 'Farm Machinery', desc: 'Agricultural equipment.' },
    { title: 'Aviation Equipment', desc: 'Specialized financing.' },
    { title: 'Used Machinery', desc: 'Pre-owned options.' },
    { title: 'Loan Against Machinery', desc: 'Refinance existing assets.' }
  ];

  const eligibilityCriteria = [
    { icon: 'user', text: 'Age: 21 - 65 Years', highlight: false },
    { icon: 'star', text: 'CIBIL Score: 650+', highlight: true },
    { icon: 'briefcase', text: 'Business Vintage: 3+ Years', highlight: true }
  ];

  const documents = [
    { title: 'KYC Docs', items: ['Aadhaar', 'PAN', 'License', 'Passport'] },
    { title: 'Income Proof', items: ['3 Years ITR', '6 Months Bank Stmt'] },
    { title: 'Business Proof', items: ['Ownership Documents', 'Registration'] },
    { title: 'Purchase Details', items: ['Proforma Invoice', 'Quotation'] }
  ];

  const faqs = [
    { q: 'Interest rate for machinery loan?', a: 'Starts from 12%, depends on profile.' },
    { q: 'Can machinery be collateral?', a: 'Yes, often results in lower rates.' },
    { q: 'MSME loan rates?', a: 'Competitive, starting 11-13%.' },
    { q: 'Who offers these loans?', a: 'Major banks like HDFC, ICICI, and NBFCs.' },
    { q: 'Refinancing available?', a: 'Yes, most lenders offer refinancing.' },
    { q: 'Eligibility criteria?', a: 'Age 21-65, 3 yrs vintage, 650+ CIBIL.' },
    { q: 'Secured or Unsecured?', a: 'Can be both, depends on lender.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-14 text-slate-900">
      <Meta title="Machinery Loan | Loanzaar" description="Finance industrial equipment." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </BackButton>
        <h1 className="text-sm font-bold text-slate-900">Machinery Loan</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Equipment Finance
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Power up your <br/> <span className="text-orange-100">Production.</span>
            </h2>
            <p className="text-orange-50 text-sm mb-6 leading-relaxed">
              Up to 100% financing for new & used machinery.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> MSME Approved
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Check className="w-3 h-3 text-white" /> Fast Approval
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
                  ? 'bg-orange-50 text-orange-600 border border-orange-100' 
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
                  A machinery loan helps businesses buy new machines or upgrade existing equipment without straining working capital.
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h3 className="text-sm font-bold text-orange-900 mb-3 uppercase tracking-wide">Key Benefits</h3>
                <div className="grid grid-cols-2 gap-3">
                   {[
                     { title: 'Financing', val: '100%', sub: 'of Equip. Cost' },
                     { title: 'Amount', val: '₹5 Cr', sub: 'Maximum' },
                     { title: 'Tenure', val: '5 Years', sub: 'Flexible' },
                     { title: 'Collateral', val: 'None*', sub: 'On select loans' },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white p-3 rounded-lg border border-orange-50 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{stat.title}</p>
                        <p className="text-sm font-bold text-orange-700">{stat.val}</p>
                        <p className="text-[10px] text-slate-500">{stat.sub}</p>
                     </div>
                   ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Financing Options</h3>
                <ul className="space-y-2">
                  {financingOptions.map((opt, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Settings className="w-4 h-4 text-orange-500 shrink-0" />
                      <div>
                        <span className="font-semibold block">{opt.title}</span>
                        <span className="text-xs text-slate-500">{opt.desc}</span>
                      </div>
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
                      <p className="text-sm font-bold text-orange-400">₹{(emi * tenure).toLocaleString()}</p>
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
                    type="range" min="500000" max="50000000" step="100000" 
                    value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="text-slate-900">{interestRate}%</span>
                  </div>
                  <input 
                    type="range" min="10" max="20" step="0.5" 
                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
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
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-orange-600">
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
                  Proforma invoice of machinery is mandatory for application.
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
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
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
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-200"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default MachineryLoanPage;