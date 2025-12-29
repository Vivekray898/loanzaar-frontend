'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Meta from '@/components/Meta';
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav';
import StructuredData from '@/components/StructuredData';
// @ts-ignore
import PersonalLoanForm from '@/components/forms/loans/PersonalLoanForm'; 
import { generateLoanSchema, generateWebPageSchema } from '@/utils/schema';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, Shield, Clock, Gift, Layers, Eye, Wallet, 
  Briefcase, Minus, Plus, IndianRupee, Calendar, Percent
} from 'lucide-react';

// --- Interfaces for Type Safety ---
interface FeatureItem {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  badge?: string;
}

interface CriteriaItem {
  icon: string; 
  text: string;
  highlight: boolean;
}

interface DocSection {
  title: string;
  items: string[];
}

interface FaqItem {
  q: string;
  a: string;
}

// --- 1. Extracted Calculator Component (Fixes Lag & Enhances UI) ---
const PersonalLoanCalculator = ({ 
  loanAmount, setLoanAmount, 
  interestRate, setInterestRate, 
  tenure, setTenure, 
  emi, totalInterest, totalAmount 
}: any) => {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Results Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl text-center shadow-lg">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Estimated Monthly EMI</p>
        <p className="text-4xl font-bold">₹{emi.toLocaleString()}</p>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400">Total Interest</p>
              <p className="text-sm font-bold text-yellow-400">₹{totalInterest.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Total Amount</p>
              <p className="text-sm font-bold text-blue-400">₹{totalAmount.toLocaleString()}</p>
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
                    className="w-20 text-center text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
               </div>
               <button onClick={() => setLoanAmount((prev: number) => Math.min(4000000, prev + 10000))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          <input 
            type="range" min="50000" max="4000000" step="10000" 
            value={loanAmount} 
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
          />
          {/* Quick Select Chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
             {[100000, 500000, 1000000, 2000000].map(val => (
               <button 
                 key={val}
                 onClick={() => setLoanAmount(val)}
                 className={`px-3 py-1 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${loanAmount === val ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200'}`}
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
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
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
               <button onClick={() => setInterestRate((prev: number) => Math.max(10, +(prev - 0.5).toFixed(2)))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Minus className="w-3 h-3"/></button>
               <div className="px-2 py-1 flex items-center border-x border-slate-100 bg-slate-50 min-w-[60px] justify-center">
                  <input 
                    type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-12 text-center text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
                  <span className="text-xs text-slate-400 ml-1">%</span>
               </div>
               <button onClick={() => setInterestRate((prev: number) => Math.min(24, +(prev + 0.5).toFixed(2)))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          <input 
            type="range" min="10" max="24" step="0.5" 
            value={interestRate} 
            onChange={(e) => setInterestRate(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>10%</span>
            <span>24%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonalLoanClient = () => {
  // UI State
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(12);
  const [tenure, setTenure] = useState<number>(36);

  // --- EMI Calculation Logic ---
  const emi = useMemo(() => {
    const P = loanAmount;
    const R = interestRate / 12 / 100; // Monthly Interest
    const N = tenure; // Tenure in Months
    
    if (P > 0 && R > 0 && N > 0) {
      return Math.round(P * R * (Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1)));
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
  const features: FeatureItem[] = [
    { id: 'new-customers', icon: Gift, title: 'New Customer Offers', desc: 'Special rates for first-time borrowers.', badge: 'Popular' },
    { id: 'variants', icon: Layers, title: '3 Unique Variants', desc: 'Standard, Flexi, or Secured options.' },
    { id: 'amount', icon: Wallet, title: 'Up to ₹40 Lakhs', desc: 'Substantial funding for major expenses.' },
    { id: 'tenure', icon: Clock, title: 'Flexible Tenure', desc: 'Repay comfortably over up to 84 months.' },
    { id: 'no-collateral', icon: Shield, title: 'No Collateral', desc: '100% unsecured loan with zero risk to assets.' },
    { id: 'transparency', icon: Eye, title: 'No Hidden Fees', desc: 'Complete transparency in all charges.' }
  ];

  const eligibilityCriteria: CriteriaItem[] = [
    { icon: 'user', text: 'Age: 21 - 60 years', highlight: false },
    { icon: 'wallet', text: 'Income: ₹15k/mo (Salaried/Self)', highlight: true },
    { icon: 'star', text: 'CIBIL Score: 650+', highlight: true },
    { icon: 'flag', text: 'Indian Citizen', highlight: false },
    { icon: 'briefcase', text: 'Stable Employment', highlight: false }
  ];

  const documents: DocSection[] = [
    { title: 'Identity Proof', items: ['PAN Card', 'Aadhaar Card', 'Passport', 'Voter ID'] },
    { title: 'Address Proof', items: ['Aadhaar Card', 'Utility Bills', 'Rent Agreement'] },
    { title: 'Income Proof', items: ['3 Months Salary Slips', '6 Months Bank Statement'] },
    { title: 'Employment', items: ['Company ID Card', 'Appointment Letter'] }
  ];

  const faqs: FaqItem[] = [
    { q: 'What is a personal loan?', a: 'An unsecured loan for personal use like medical bills, travel, or renovation without collateral.' },
    { q: 'How much can I borrow?', a: 'You can borrow between ₹50,000 to ₹40 Lakhs depending on your eligibility.' },
    { q: 'Minimum credit score required?', a: 'A score of 650+ is recommended for quick approval and better interest rates.' },
    { q: 'Can I foreclose the loan?', a: 'Yes, foreclosure is allowed after payment of the first EMI, usually with a small fee.' },
    { q: 'How long does disbursal take?', a: 'Once approved, the amount is credited to your bank account within 24 to 48 hours.' }
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
          background: #2563EB; /* blue-600 */
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35);
          transition: transform 120ms cubic-bezier(.2,.8,.2,1), box-shadow 120ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        input[type="range"]::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #2563EB;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35);
          transition: transform 120ms cubic-bezier(.2,.8,.2,1), box-shadow 120ms ease;
        }
        input[type="range"]:active::-webkit-slider-thumb {
          transform: scale(1.06);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
        }
      `}</style>

      <Meta title="Personal Loan | Loanzaar" description="Instant personal loans up to ₹40L." />
      
      {/* 1. Universal Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" /> Back
          </BackButton>
          <h1 className="text-base md:text-lg font-bold text-slate-900">Personal Loan</h1>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">
        
        {/* 2. Hero Section */}
        <section id="overview" className="mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                  Instant Approval
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Funds for your <span className="text-blue-100">next big step.</span>
                </h2>
                <p className="text-blue-50 text-sm md:text-lg mb-6 leading-relaxed max-w-lg">
                  Get up to ₹40 Lakhs instantly. No collateral required. Money in bank within 24 hours.
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.8/5 Rated
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Check className="w-4 h-4 text-green-400" /> 100% Digital Process
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Sticky Navigation */}
        <div className="sticky top-16 z-40 bg-slate-50/95 backdrop-blur-sm pt-2 pb-4 border-b border-slate-200 mb-8">
          <div className="flex overflow-x-auto gap-2 md:gap-4 pb-2 scrollbar-hide scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
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
          
          {/* LEFT COLUMN: Content */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  What is a Personal Loan?
                </h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify">
                  A personal loan is an unsecured loan you can use for any purpose—medical emergencies, travel, wedding, or home renovation. Unlike other loans, you don't need to provide any collateral or security.
                </p>
              </div>

              {/* Eligibility Box */}
              <div className="bg-blue-50/80 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Eligibility Check
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {eligibilityCriteria.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.highlight ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {item.highlight ? <Check className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Uses Grid */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Popular Uses</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { title: 'Debt Consolidation', icon: Layers },
                      { title: 'Home Renovation', icon: Wallet },
                      { title: 'Medical Emergency', icon: FileText },
                      { title: 'Travel & Wedding', icon: Gift }
                    ].map((use, i) => (
                      <div key={i} className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                          <use.icon className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-slate-700">{use.title}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Mobile Calculator */}
            <div id="calculator" className="lg:hidden scroll-mt-32 border-t border-slate-200 pt-8">
               <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" /> EMI Calculator
               </h3>
               {/* Use the new Component */}
               <PersonalLoanCalculator 
                 loanAmount={loanAmount} setLoanAmount={setLoanAmount}
                 interestRate={interestRate} setInterestRate={setInterestRate}
                 tenure={tenure} setTenure={setTenure}
                 emi={emi} totalInterest={totalInterest} totalAmount={totalAmount}
               />
            </div>

            {/* Features */}
            <div id="features" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Why Choose Loanzaar?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feat) => (
                  <div key={feat.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shadow-inner shrink-0 text-blue-600">
                      <feat.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        {feat.title}
                        {feat.badge && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">{feat.badge}</span>}
                      </h4>
                      <p className="text-sm text-slate-500 leading-snug mt-1.5">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div id="docs" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-slate-700" /> Required Documents
              </h3>
              
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 mb-6">
                <Info className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-sm text-orange-800 leading-relaxed font-medium">
                  Keep soft copies of these documents ready for a faster, 100% paperless application.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            {/* FAQs */}
            <div id="faqs" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-slate-700" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((item, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-blue-300 transition-colors">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="w-full flex justify-between items-center p-5 text-left"
                    >
                      <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180 text-blue-600' : ''}`} />
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

          {/* RIGHT COLUMN: Sticky Calculator */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
             <div className="sticky top-32 space-y-6">
                <div id="calculator" className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                   <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-blue-600" /> EMI Calculator
                   </h3>
                   {/* Use the new Component */}
                   <PersonalLoanCalculator 
                     loanAmount={loanAmount} setLoanAmount={setLoanAmount}
                     interestRate={interestRate} setInterestRate={setInterestRate}
                     tenure={tenure} setTenure={setTenure}
                     emi={emi} totalInterest={totalInterest} totalAmount={totalAmount}
                   />
                </div>
                
                {/* Trust Badge */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
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

      {/* 5. Sticky Bottom Action Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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

      {/* The Loan Form Modal */}
      {isModalOpen && (
        <PersonalLoanForm 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          loanType="Personal Loan"
        />
      )}

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
};

export default PersonalLoanClient;