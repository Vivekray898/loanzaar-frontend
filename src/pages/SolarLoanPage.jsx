'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, Sun, Leaf, Zap, Landmark, TrendingUp, IndianRupee, Shield, Settings
} from 'lucide-react';

const SolarLoanPage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(10);
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
    { id: 'comprehensive', icon: Sun, title: 'All-Inclusive', desc: 'Covers panels + installation cost.' },
    { id: 'amount', icon: IndianRupee, title: 'High Amount', desc: '₹60 Lakhs to ₹3 Crores.' },
    { id: 'rates', icon: TrendingUp, title: 'Low Interest', desc: 'Starting 7.99% flat rate.' },
    { id: 'tenure', icon:  Settings, title: 'Flexible Tenure', desc: '12 to 84 months repayment.' },
    { id: 'speed', icon: Zap, title: 'Quick Approval', desc: 'Score-based fast processing.' },
    { id: 'docs', icon: FileText, title: 'Minimal Docs', desc: 'Digital application process.' },
    { id: 'collateral', icon: Shield, title: 'No Collateral', desc: 'For most loan cases.' },
    { id: 'emi', icon: Calculator, title: 'Smart EMI', desc: 'EMI lower than electricity bill.' }
  ];

  const eligibilityCriteria = [
    { icon: 'landmark', text: 'Avg Bank Balance Program: Max EMI = 50% of avg balance', highlight: true },
    { icon: 'file-text', text: 'GST Program: Based on 12-month turnover', highlight: true },
    { icon: 'sun', text: 'Savings Program: Add energy savings to income for higher eligibility', highlight: true }
  ];

  const documents = [
    { title: 'Company KYC', items: ['GST Cert', 'Shop Act', 'Udyam Cert'] },
    { title: 'Applicant KYC', items: ['PAN Card', 'Aadhaar', 'Electricity Bill'] },
    { title: 'Financials', items: ['1 Year Bank Stmt', '2 Years ITR'] }
  ];

  const faqs = [
    { q: 'Can I install on EMI?', a: 'Yes, pay for rooftop solar in monthly installments.' },
    { q: 'Cost of system?', a: '3kW is ₹2-3L. Larger systems cost more.' },
    { q: 'Interest rates?', a: '7.99% to 12.5% depending on profile.' },
    { q: 'Subsidy available?', a: 'Yes, PM-KUSUM & Surya Ghar schemes apply.' },
    { q: 'Savings start when?', a: 'Immediately within 3-6 months of install.' },
    { q: 'Prepayment allowed?', a: 'Yes, usually with minimal or zero charges.' }
  ];

  const howToApplySteps = [
    { title: 'Visit Website', desc: 'Go to Solar Loan section.' },
    { title: 'Start Application', desc: 'Click Apply Now.' },
    { title: 'Sign In', desc: 'Verify mobile OTP.' },
    { title: 'Fill Details', desc: 'Complete KYC form.' },
    { title: 'Submit', desc: 'Select expert & done.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      <Meta title="Solar Loan | Loanzaar" description="Finance your rooftop solar installation." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </a>
        <h1 className="text-sm font-bold text-slate-900">Solar Loan</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-6 text-white shadow-xl shadow-green-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Go Green Financing
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Own your Power <br/> <span className="text-green-100">Zero Bills.</span>
            </h2>
            <p className="text-green-50 text-sm mb-6 leading-relaxed">
              Finance rooftop solar with savings-linked EMIs.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Leaf className="w-3 h-3 text-lime-400" /> PM-KUSUM Subsidy
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Fast Approval
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
                  ? 'bg-green-50 text-green-600 border border-green-100' 
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
                  A Solar Loan finances the installation of rooftop panels. You pay via easy EMIs, often funded by the savings on your electricity bill.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h3 className="text-sm font-bold text-green-900 mb-3 uppercase tracking-wide">Why Switch?</h3>
                <div className="grid grid-cols-2 gap-3">
                   {[
                     { title: 'Savings', val: '90%', sub: 'Lower Bills' },
                     { title: 'ROI', val: '3-5 Yrs', sub: 'Payback Period' },
                     { title: 'Value', val: '+15%', sub: 'Property Value' },
                     { title: 'Earth', val: 'Zero', sub: 'Carbon Footprint' },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white p-3 rounded-lg border border-green-50 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{stat.title}</p>
                        <p className="text-sm font-bold text-green-700">{stat.val}</p>
                        <p className="text-[10px] text-slate-500">{stat.sub}</p>
                     </div>
                   ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Eligibility Programs</h3>
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
                      <p className="text-sm font-bold text-green-400">₹{(emi * tenure).toLocaleString()}</p>
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
                    type="range" min="600000" max="30000000" step="100000" 
                    value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="text-slate-900">{interestRate}%</span>
                  </div>
                  <input 
                    type="range" min="7" max="15" step="0.25" 
                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
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
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-green-600">
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
                  Basic KYC and 1-year financial records required.
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
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Application Steps</h4>
                <div className="space-y-4 pl-2 border-l-2 border-slate-100 ml-2">
                  {howToApplySteps.map((step, i) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-green-500 rounded-full"></div>
                      <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
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
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-200"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default SolarLoanPage;