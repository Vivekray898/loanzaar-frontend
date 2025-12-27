'use client'

import React, { useState, useEffect, useRef } from 'react';
import Meta from '../components/Meta';
import BackButton from '../components/BackButton';
import NewCarLoanForm from '../components/forms/cars/NewCarLoanForm'; // ✅ Import Form
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, DollarSign, Layers, Clock, Zap, Wallet, Settings, Key,
  TrendingUp, Calendar, Briefcase, User, Shield
} from 'lucide-react';

const NewCarLoanFormPage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // ✅ Added state
  
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
    setIsFormOpen(true); // ✅ Toggle Form
  };

  // Smooth Scroll Handler for Anchor Links
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
    { title: 'Loan up to ₹47 Lakh', icon: DollarSign, desc: 'High loan amount for new cars.' },
    { title: '3 Unique Variants', icon: Layers, desc: 'Standard, Flexi, or Secured options.' },
    { title: '72 Months Tenure', icon: Clock, desc: 'Flexible repayment up to 6 years.' },
    { title: 'Minimal Docs', icon: FileText, desc: 'Paperless approval process.' },
    { title: 'Immediate Funds', icon: Zap, desc: 'Quick disbursal to dealer.' },
    { title: 'Flexible Tenures', icon: Calendar, desc: 'Repay at your own pace.' },
    { title: 'Fixed Rates', icon: TrendingUp, desc: 'Predictable monthly payments.' },
    { title: 'Custom Amount', icon: Settings, desc: 'Tailored to your car choice.' },
    { title: 'Easy Repay', icon: Wallet, desc: 'Manageable installments.' },
    { title: 'Tax Benefits', icon: FileText, desc: 'Savings on interest (if applicable).' },
    { title: 'New & Used', icon: Settings, desc: 'Options for all car types.' },
    { title: 'Ownership', icon: Key, desc: 'Drive your own car immediately.' }
  ];

  const eligibilityCriteria = [
    { text: 'Age: 21 - 65 Years', icon: Calendar },
    { text: 'Income: ₹20k/mo (Min)', icon: DollarSign },
    { text: 'Employment: Stable History', icon: Briefcase },
    { text: 'Score: 650+ CIBIL', icon: Star },
    { text: 'Salaried: 2 Yrs Exp (1 Yr Current)', icon: User },
    { text: 'Self-Employed: 2 Yrs Business', icon: User }
  ];

  const documents = [
    { title: 'Basic KYC', items: ['PAN, Aadhaar, Passport, Voter ID'] },
    { title: 'Income Proof (Salaried)', items: ['3 Months Salary Slips', 'Form 16', '6 Months Bank Statement'] },
    { title: 'Income Proof (Self-Employed)', items: ['Last 2 Years ITR', 'Business Proof', '6 Months Bank Statement'] },
    { title: 'Other Docs', items: ['Signature Verification', 'Proforma Invoice from Dealer'] }
  ];

  const fees = [
    { particular: 'Processing Fees', charges: '₹6200 onwards' },
    { particular: 'Stamp Duty', charges: 'As Per State Rates' }
  ];

  const faqs = [
    { q: 'What is a new car loan?', a: 'A loan to buy a brand new vehicle from a dealership, covering a significant portion of the on-road price.' },
    { q: 'How does it work?', a: 'You borrow an amount based on the car\'s price, pay a down payment, and repay the loan via fixed monthly EMIs.' },
    { q: 'What is a down payment?', a: 'An upfront payment reducing the total loan amount, typically 10-20% of the car\'s value.' },
    { q: 'What is the interest rate?', a: 'The percentage charged on the borrowed money, which can be a fixed or floating rate, varying by lender and your credit profile.' },
    { q: 'What is the loan tenure?', a: 'The repayment period, usually ranging from 12 to 72 months (1 to 6 years).' },
    { q: 'Can I choose my EMI date?', a: 'Yes, many lenders offer flexibility to choose an EMI date that aligns with your salary or business cash flow.' },
    { q: 'Can I customize the loan?', a: 'Yes, depending on your eligibility, you can often include the cost of accessories or extended warranties in the loan amount.' },
    { q: 'Is prepayment allowed?', a: 'Yes, most lenders allow prepayment after a minimum period (e.g., 6-12 months), usually with a small fee.' },
    { q: 'How to apply?', a: 'You can apply online through our portal or visit a branch, submitting your KYC and income documents.' }
  ];

  // --- Reusable Calculator Widget ---
  const CalculatorWidget = () => (
    <div className="space-y-6 md:space-y-8">
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
              <p className="text-sm font-bold text-red-400">₹{(emi * tenure).toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="space-y-6 bg-white md:bg-transparent p-4 md:p-0 rounded-xl border md:border-none border-slate-200">
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

      {/* Desktop Only Apply Button */}
      <div className="hidden lg:block pt-2">
        <button 
          onClick={handleApplyClick}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white px-6 py-4 rounded-xl font-bold text-base shadow-xl shadow-red-200"
        >
          Apply Now <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-center text-xs text-slate-400 mt-3">Up to 100% On-Road Funding</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0 text-slate-900">
      <Meta title="New Car Loan | Loanzaar" description="Drive your dream car today." />
      
      {/* 1. Header (Universal) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" /> Back
          </BackButton>
          <h1 className="text-base md:text-lg font-bold text-slate-900">New Car Loan</h1>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">

        {/* 2. Hero Section */}
        <section id="overview" className="mb-8">
          <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-red-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                  Showroom Ready
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Drive Home Your <br className="hidden md:block"/> <span className="text-red-100">Dream Car.</span>
                </h2>
                <p className="text-red-50 text-sm md:text-lg mb-6 leading-relaxed max-w-lg">
                  Up to 100% on-road funding. Lowest interest rates. Instant sanction.
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Instant Sanction
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Settings className="w-4 h-4 text-white" /> Custom EMI
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
                    ? 'bg-red-600 text-white shadow-md shadow-red-200' 
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
                  What is a New Car Loan?
                </h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify">
                  A new car loan provides financial assistance to purchase a brand new vehicle from a dealership. It covers a significant portion of the car's on-road price, including ex-showroom cost, RTO charges, and insurance.
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-center">
                    <h4 className="text-xs md:text-sm font-bold text-red-800 mb-1">Max Funding</h4>
                    <p className="text-sm md:text-base font-bold text-red-600">100%</p>
                    <p className="text-[10px] text-slate-500">On-road price</p>
                 </div>
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-center">
                    <h4 className="text-xs md:text-sm font-bold text-red-800 mb-1">Ownership</h4>
                    <p className="text-sm md:text-base font-bold text-red-600">Your Name</p>
                    <p className="text-[10px] text-slate-500">Immediate</p>
                 </div>
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-center">
                    <h4 className="text-xs md:text-sm font-bold text-red-800 mb-1">Tenure</h4>
                    <p className="text-sm md:text-base font-bold text-red-600">7 Years</p>
                    <p className="text-[10px] text-slate-500">Maximum</p>
                 </div>
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-center">
                    <h4 className="text-xs md:text-sm font-bold text-red-800 mb-1">Rates From</h4>
                    <p className="text-sm md:text-base font-bold text-red-600">8.50%</p>
                    <p className="text-[10px] text-slate-500">Fixed p.a.</p>
                 </div>
              </div>


              {/* Eligibility */}
              <div className="bg-blue-50/80 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Eligibility Criteria
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eligibilityCriteria.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                      <item.icon className="w-4 h-4 text-blue-600 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>

               {/* Fees Section */}
               <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Fees & Charges</h3>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                     <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                           <tr>
                              <th scope="col" className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Particular</th>
                              <th scope="col" className="px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Charges</th>
                           </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                           {fees.map((fee, i) => (
                              <tr key={i}>
                                 <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{fee.particular}</td>
                                 <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600 text-right">{fee.charges}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

            </div>

            {/* CALCULATOR SECTION (Mobile Only - Hidden on LG) */}
            <div id="calculator" className="lg:hidden scroll-mt-32 border-t border-slate-200 pt-8">
               <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-red-600" /> EMI Calculator
               </h3>
               <CalculatorWidget />
            </div>

            {/* FEATURES SECTION */}
            <div id="features" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Features & Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feat) => (
                  <div key={feat.title} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shadow-inner shrink-0 text-red-600">
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
                  Submit these documents for faster processing and approval.
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
                          <Check className="w-4 h-4 text-red-500" />
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
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-red-300 transition-colors">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full flex justify-between items-center p-5 text-left"
                    >
                      <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180 text-red-600' : ''}`} />
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
                      <Calculator className="w-5 h-5 text-red-600" /> EMI Calculator
                   </h3>
                   <CalculatorWidget />
                </div>
                
                {/* Trust Badge Widget */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-red-600">
                      <Shield className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Secure Loan</p>
                      <p className="text-xs text-slate-500">256-bit Encryption</p>
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
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">EMI Starts at</p>
            <p className="text-lg font-bold text-slate-900">₹{emi.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-200"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ✅ Wired Form Component */}
      <NewCarLoanForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />

    </div>
  );
};

export default NewCarLoanFormPage;