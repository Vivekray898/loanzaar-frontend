'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Meta from '@/components/Meta';
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav';
// @ts-ignore
import HomeApplicationForm from '@/components/forms/loans/HomeApplicationForm'
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, Home, Hammer, Expand, Paintbrush, Globe, Clock, Shield,
  Minus, Plus, IndianRupee, Calendar, Percent
} from 'lucide-react';

// --- 1. Extracted Calculator Component (Fixes Lag & Improves UI) ---
const HomeLoanCalculator = ({ 
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
              <p className="text-sm font-bold text-emerald-400">₹{totalAmount.toLocaleString()}</p>
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
               <button onClick={() => setLoanAmount((prev: number) => Math.max(500000, prev - 50000))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Minus className="w-3 h-3"/></button>
               <div className="px-2 py-1 flex items-center border-x border-slate-100 bg-slate-50 min-w-[80px] justify-center">
                  <IndianRupee className="w-3 h-3 text-slate-400 mr-1" />
                  <input 
                    type="number" 
                    value={loanAmount} 
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-24 text-center text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
               </div>
               <button onClick={() => setLoanAmount((prev: number) => Math.min(50000000, prev + 50000))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          <input 
            type="range" min="500000" max="50000000" step="50000" 
            value={loanAmount} 
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all"
          />
          {/* Quick Select Chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
             {[2000000, 5000000, 7500000, 10000000].map(val => (
               <button 
                 key={val}
                 onClick={() => setLoanAmount(val)}
                 className={`px-3 py-1 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${loanAmount === val ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'}`}
               >
                 ₹{(val/100000).toFixed(1)}L
               </button>
             ))}
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-slate-700">Tenure (Years)</label>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
               <button onClick={() => setTenure((prev: number) => Math.max(60, prev - 12))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Minus className="w-3 h-3"/></button>
               <div className="px-2 py-1 flex items-center border-x border-slate-100 bg-slate-50 min-w-[60px] justify-center">
                  <Calendar className="w-3 h-3 text-slate-400 mr-1" />
                  <span className="text-sm font-bold text-slate-800">{Math.floor(tenure / 12)}</span>
                  <span className="text-xs text-slate-400 ml-1">yr</span>
               </div>
               <button onClick={() => setTenure((prev: number) => Math.min(360, prev + 12))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          <input 
            type="range" min="60" max="360" step="12" 
            value={tenure} 
            onChange={(e) => setTenure(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all"
          />
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
             {[120, 180, 240, 300, 360].map(val => (
               <button 
                 key={val}
                 onClick={() => setTenure(val)}
                 className={`px-3 py-1 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${tenure === val ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'}`}
               >
                 {val/12} Years
               </button>
             ))}
          </div>
        </div>

        {/* Interest */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-slate-700">Interest Rate</label>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
               <button onClick={() => setInterestRate((prev: number) => Math.max(6, +(prev - 0.1).toFixed(2)))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Minus className="w-3 h-3"/></button>
               <div className="px-2 py-1 flex items-center border-x border-slate-100 bg-slate-50 min-w-[60px] justify-center">
                  <input 
                    type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-12 text-center text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
                  <span className="text-xs text-slate-400 ml-1">%</span>
               </div>
               <button onClick={() => setInterestRate((prev: number) => Math.min(15, +(prev + 0.1).toFixed(2)))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          <input 
            type="range" min="6" max="15" step="0.1" 
            value={interestRate} 
            onChange={(e) => setInterestRate(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>6%</span>
            <span>15%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeLoanClient = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(2000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(240); // 20 years in months

  // --- Optimized EMI Calculation ---
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

  const handleApplyClick = () => {
    setIsModalOpen(true);
  };

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

  // --- Data ---
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
    <div className="min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0 text-slate-900">
      
      {/* Smooth slider styles */}
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
          background: #059669; /* emerald-600 */
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(5, 150, 105, 0.35);
          transition: transform 120ms cubic-bezier(.2,.8,.2,1), box-shadow 120ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        input[type="range"]::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #059669;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(5, 150, 105, 0.35);
          transition: transform 120ms cubic-bezier(.2,.8,.2,1), box-shadow 120ms ease;
        }
        input[type="range"]:active::-webkit-slider-thumb {
          transform: scale(1.06);
          box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35);
        }
      `}</style>

      <Meta title="Home Loan | Loanzaar" description="Lowest interest rates on home loans." />
      
      {/* 1. Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" /> Back
          </BackButton>
          <h1 className="text-base md:text-lg font-bold text-slate-900">Home Loan</h1>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">

        {/* 2. Hero Section */}
        <section id="overview" className="mb-8">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                  Lowest Interest Rates
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Own your <span className="text-emerald-100">Dream Home.</span>
                </h2>
                <p className="text-emerald-50 text-sm md:text-lg mb-6 leading-relaxed max-w-lg">
                  Loans up to ₹5 Cr with 30-year tenure. Minimal paperwork. PMAY Benefits available.
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 8.50%* p.a.
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Check className="w-4 h-4 text-green-400" /> Digital Process
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Navigation Bar */}
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
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
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
                  What is a Home Loan?
                </h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify">
                  A home loan is a secured loan used to purchase a property by offering it as collateral. Home loans offer high-value funding at economical interest rates and for long tenures. They are repaid through EMIs.
                </p>
              </div>

              {/* Eligibility Box */}
              <div className="bg-emerald-50/80 p-6 rounded-2xl border border-emerald-100">
                <h3 className="text-sm font-bold text-emerald-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Eligibility Criteria
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {eligibilityCriteria.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-emerald-100">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.highlight ? 'bg-green-100 text-green-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {item.highlight ? <Check className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loan Types Grid */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Types of Home Loans</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { title: 'New Purchase', icon: Home },
                      { title: 'Construction', icon: Hammer },
                      { title: 'Renovation', icon: Paintbrush },
                      { title: 'Extension', icon: Expand }
                    ].map((type, i) => (
                      <div key={i} className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                          <type.icon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-slate-700">{type.title}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* CALCULATOR SECTION (Mobile) */}
            <div id="calculator" className="lg:hidden scroll-mt-32 border-t border-slate-200 pt-8">
               <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" /> EMI Calculator
               </h3>
               {/* Use the standalone component */}
               <HomeLoanCalculator 
                 loanAmount={loanAmount} setLoanAmount={setLoanAmount}
                 interestRate={interestRate} setInterestRate={setInterestRate}
                 tenure={tenure} setTenure={setTenure}
                 emi={emi} totalInterest={totalInterest} totalAmount={totalAmount}
               />
            </div>

            {/* FEATURES SECTION */}
            <div id="features" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feat) => (
                  <div key={feat.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shadow-inner shrink-0 text-emerald-600">
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
              
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 mb-6">
                <Info className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-sm text-orange-800 leading-relaxed font-medium">
                  Co-applicant documents are also required if you are applying jointly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((section, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                      {section.title}
                    </div>
                    <div className="p-5 bg-white grid grid-cols-1 gap-3">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                          <Check className="w-4 h-4 text-emerald-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQS SECTION */}
            <div id="faqs" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-slate-700" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((item, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-emerald-300 transition-colors">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="w-full flex justify-between items-center p-5 text-left"
                    >
                      <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180 text-emerald-600' : ''}`} />
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
                      <Calculator className="w-5 h-5 text-emerald-600" /> EMI Calculator
                   </h3>
                   {/* Use the standalone component */}
                   <HomeLoanCalculator 
                     loanAmount={loanAmount} setLoanAmount={setLoanAmount}
                     interestRate={interestRate} setInterestRate={setInterestRate}
                     tenure={tenure} setTenure={setTenure}
                     emi={emi} totalInterest={totalInterest} totalAmount={totalAmount}
                   />
                </div>
                
                {/* Trust Badge Widget */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600">
                      <Shield className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Secure Application</p>
                      <p className="text-xs text-slate-500">256-bit SSL Encryption</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>

      {/* 5. Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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

      {isModalOpen && (
        <HomeApplicationForm 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          loanType="Home Loan"
        />
      )}

      <BottomNav />
    </div>
  );
};

export default HomeLoanClient;