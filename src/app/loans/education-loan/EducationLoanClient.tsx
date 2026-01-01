'use client'

import React, { useState, useMemo } from 'react';
import Meta from '@/components/Meta';
// @ts-ignore
import EducationLoanForm from '@/components/forms/loans/EducationLoanForm'
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav';
import ProtectedCTAButton from '@/components/ProtectedCTAButton'
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, GraduationCap, IndianRupee, Clock, Shield, Users,
  Minus, Plus, Percent
} from 'lucide-react';

// --- Types ---
interface LoanCalculatorProps {
  loanAmount: number;
  setLoanAmount: React.Dispatch<React.SetStateAction<number>>;
  interestRate: number;
  setInterestRate: React.Dispatch<React.SetStateAction<number>>;
  tenure: number;
  setTenure: React.Dispatch<React.SetStateAction<number>>;
  emi: number;
  totalInterest: number;
  totalAmount: number;
  onApply: () => void;
}

// --- 1. Extracted Calculator Component ---
const LoanCalculator: React.FC<LoanCalculatorProps> = ({ 
  loanAmount, setLoanAmount, 
  interestRate, setInterestRate, 
  tenure, setTenure, 
  emi, totalInterest, totalAmount,
  onApply
}) => {
  return (
    <div className="space-y-6">
      {/* Results Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl text-center shadow-lg transition-all duration-300">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Monthly Installment</p>
        <p className="text-4xl font-bold tracking-tight">₹{emi.toLocaleString()}</p>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Total Interest</p>
              <p className="text-sm font-bold text-yellow-400">₹{totalInterest.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Total Amount</p>
              <p className="text-sm font-bold text-purple-400">₹{totalAmount.toLocaleString()}</p>
            </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-6 bg-white md:bg-transparent p-5 md:p-0 rounded-2xl border md:border-none border-slate-200 shadow-sm md:shadow-none">
        
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-slate-700">Loan Amount</label>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
               <button onClick={() => setLoanAmount((prev) => Math.max(50000, prev - 10000))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Minus className="w-3 h-3"/></button>
               <div className="px-2 py-1 flex items-center border-x border-slate-100 bg-slate-50 min-w-[80px] justify-center">
                  <IndianRupee className="w-3 h-3 text-slate-400 mr-1" />
                  <input 
                    type="number" 
                    value={loanAmount} 
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-20 text-center text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
               </div>
               <button onClick={() => setLoanAmount((prev) => Math.min(10000000, prev + 10000))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          
          <input 
            type="range" min="50000" max="10000000" step="10000" 
            value={loanAmount} 
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-700 transition-all"
          />
          
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
             {[500000, 1000000, 2000000, 5000000].map(val => (
               <button 
                 key={val}
                 onClick={() => setLoanAmount(val)}
                 className={`px-3 py-1 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${loanAmount === val ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200'}`}
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
               <button onClick={() => setTenure((prev) => Math.max(12, prev - 6))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Minus className="w-3 h-3"/></button>
               <div className="px-2 py-1 flex items-center border-x border-slate-100 bg-slate-50 min-w-[60px] justify-center">
                  <input 
                    type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-10 text-center text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
                  <span className="text-xs text-slate-400 ml-1">mo</span>
               </div>
               <button onClick={() => setTenure((prev) => Math.min(180, prev + 6))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          <input 
            type="range" min="12" max="180" step="6" 
            value={tenure} 
            onChange={(e) => setTenure(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-700 transition-all"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>1 Yr</span>
            <span>15 Yrs</span>
          </div>
        </div>

        {/* Interest */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-slate-700">Interest Rate</label>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
               <button onClick={() => setInterestRate((prev) => Math.max(8, prev - 0.25))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Minus className="w-3 h-3"/></button>
               <div className="px-2 py-1 flex items-center border-x border-slate-100 bg-slate-50 min-w-[60px] justify-center">
                  <input 
                    type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-10 text-center text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
                  <span className="text-xs text-slate-400 ml-1">%</span>
               </div>
               <button onClick={() => setInterestRate((prev) => Math.min(16, prev + 0.25))} className="p-2 hover:bg-slate-50 text-slate-500 active:bg-slate-100 transition-colors"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
          <input 
            type="range" min="8" max="16" step="0.25" 
            value={interestRate} 
            onChange={(e) => setInterestRate(Number(e.target.value))}
            style={{ touchAction: 'none' }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-700 transition-all"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>8%</span>
            <span>16%</span>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Apply Button (Visible on md+) */}
      <div className="hidden md:block pt-2">
        <ProtectedCTAButton
          label="Apply Now"
          onContinue={onApply}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all text-white px-6 py-4 rounded-xl font-bold text-base shadow-xl shadow-purple-200/50"
        />
        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-wide">
          Tax Benefits (Sec 80E) • Pre-admission
        </p>
      </div>
    </div>
  )
}

const EducationLoanClient = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculator State
  const [loanAmount, setLoanAmount] = useState(1000000); 
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenure, setTenure] = useState(120); 

  // --- Optimized EMI Calculation ---
  const emi = useMemo(() => {
    const P = loanAmount;
    const R = interestRate / 12 / 100;
    const N = tenure;
    
    if (P > 0 && R > 0 && N > 0) {
      return Math.round(P * R * (Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1)));
    }
    return 0;
  }, [loanAmount, interestRate, tenure]);

  const totalAmount = useMemo(() => emi * tenure, [emi, tenure]);
  const totalInterest = useMemo(() => totalAmount - loanAmount, [totalAmount, loanAmount]);

  const handleApplyClick = () => setIsModalOpen(true);

  // Resume gated CTA flows after successful login
  React.useEffect(() => {
    const handler = (e: any) => {
      try {
        const action = e?.detail?.action
        if (!action) return
        switch (action) {
          case 'apply_now':
            setIsModalOpen(true)
            break
          // add other intents if this page needs to handle them in future
          default:
            break
        }
      } catch (err) { }
    }

    window.addEventListener('resume-flow', handler)
    return () => window.removeEventListener('resume-flow', handler)
  }, [])

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

  const features = [
    { id: 'high-value', icon: IndianRupee, title: 'High-Value Loans', desc: 'Secure funding for all expenses, from tuition to accommodation.' },
    { id: 'rates', icon: Star, title: 'Attractive Rates', desc: 'Benefit from competitive interest rates for manageable repayment.' },
    { id: 'pre-admission', icon: Clock, title: 'Pre-Admission', desc: 'Get sanctioned before admission is confirmed.' },
    { id: 'moratorium', icon:  Clock, title: 'Moratorium Period', desc: 'Repayment starts after course completion.' },
    { id: 'co-borrower', icon: Users, title: 'Co-borrower Option', desc: 'Parents can be co-borrowers to improve eligibility.' },
    { id: 'tax', icon: FileText, title: 'Tax Benefits', desc: 'Interest eligible for tax deduction under Section 80E.' },
    { id: 'coverage', icon: GraduationCap, title: 'Wide Coverage', desc: 'Loans for institutions in India and abroad.' },
    { id: 'collateral', icon: Shield, title: 'Collateral Options', desc: 'Secured and unsecured loans available.' }
  ];

  const eligibility = [
    'Age: 18+ years',
    'Proof of admission to eligible institution',
    'Co-borrower with stable income required',
    'Good academic record helps',
    'Good credit history of co-borrower',
    'Collateral for high-value loans'
  ];

  const documents = [
    { title: 'Student', items: ['ID Proof (Aadhaar/PAN)', 'Admission Proof', 'Academic Records', 'Address Proof'] },
    { title: 'Co-applicant', items: ['ID & Address Proof', 'Income Proof', 'Credit History', 'Relationship Proof'] },
    { title: 'Income (Salaried)', items: ['3 Months Salary Slips', 'Form 16 / ITR', '6 Months Bank Stmt'] },
    { title: 'Income (Self)', items: ['3 Years ITR', 'P&L Account', 'Balance Sheet', 'Biz Registration'] }
  ];

  const faqs = [
    { q: 'What is an education loan?', a: 'Financial aid to pay for tuition, books, and living costs for higher education.' },
    { q: 'Who is eligible?', a: 'Students 18+ with admission to eligible institutes and a co-borrower with stable income.' },
    { q: 'What is a moratorium period?', a: 'A grace period after course completion where no repayment is required.' },
    { q: 'When does repayment start?', a: 'Usually 6 months after course completion or after securing a job.' },
    { q: 'Can I prepay the loan?', a: 'Yes, most lenders allow prepayment without penalties.' },
    { q: 'Is there a tax benefit?', a: 'Yes, interest paid is deductible under Section 80E.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0 text-slate-900">
      
      {/* Styles for Slider */}
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
          background: #7c3aed;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.35);
          transition: transform 120ms cubic-bezier(.2,.8,.2,1), box-shadow 120ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        input[type="range"]::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.35);
          transition: transform 120ms cubic-bezier(.2,.8,.2,1), box-shadow 120ms ease;
        }
      `}</style>

      <Meta title="Education Loan | Loanzaar" description="Finance your child's education with flexible loans." />
      
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" /> Back
          </BackButton>
          <h1 className="text-base md:text-lg font-bold text-slate-900">Education Loan</h1>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">

        {/* Hero Section */}
        <section id="overview" className="mb-8">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                  Study Abroad & India
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Fund your <br className="hidden md:block"/> <span className="text-purple-200">Academic Dreams.</span>
                </h2>
                <p className="text-purple-100 text-sm md:text-lg mb-6 leading-relaxed max-w-lg">
                  100% financing for tuition & living. Pre-admission sanction available. Tax benefits under Sec 80E.
                </p>
                <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 100% Financing
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Check className="w-4 h-4 text-green-400" /> Tax Benefit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
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
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}
                `}
              >
                <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
          
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  What is an Education Loan?
                </h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify">
                  An education loan provides financial support for higher studies in India or abroad. It covers tuition fees, accommodation, books, and travel expenses. Repayment typically starts after a moratorium period (course duration + 6-12 months).
                </p>
              </div>

              <div className="bg-purple-50/80 p-6 rounded-2xl border border-purple-100">
                  <h3 className="text-sm font-bold text-purple-900 mb-4 uppercase tracking-wide">Why Choose Us?</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'High-Value Loans for all expenses',
                    'Attractive Interest Rates',
                    'Pre-Admission Sanction advantage',
                    'Tax Benefits (Sec 80E)'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-purple-900 bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Eligibility Criteria</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eligibility.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile Calculator */}
            <div id="calculator" className="lg:hidden scroll-mt-32 border-t border-slate-200 pt-8" style={{ WebkitOverflowScrolling: 'touch' }}>
               <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-600" /> EMI Calculator
               </h3>
               {/* 2. Passed Props to extracted component */}
               <LoanCalculator 
                 loanAmount={loanAmount} setLoanAmount={setLoanAmount}
                 interestRate={interestRate} setInterestRate={setInterestRate}
                 tenure={tenure} setTenure={setTenure}
                 emi={emi} totalInterest={totalInterest} totalAmount={totalAmount}
                 onApply={handleApplyClick}
               />
            </div>

            {/* Features */}
            <div id="features" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Features & Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feat) => (
                  <div key={feat.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shadow-inner shrink-0 text-purple-600">
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

            {/* Documents */}
            <div id="docs" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-slate-700" /> Required Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((section, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                      {section.title}
                    </div>
                    <div className="p-5 bg-white grid grid-cols-1 gap-3">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                          <Check className="w-4 h-4 text-purple-500" />
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
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-purple-300 transition-colors">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="w-full flex justify-between items-center p-5 text-left"
                    >
                      <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180 text-purple-600' : ''}`} />
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

          {/* Desktop Sidebar Calculator */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
             <div className="sticky top-32 space-y-6">
                <div id="calculator" className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                   <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-purple-600" /> EMI Calculator
                   </h3>
                   {/* 2. Passed Props to extracted component */}
                   <LoanCalculator 
                     loanAmount={loanAmount} setLoanAmount={setLoanAmount}
                     interestRate={interestRate} setInterestRate={setInterestRate}
                     tenure={tenure} setTenure={setTenure}
                     emi={emi} totalInterest={totalInterest} totalAmount={totalAmount}
                     onApply={handleApplyClick}
                   />
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600">
                      <Shield className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Secure Future</p>
                      <p className="text-xs text-slate-500">100% Transparency</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">EMI Starts at</p>
            <p className="text-lg font-bold text-slate-900">₹{emi.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
          </div>
          <ProtectedCTAButton
            label="Apply Now"
            onContinue={handleApplyClick}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-200"
          />
        </div>
      </div>

      {isModalOpen && (
        <EducationLoanForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} loanType="Education Loan" />
      )}

      <BottomNav />
    </div>
  );
};

export default EducationLoanClient;