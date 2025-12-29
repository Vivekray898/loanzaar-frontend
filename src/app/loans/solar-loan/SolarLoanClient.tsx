'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Meta from '@/components/Meta';
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav';
import StructuredData from '@/components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '@/utils/schema';
// @ts-ignore
import SolarApplicationForm from '@/components/forms/loans/SolarApplicationForm';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, Sun, Leaf, Zap, Landmark, TrendingUp, IndianRupee, Shield, Settings,
  Minus, Plus, Calendar, Percent
} from 'lucide-react';

// --- 1. Extracted Calculator Component (Fixes Lag & Enhances UI) ---
const SolarLoanCalculator = ({ 
  loanAmount, setLoanAmount, 
  interestRate, setInterestRate, 
  tenure, setTenure, 
  emi, totalInterest, totalAmount 
}: any) => {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Results Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl text-center shadow-lg">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Monthly Installment</p>
        <p className="text-4xl font-bold">₹{emi.toLocaleString()}</p>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400">Total Interest</p>
              <p className="text-sm font-bold text-yellow-400">₹{totalInterest.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Total Amount</p>
              <p className="text-sm font-bold text-green-400">₹{totalAmount.toLocaleString()}</p>
            </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-6 bg-white md:bg-transparent p-4 md:p-0 rounded-xl border md:border-none border-slate-200">
        
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-slate-700">Loan Amount</label>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
               <button onClick={() => setLoanAmount((prev: number) => Math.max(50000, prev - 10000))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Minus className="w-3 h-3"/></button>
               <div className="px-2 py-1 flex items-center border-x border-slate-100 bg-slate-50 min-w-[80px] justify-center">
                  <IndianRupee className="w-3 h-3 text-slate-400 mr-1" />
                  <input 
                    type="number" 
                    value={loanAmount} 
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-24 text-center text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
               </div>
               <button onClick={() => setLoanAmount((prev: number) => Math.min(10000000, prev + 10000))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          <input 
            type="range" min="50000" max="10000000" step="10000" 
            value={loanAmount} 
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-700 transition-all"
          />
          {/* Quick Select Chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
             {[200000, 500000, 1000000, 2500000].map(val => (
               <button 
                 key={val}
                 onClick={() => setLoanAmount(val)}
                 className={`px-3 py-1 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${loanAmount === val ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-600 hover:border-green-200'}`}
               >
                 ₹{(val/100000).toFixed(1)}L
               </button>
             ))}
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-slate-700">Tenure (Months)</label>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
               <button onClick={() => setTenure((prev: number) => Math.max(12, prev - 6))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Minus className="w-3 h-3"/></button>
               <div className="px-2 py-1 flex items-center border-x border-slate-100 bg-slate-50 min-w-[60px] justify-center">
                  <Calendar className="w-3 h-3 text-slate-400 mr-1" />
                  <span className="text-sm font-bold text-slate-800">{tenure}</span>
                  <span className="text-xs text-slate-400 ml-1">mo</span>
               </div>
               <button onClick={() => setTenure((prev: number) => Math.min(84, prev + 6))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          <input 
            type="range" min="12" max="84" step="6" 
            value={tenure} 
            onChange={(e) => setTenure(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-700 transition-all"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>12 Mo</span>
            <span>84 Mo</span>
          </div>
        </div>

        {/* Interest */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-slate-700">Interest Rate</label>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
               <button onClick={() => setInterestRate((prev: number) => Math.max(7, +(prev - 0.25).toFixed(2)))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Minus className="w-3 h-3"/></button>
               <div className="px-2 py-1 flex items-center border-x border-slate-100 bg-slate-50 min-w-[60px] justify-center">
                  <input 
                    type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-12 text-center text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
                  <span className="text-xs text-slate-400 ml-1">%</span>
               </div>
               <button onClick={() => setInterestRate((prev: number) => Math.min(16, +(prev + 0.25).toFixed(2)))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          <input 
            type="range" min="7" max="16" step="0.25" 
            value={interestRate} 
            onChange={(e) => setInterestRate(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-700 transition-all"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>7%</span>
            <span>16%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SolarLoanClient = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(9.5);
  const [tenure, setTenure] = useState(60);

  // --- EMI Calculation Logic ---
  const emi = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = tenure;
    if (loanAmount > 0 && r > 0 && n > 0) {
      const e = loanAmount * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
      return Math.round(e);
    }
    return 0;
  }, [loanAmount, interestRate, tenure]);

  const totalAmount = useMemo(() => emi * tenure, [emi, tenure]);
  const totalInterest = useMemo(() => totalAmount - loanAmount, [totalAmount, loanAmount]);

  const handleApplyClick = () => setIsModalOpen(true);

  // Smooth Scroll Handler
  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Data
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
    <div className="min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0 text-slate-900">
      
      {/* Slider Styles */}
      <style jsx global>{`
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #16a34a; /* green-600 */
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.35);
          transition: transform 120ms cubic-bezier(.2,.8,.2,1), box-shadow 120ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        input[type="range"]::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #16a34a;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.35);
          transition: transform 120ms cubic-bezier(.2,.8,.2,1), box-shadow 120ms ease;
        }
        input[type="range"]:active::-webkit-slider-thumb {
          transform: scale(1.06);
          box-shadow: 0 6px 16px rgba(22, 163, 74, 0.35);
        }
      `}</style>

      <Meta title="Solar Loan | Loanzaar" description="Finance your rooftop solar installation." />
      
      {/* 1. Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" /> Back
          </BackButton>
          <h1 className="text-base md:text-lg font-bold text-slate-900">Solar Loan</h1>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">

        {/* 2. Hero Section */}
        <section id="overview" className="mb-8">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-green-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                  Go Green Financing
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Own your Power <br className="hidden md:block"/> <span className="text-green-100">Zero Bills.</span>
                </h2>
                <p className="text-green-50 text-sm md:text-lg mb-6 leading-relaxed max-w-lg">
                  Finance rooftop solar with savings-linked EMIs. PM-KUSUM & Surya Ghar subsidy support available.
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Leaf className="w-4 h-4 text-lime-400" /> PM-KUSUM
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Fast Approval
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Sticky Navigation */}
        <div className="sticky top-16 z-40 bg-slate-50/95 backdrop-blur-sm pt-2 pb-4 border-b border-slate-200 mb-8">
          <div className="flex overflow-x-auto gap-2 md:gap-4 pb-2 scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'calculator', label: 'Calculator', icon: Calculator },
              { id: 'features', label: 'Features', icon: Star },
              { id: 'docs', label: 'Documents', icon: FileText },
              { id: 'faqs', label: 'FAQs', icon: HelpCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300
                  ${activeTab === tab.id 
                    ? 'bg-green-600 text-white shadow-md shadow-green-200' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}
                `}
              >
                <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* OVERVIEW CONTENT */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  What is a Solar Loan?
                </h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify">
                  A Solar Loan finances the installation of rooftop panels. You pay via easy EMIs, often funded by the savings on your electricity bill. This helps you transition to renewable energy with zero upfront cost.
                </p>
              </div>

              {/* Why Switch Grid */}
              <div className="bg-green-50/80 p-6 rounded-2xl border border-green-100">
                  <h3 className="text-sm font-bold text-green-900 mb-4 uppercase tracking-wide">Why Switch to Solar?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { title: 'Savings', val: '90%', sub: 'Lower Bills' },
                      { title: 'ROI', val: '3-5 Yrs', sub: 'Payback Period' },
                      { title: 'Value', val: '+15%', sub: 'Property Value' },
                      { title: 'Earth', val: 'Zero', sub: 'Carbon Footprint' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-green-50 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">{stat.title}</p>
                        <p className="text-sm md:text-base font-bold text-green-700 mt-1">{stat.val}</p>
                        <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">{stat.sub}</p>
                      </div>
                    ))}
                  </div>
              </div>

              {/* Eligibility */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Eligibility Programs</h3>
                <ul className="space-y-3">
                  {eligibilityCriteria.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CALCULATOR SECTION (Mobile) */}
            <div id="calculator" className="lg:hidden scroll-mt-32 border-t border-slate-200 pt-8">
               <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" /> EMI Calculator
               </h3>
               {/* Use the standalone component */}
               <SolarLoanCalculator 
                 loanAmount={loanAmount} setLoanAmount={setLoanAmount}
                 interestRate={interestRate} setInterestRate={setInterestRate}
                 tenure={tenure} setTenure={setTenure}
                 emi={emi} totalInterest={totalInterest} totalAmount={totalAmount}
               />
            </div>

            {/* FEATURES SECTION */}
            <div id="features" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Features & Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feat) => (
                  <div key={feat.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shadow-inner shrink-0 text-green-600">
                      <feat.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{feat.title}</h4>
                      <p className="text-sm text-slate-500 leading-snug mt-1.5">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DOCUMENTS SECTION */}
            <div id="docs" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-slate-700" /> Required Documents
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {documents.map((section, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                      {section.title}
                    </div>
                    <div className="p-5 bg-white grid grid-cols-1 gap-3">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                          <Check className="w-4 h-4 text-green-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Application Steps */}
              <div className="mt-8">
                <h4 className="text-lg font-bold text-slate-900 mb-4">How to Apply?</h4>
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

            {/* FAQS SECTION */}
            <div id="faqs" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-slate-700" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((item, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-green-300 transition-colors">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="w-full flex justify-between items-center p-5 text-left"
                    >
                      <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180 text-green-600' : ''}`} />
                    </button>
                    {activeFaq === i && (
                      <div className="px-5 pb-5 pt-0 bg-white">
                        <div className="h-px bg-slate-100 w-full mb-3"></div>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Sticky Sidebar (Calculator) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
             <div className="sticky top-32 space-y-6">
                <div id="calculator" className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                   <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-green-600" /> EMI Calculator
                   </h3>
                   {/* Use the new Component */}
                   <SolarLoanCalculator 
                     loanAmount={loanAmount} setLoanAmount={setLoanAmount}
                     interestRate={interestRate} setInterestRate={setInterestRate}
                     tenure={tenure} setTenure={setTenure}
                     emi={emi} totalInterest={totalInterest} totalAmount={totalAmount}
                   />
                </div>
                
                {/* Trust Badge */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600">
                      <Shield className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Subsidy Support</p>
                      <p className="text-xs text-slate-500">Expert Guidance</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>

      {/* 5. Sticky Bottom Action Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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

      {isModalOpen && (
        <SolarApplicationForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          loanType="Solar Loan"
          loanCategory="business"
        />
      )}

      <BottomNav />
    </div>
  );
};

export default SolarLoanClient;