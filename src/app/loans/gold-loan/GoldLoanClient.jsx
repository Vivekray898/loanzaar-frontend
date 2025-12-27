'use client'

import React, { useState, useEffect } from 'react';
import Meta from '@/components/Meta';
import GoldLoanForm from '@/components/forms/loans/GoldLoanForm'
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav'
import StructuredData from '@/components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '@/utils/schema';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, Crown, Zap, IndianRupee, RefreshCw, TrendingDown, Target, Shield
} from 'lucide-react';

const GoldLoanClient = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(10);
  const [tenure, setTenure] = useState(12);
  const [emi, setEmi] = useState(0);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- EMI Calculation Logic ---
  useEffect(() => {
    const r = interestRate / 12 / 100;
    const n = tenure;
    const e = loanAmount * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    setEmi(Math.round(e));
  }, [loanAmount, interestRate, tenure]);

  const handleApplyClick = () => {
    setIsModalOpen(true);
  };

  // Smooth Scroll Handler
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Height of sticky headers
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // --- Data ---
  const features = [
    { id: 'quick', icon: Zap, title: 'Quick Processing', desc: 'Approved and disbursed in 15-30 minutes.' },
    { id: 'docs', icon: FileText, title: 'Minimal Docs', desc: 'Apply with just PAN or Aadhaar.' },
    { id: 'flexible', icon: IndianRupee, title: 'Flexible Amount', desc: 'Loans from ₹5,000 to ₹1 Crore.' },
    { id: 'repayment', icon: RefreshCw, title: 'Easy Repayment', desc: 'Bullet, EMI, or Overdraft options.' },
    { id: 'rates', icon: TrendingDown, title: 'Lower Rates', desc: 'Cheaper than personal loans.' },
    { id: 'use', icon: Target, title: 'Versatile Use', desc: 'No restrictions on end usage.' }
  ];

  const eligibilityCriteria = [
    { icon: 'user', text: 'Age: 18+ Years', highlight: false },
    { icon: 'crown', text: 'Own Gold Ornaments', highlight: true },
    { icon: 'star', text: 'Purity: 18K to 24K', highlight: true },
    { icon: 'id', text: 'Valid Govt ID Proof', highlight: false }
  ];

  const documents = [
    { title: 'Identity Proof', items: ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Passport'] },
    { title: 'Address Proof', items: ['Utility Bills', 'Rent Agreement', 'Bank Statement'] },
    { title: 'Photos', items: ['2 Passport Size Photos'] }
  ];

  const faqs = [
    { q: 'What is a gold loan?', a: 'Secured loan where you pledge gold ornaments as collateral for instant cash.' },
    { q: 'Max loan amount?', a: 'Depends on gold weight/purity (LTV ratio). Up to 75% of value usually.' },
    { q: 'Repayment period?', a: 'Flexible tenure from 3 months to 3 years.' },
    { q: 'Is my gold safe?', a: 'Yes, stored in bank-grade secure vaults with insurance.' },
    { q: 'Can I extend tenure?', a: 'Yes, by paying interest or renewing the loan.' },
    { q: 'What if I default?', a: 'Lender may auction gold after due notice. Repay on time to avoid this.' }
  ];

  // --- Reusable Calculator Widget ---
  const CalculatorWidget = () => (
    <div className="space-y-6 md:space-y-8">
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
              <p className="text-sm font-bold text-amber-400">₹{(emi * tenure).toLocaleString()}</p>
            </div>
        </div>
      </div>

      <div className="space-y-6 bg-white md:bg-transparent p-4 md:p-0 rounded-xl border md:border-none border-slate-200">
        <div>
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-slate-500">Loan Amount</span>
            <span className="text-slate-900">₹{(loanAmount/1000).toFixed(0)}k</span>
          </div>
          <input 
            type="range" min="5000" max="2000000" step="5000" 
            value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-slate-500">Tenure</span>
            <span className="text-slate-900">{tenure} Months</span>
          </div>
          <input 
            type="range" min="3" max="36" step="3" 
            value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-slate-500">Interest Rate</span>
            <span className="text-slate-900">{interestRate}%</span>
          </div>
          <input 
            type="range" min="7" max="18" step="0.5" 
            value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* Desktop Only Apply Button */}
      <div className="hidden lg:block pt-2">
        <button 
          onClick={handleApplyClick}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all text-white px-6 py-4 rounded-xl font-bold text-base shadow-xl shadow-amber-200"
        >
          Apply Now <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-center text-xs text-slate-400 mt-3">Instant Cash • 100% Insured</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0 text-slate-900">
      <Meta title="Gold Loan | Loanzaar" description="Instant cash against gold." />
      
      {/* 1. Header (Universal) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" /> Back
          </BackButton>
          <h1 className="text-base md:text-lg font-bold text-slate-900">Gold Loan</h1>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">

        {/* 2. Hero Section */}
        <section id="overview" className="mb-8">
          <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-amber-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                  Instant Cash
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Turn your Gold <br className="hidden md:block"/> into <span className="text-yellow-100">Capital.</span>
                </h2>
                <p className="text-amber-50 text-sm md:text-lg mb-6 leading-relaxed max-w-lg">
                  Get funds in 30 mins. Your gold stays safe in secure vaults. No income proof required.
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Shield className="w-4 h-4 text-white" /> 100% Insured
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Check className="w-4 h-4 text-white" /> Minimal Docs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Sticky Navigation Anchor Bar */}
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
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200' 
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
          
          {/* LEFT COLUMN: Content Sections (col-span-8) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* OVERVIEW CONTENT */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  What is a Gold Loan?
                </h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify">
                  A gold loan is a secured loan where you pledge your gold ornaments (18K-24K purity) as collateral to get instant funds. It is one of the fastest ways to raise capital for personal or business needs without selling your assets.
                </p>
              </div>

              {/* Key Benefits Box */}
              <div className="bg-amber-50/80 p-6 rounded-2xl border border-amber-100">
                 <h3 className="text-sm font-bold text-amber-900 mb-4 uppercase tracking-wide">Key Benefits</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                     { title: 'Speed', val: '30 Mins', sub: 'Disbursal' },
                     { title: 'Rate', val: '0.75%', sub: 'per month*' },
                     { title: 'Docs', val: 'KYC Only', sub: 'No Income Proof' },
                     { title: 'Security', val: 'Bank Vault', sub: 'Insured' },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white p-4 rounded-xl border border-amber-50 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">{stat.title}</p>
                        <p className="text-sm md:text-base font-bold text-amber-700 mt-1">{stat.val}</p>
                        <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">{stat.sub}</p>
                     </div>
                   ))}
                </div>
              </div>

              {/* Eligibility */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Eligibility Criteria</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eligibilityCriteria.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CALCULATOR SECTION (Mobile Only - Hidden on LG) */}
            <div id="calculator" className="lg:hidden scroll-mt-32 border-t border-slate-200 pt-8">
               <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-600" /> EMI Calculator
               </h3>
               <CalculatorWidget />
            </div>

            {/* FEATURES SECTION */}
            <div id="features" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Features & Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feat) => (
                  <div key={feat.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shadow-inner shrink-0 text-amber-600">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((section, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                      {section.title}
                    </div>
                    <div className="p-5 bg-white grid grid-cols-1 gap-3">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                          <Check className="w-4 h-4 text-amber-500" />
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
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-amber-300 transition-colors">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full flex justify-between items-center p-5 text-left"
                    >
                      <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180 text-amber-600' : ''}`} />
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

          {/* RIGHT COLUMN: Sticky Sidebar (Calculator) (lg:col-span-4) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
             <div className="sticky top-32 space-y-6">
                <div id="calculator" className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                   <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-amber-600" /> EMI Calculator
                   </h3>
                   <CalculatorWidget />
                </div>
                
                {/* Trust Badge Widget */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-600">
                      <Shield className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Secure Vaults</p>
                      <p className="text-xs text-slate-500">100% Insurance Coverage</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>

      {/* 5. Sticky Bottom Action Bar (Mobile/Tablet Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estimated EMI</p>
            <p className="text-lg font-bold text-slate-900">₹{emi.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-200"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Gold Loan Modal */}
      {isModalOpen && (
        <GoldLoanForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} loanType="Gold Loan" />
      )}
        {/* Bottom navigation */}
        <BottomNav />
    </div>
  );
};

export default GoldLoanClient;