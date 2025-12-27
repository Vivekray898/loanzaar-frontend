'use client'

import React, { useState, useEffect } from 'react';
import Meta from '@/components/Meta';
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav';
import { 
  ChevronDown, Check, Star, Calculator, FileText, Info, HelpCircle, 
  ArrowRight, Car, Zap, DollarSign, Layers, Clock, Shield, 
  User, Wallet, Briefcase, Building, Banknote, Percent, FileWarning 
} from 'lucide-react';

// --- Interfaces ---

interface Feature {
  title: string;
  desc: string;
  icon: any;
}

interface FaqItem {
  q: string;
  a: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: any;
}

interface FeeItem {
  particular: string;
  charge: string;
}

const CarLoanClient: React.FC = () => {
  // UI State
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [eligibilityType, setEligibilityType] = useState<'salaried' | 'self'>('salaried');
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(9);
  const [tenure, setTenure] = useState<number>(60);
  const [emi, setEmi] = useState<number>(0);

  // --- EMI Calculation Logic ---
  useEffect(() => {
    const r = interestRate / 12 / 100;
    const n = tenure;
    if (loanAmount > 0 && interestRate > 0 && tenure > 0) {
      const e = loanAmount * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
      setEmi(Math.round(e));
    } else {
      setEmi(0);
    }
  }, [loanAmount, interestRate, tenure]);

  const handleApplyClick = () => {
    alert("Opens Application Form Sheet"); 
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 130;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // --- Content Data ---
  
  const features: Feature[] = [
    { title: 'Loan up to ₹47 Lakh', icon: DollarSign, desc: 'High value funding for premium vehicles.' },
    { title: '3 Unique Variants', icon: Layers, desc: 'Standard, Flexi, or Secured loan options.' },
    { title: '72 Months Tenure', icon: Clock, desc: 'Flexible repayment up to 6 years.' },
    { title: 'Ownership Day 1', icon: Car, desc: 'Hypothecated to bank, but you drive immediately.' },
    { title: 'Immediate Funds', icon: Zap, desc: 'Quick disbursal directly to the dealer.' },
    { title: 'Tax Benefits', icon: Banknote, desc: 'Potential tax deductions for business usage.' }
  ];

  const benefitsList = [
    "Fixed Interest Rates",
    "Customized Loan Amounts",
    "Convenient Monthly Repayments",
    "Option for New and Used Cars",
    "No Need for Full Upfront Payment",
    "Improve Credit Score via Timely Payments"
  ];

  const feeData: FeeItem[] = [
    { particular: 'Loan Processing Fees', charge: '1.5% to 4% of loan amount' },
    { particular: 'Loan Cancellation', charge: 'Approx ₹5,000' },
    { particular: 'Stamp Duty Charges', charge: 'As per actuals' },
    { particular: 'Legal Fees', charge: 'As per actuals' },
    { particular: 'Penal Charges', charge: '2% per month (24% p.a.)' },
    { particular: 'EMI / Cheque Bounce', charge: 'Approx ₹400 per bounce' },
  ];

  const documents: string[] = [
    'KYC (Valid Photo ID: Aadhaar, Passport)',
    'PAN Card',
    'Last 2 Years ITR (Income Proof)',
    'Salary Slips (Latest 3 Months)',
    'Salary Account Statement (Latest 6 Months)',
    'Signature Verification Proof'
  ];

  const faqs: FaqItem[] = [
    { q: 'What is a car loan?', a: 'A car loan is a secured loan where the lender provides funds to purchase a vehicle, and the vehicle serves as collateral until the loan is repaid.' },
    { q: "What's the importance of a down payment?", a: 'A down payment reduces the total loan amount, lowers your monthly EMI burden, and improves your chances of loan approval.' },
    { q: "What's the difference between fixed and variable interest?", a: 'Fixed rates remain the same throughout the tenure, offering predictable EMIs. Variable rates fluctuate with market trends.' },
    { q: 'Can I prepay or pay off my car loan early?', a: 'Yes, most banks allow prepayment after 6-12 months. Foreclosure charges (usually 3-5%) may apply.' },
    { q: 'Difference between new vs used car loan?', a: 'New car loans generally have lower interest rates (8-9%) and higher LTV. Used car loans have higher rates (12-15%) due to valuation risks.' },
    { q: "What happens if I can't make payments?", a: 'Missing payments attracts penal charges and hurts your credit score. Continued default may lead to vehicle seizure by the bank.' },
    { q: 'How to get your Car Loan approved faster?', a: 'Maintain a high credit score (750+), keep documents ready, and ensure a stable income to debt ratio.' },
    { q: 'What is the minimum credit score needed?', a: 'A CIBIL score of 650+ is generally required, though 750+ gets you the best interest rates.' },
    { q: 'What is the maximum Loan amount available?', a: 'You can avail up to 100% of the on-road price for select models, or typically up to 85-90% of the car value.' },
    { q: 'Common repayment tenures?', a: 'Tenures typically range from 12 months (1 year) to 84 months (7 years), with 72 months being very common.' },
    { q: 'How to get an NOC from a bank?', a: 'Once the loan is fully repaid, the bank issues a No Objection Certificate (NOC) which you submit to the RTO to remove the hypothecation.' }
  ];

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'emi', label: 'Calculator', icon: Calculator },
    { id: 'features', label: 'Features', icon: Star },
    { id: 'docs', label: 'Docs', icon: FileText },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28 text-slate-900">
      <Meta title="Car Loan | Loanzaar" description="Drive your dream car with up to 100% funding." />
      
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 h-14 transition-all">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
                <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    <ChevronDown className="w-4 h-4 rotate-90" /> Back
                </BackButton>
                <h1 className="text-sm font-bold text-slate-900 hidden sm:block">Car Loan</h1>
            </div>
            <button 
                onClick={handleApplyClick}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md shadow-indigo-200 transition-all flex items-center gap-1"
            >
                Apply <span className="hidden sm:inline">Now</span> <ArrowRight className="w-3 h-3" />
            </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto">
        
        {/* 2. Hero Section */}
        <div className="p-4 md:p-6 lg:p-8" id="overview">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 md:p-10 lg:p-12 text-white shadow-xl shadow-indigo-200 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            
            <div className="relative z-10 md:w-1/2">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                Drive Today
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Your Dream Car <br/> <span className="text-indigo-200">is Waiting.</span>
                </h2>
                <p className="text-indigo-50 text-sm md:text-base mb-6 leading-relaxed max-w-sm">
                Up to ₹47 Lakh funding. Minimal documentation. Ownership from Day 1.
                </p>
                <div className="flex flex-wrap gap-3 text-xs font-medium">
                  <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      <Car className="w-3 h-3 text-cyan-400" /> New & Used
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-green-400" /> Up to 72 Months
                  </div>
                </div>
            </div>
            <div className="relative z-10 hidden md:block">
               <Calculator className="w-32 h-32 text-white/20 rotate-12" />
            </div>
            </div>
        </div>

        {/* 3. Sticky Tabs */}
        <div className="sticky top-14 z-40 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 md:rounded-b-xl">
            <div className="flex overflow-x-auto gap-2 px-4 py-3 scrollbar-hide max-w-5xl mx-auto">
            {tabs.map((tab) => (
                <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300
                    ${activeSection === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}
                `}
                >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                </button>
            ))}
            </div>
        </div>

        {/* 4. Main Content Area */}
        <div className="px-4 py-6 space-y-12 md:px-6 lg:px-8">
            
            {/* SECTION: ELIGIBILITY */}
            <section className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Info className="w-5 h-5 text-indigo-600" /> Car Loan Eligibility
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            Eligibility depends on your income, credit score (usually 650+), and stability. Lenders check these to ensure repayment capability.
                        </p>
                        
                        {/* Toggle for Salaried vs Self Employed */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-1">
                          <div className="flex gap-1 p-1 bg-slate-100/50 rounded-xl mb-4">
                             <button 
                               onClick={() => setEligibilityType('salaried')}
                               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${eligibilityType === 'salaried' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                             >
                               Salaried
                             </button>
                             <button 
                               onClick={() => setEligibilityType('self')}
                               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${eligibilityType === 'self' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                             >
                               Self-Employed
                             </button>
                          </div>

                          <div className="px-3 pb-3">
                             <ul className="space-y-3">
                                {eligibilityType === 'salaried' ? (
                                  <>
                                    <li className="flex gap-3 text-sm text-slate-700">
                                      <User className="w-5 h-5 text-indigo-500 shrink-0" />
                                      <div>
                                        <span className="font-bold block text-xs text-slate-400 uppercase">Age Limit</span>
                                        21 to 60 Years
                                      </div>
                                    </li>
                                    <li className="flex gap-3 text-sm text-slate-700">
                                      <Briefcase className="w-5 h-5 text-indigo-500 shrink-0" />
                                      <div>
                                        <span className="font-bold block text-xs text-slate-400 uppercase">Stability</span>
                                        Min 2 Years Work Exp (1 Year in current)
                                      </div>
                                    </li>
                                    <li className="flex gap-3 text-sm text-slate-700">
                                      <Wallet className="w-5 h-5 text-indigo-500 shrink-0" />
                                      <div>
                                        <span className="font-bold block text-xs text-slate-400 uppercase">Income</span>
                                        Min ₹3,00,000 per year
                                      </div>
                                    </li>
                                  </>
                                ) : (
                                  <>
                                    <li className="flex gap-3 text-sm text-slate-700">
                                      <User className="w-5 h-5 text-indigo-500 shrink-0" />
                                      <div>
                                        <span className="font-bold block text-xs text-slate-400 uppercase">Age Limit</span>
                                        21 to 65 Years
                                      </div>
                                    </li>
                                    <li className="flex gap-3 text-sm text-slate-700">
                                      <Building className="w-5 h-5 text-indigo-500 shrink-0" />
                                      <div>
                                        <span className="font-bold block text-xs text-slate-400 uppercase">Business Vintage</span>
                                        Min 2 Years in Business
                                      </div>
                                    </li>
                                    <li className="flex gap-3 text-sm text-slate-700">
                                      <Wallet className="w-5 h-5 text-indigo-500 shrink-0" />
                                      <div>
                                        <span className="font-bold block text-xs text-slate-400 uppercase">Earnings</span>
                                        Min ₹3,00,000 per year
                                      </div>
                                    </li>
                                  </>
                                )}
                             </ul>
                          </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600" /> Why Choose Us?
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {benefitsList.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-green-600" />
                                  </div>
                                  <span className="font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-slate-200" />

            {/* SECTION: CALCULATOR */}
            <section id="emi" className="scroll-mt-32">
                 <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-600" /> EMI Calculator
                </h3>
                
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        {/* Inputs */}
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-sm font-semibold mb-3">
                                    <span className="text-slate-500">Loan Amount</span>
                                    <span className="text-slate-900 bg-slate-100 px-3 py-1 rounded-md">₹{(loanAmount).toLocaleString()}</span>
                                </div>
                                <input 
                                    type="range" min="100000" max="4700000" step="50000" 
                                    value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-semibold mb-3">
                                    <span className="text-slate-500">Tenure</span>
                                    <span className="text-slate-900 bg-slate-100 px-3 py-1 rounded-md">{tenure} Months</span>
                                </div>
                                <input 
                                    type="range" min="12" max="84" step="6" 
                                    value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-semibold mb-3">
                                    <span className="text-slate-500">Interest Rate</span>
                                    <span className="text-slate-900 bg-slate-100 px-3 py-1 rounded-md">{interestRate}%</span>
                                </div>
                                <input 
                                    type="range" min="7" max="18" step="0.1" 
                                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </div>

                        {/* Output */}
                        <div className="bg-slate-900 text-white p-8 rounded-2xl text-center shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2 relative z-10">Monthly EMI</p>
                            <p className="text-5xl font-bold mb-6 relative z-10">₹{emi.toLocaleString()}</p>
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800 relative z-10">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Interest</p>
                                    <p className="text-lg font-bold text-yellow-400">₹{(emi * tenure - loanAmount).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Amount</p>
                                    <p className="text-lg font-bold text-indigo-400">₹{(emi * tenure).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calculation Info */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-indigo-900 mb-2">How is it calculated?</h4>
                  <p className="text-xs text-indigo-700 mb-3 leading-relaxed">
                    The mathematical formula for calculating EMI is:
                  </p>
                  <code className="block bg-white p-3 rounded-lg text-xs font-mono text-slate-600 border border-indigo-100 mb-3 text-center">
                    EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
                  </code>
                  <p className="text-[10px] text-indigo-500">
                    Where P = Principal, R = Monthly Interest Rate, N = Tenure in months.
                  </p>
                </div>
            </section>

            <hr className="border-slate-200" />

            {/* SECTION: FEATURES */}
            <section id="features" className="scroll-mt-32">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-indigo-600" /> Key Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {features.map((feat) => (
                        <div key={feat.title} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group">
                            <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-full flex items-center justify-center shadow-sm mb-3 text-indigo-600 transition-colors">
                                <feat.icon className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">{feat.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <hr className="border-slate-200" />

            {/* SECTION: DOCUMENTS */}
            <section id="docs" className="scroll-mt-32">
                 <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" /> Documents & Fees
                </h3>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Documents List */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Required Documents</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {documents.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                                <span className="text-sm text-slate-700 font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Fees Table */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Fees & Charges</h4>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Particulars</th>
                            <th className="px-4 py-3">Charges</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {feeData.map((fee, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 text-slate-700 font-medium">{fee.particular}</td>
                              <td className="px-4 py-3 text-slate-500">{fee.charge}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400">
                        *Charges may vary from lender to lender.
                      </div>
                    </div>
                  </div>
                </div>
            </section>

            <hr className="border-slate-200" />

            {/* SECTION: FAQs */}
            <section id="faqs" className="scroll-mt-32">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-600" /> Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                    {faqs.map((item, i) => (
                        <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                            <button 
                                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                className="w-full flex justify-between items-center p-5 text-left bg-white"
                            >
                                <span className="text-sm font-bold text-slate-800 pr-4">{item.q}</span>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${activeFaq === i ? 'rotate-180' : ''}`} />
                            </button>
                            <div 
                                className={`
                                    transition-all duration-300 ease-in-out bg-slate-50
                                    ${activeFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
                                `}
                            >
                                <div className="px-5 pb-5 pt-2">
                                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{item.a}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <div className="mt-8 bg-indigo-900 rounded-3xl p-8 text-center text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Ready to drive?</h3>
                    <p className="text-indigo-200 text-sm mb-6">Get up to ₹47 Lakh loan with 72 months tenure.</p>
                    <button 
                        onClick={handleApplyClick}
                        className="bg-white text-indigo-900 font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors w-full sm:w-auto"
                    >
                        Apply Now
                    </button>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
        
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CarLoanClient;