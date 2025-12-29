'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Banknote, Briefcase, Home, Coins, GraduationCap, Building2, Factory, Sun, Car, RefreshCw, CreditCard,
  Calculator, BookOpen, Layers, Sparkles, ChevronRight, ArrowRight, CheckCircle2, TrendingUp, AlertCircle,
  Clock, Phone, ChevronDown, LucideIcon
} from 'lucide-react'
 
import BottomNav from '@/components/BottomNav'

// --- Interfaces ---

interface LoanItem {
  title: string;
  url: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  hint: string;
  promo?: string;
}

interface ToolItem {
  title: string;
  url: string;
  icon: LucideIcon;
  desc: string;
}

interface FAQItem {
  q: string;
  a: string;
}

// --- Data Configuration ---
const loanOptions: LoanItem[] = [
  { 
    title: 'Personal Loan', url: '/loans/personal-loan', icon: Banknote, 
    color: 'text-blue-600', bg: 'bg-blue-50', 
    hint: 'Get up to ₹40 Lakhs', promo: '⚡ Instant' 
  },
  { 
    title: 'Business Loan', url: '/loans/business-loan', icon: Briefcase, 
    color: 'text-slate-700', bg: 'bg-slate-100', 
    hint: 'Collateral Free Capital', promo: '🚀 24h Disbursal' 
  },
  { 
    title: 'Home Loan', url: '/loans/home-loan', icon: Home, 
    color: 'text-emerald-600', bg: 'bg-emerald-50', 
    hint: 'Lowest Interest Rates', promo: '🏠 Paperless' 
  },
  { 
    title: 'Gold Loan', url: '/loans/gold-loan', icon: Coins, 
    color: 'text-amber-600', bg: 'bg-amber-50', 
    hint: 'Cash against Ornaments', promo: '💰 30 Mins' 
  },
  { 
    title: 'Education Loan', url: '/loans/education-loan', icon: GraduationCap, 
    color: 'text-purple-600', bg: 'bg-purple-50', 
    hint: 'Study India or Abroad', promo: '🎓 100% Fund' 
  },
  { 
    title: 'Property Loan', url: '/loans/loan-against-property', icon: Building2, 
    color: 'text-indigo-600', bg: 'bg-indigo-50', 
    hint: 'Unlock Property Value', promo: '🏢 High LTV' 
  },
  { 
    title: 'Machinery Loan', url: '/loans/machinery-loan', icon: Factory, 
    color: 'text-orange-600', bg: 'bg-orange-50', 
    hint: 'Equipment Finance', promo: '⚙️ MSME' 
  },
  { 
    title: 'Solar Loan', url: '/loans/solar-loan', icon: Sun, 
    color: 'text-green-600', bg: 'bg-green-50', 
    hint: 'Rooftop Solar Finance', promo: '☀️ Green Energy' 
  },
  { 
    title: 'New Car Loan', url: '/car-loan/new-car-loan', icon: Car, 
    color: 'text-red-600', bg: 'bg-red-50', 
    hint: 'Drive your Dream Car', promo: '🚗 100% On-Road' 
  },
  { 
    title: 'Used Car Loan', url: '/car-loan/used-car-loan', icon: Car, 
    color: 'text-rose-600', bg: 'bg-rose-50', 
    hint: 'Pre-owned Vehicles', promo: '🗝️ Quick Transfer' 
  },
  { 
    title: 'Car Refinance', url: '/car-loan/car-refinance', icon: RefreshCw, 
    color: 'text-cyan-600', bg: 'bg-cyan-50', 
    hint: 'Reduce your Car EMI', promo: '📉 Cash Top-up' 
  },
  { 
    title: 'Credit Cards', url: '/loans/credit-cards', icon: CreditCard, 
    color: 'text-pink-600', bg: 'bg-pink-50', 
    hint: 'Premium Rewards', promo: '💳 Lifetime Free' 
  },
]

const toolOptions: ToolItem[] = [
  { title: 'EMI Calculator', url: '/emi-calculator', icon: Calculator, desc: 'Plan repayments' },
  { title: 'Check Eligibility', url: '/eligibility', icon: CheckCircle2, desc: 'Know your limit' },
  { title: 'Compare Loans', url: '/compare', icon: Layers, desc: 'Side-by-side' },
  { title: 'Financial Guide', url: '/blogs', icon: BookOpen, desc: 'Expert tips' },
]

const faqs: FAQItem[] = [
  { q: 'What is the minimum CIBIL score required?', a: 'Most lenders prefer a CIBIL score of 750+. However, some NBFCs offer loans to individuals with scores of 650+ at slightly higher interest rates.' },
  { q: 'How long does loan approval take?', a: 'For personal loans, approval can be instant or take up to 24 hours. Home and business loans may take 3-7 days for verification.' },
  { q: 'Can I foreclose my loan early?', a: 'Yes, most loans allow foreclosure after a lock-in period (usually 6-12 months). Foreclosure charges may apply ranging from 0% to 4%.' },
  { q: 'Is collateral required for all loans?', a: 'No. Personal loans, business loans (under CGTMSE), and credit cards are unsecured. Home, gold, and property loans require collateral.' },
]

export default function LoansClient() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-12 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      <h1 className="sr-only">
        Apply for Personal, Home, and Business Loans Online - Loanzaar India
      </h1>

      <div className="max-w-7xl mx-auto w-full">

        {/* --- Header Section --- */}
        <header className="bg-white px-5 pt-8 pb-8 md:pt-12 md:pb-12 md:px-10 rounded-b-[2rem] md:rounded-[3rem] lg:mx-6 lg:mt-6 shadow-sm border-b md:border border-slate-100 relative overflow-hidden">
          
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            
            {/* Title Block */}
            <div className="flex flex-col gap-3 flex-1 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700">
                  <Banknote className="w-6 h-6" />
                </div>
                <span className="text-blue-700 font-bold tracking-wider text-xs md:text-sm uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  Easy Finance
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Loan <span className="text-blue-600 inline-block">Marketplace</span>
              </h2>
              
              <p className="text-slate-500 font-medium text-sm sm:text-base md:text-lg leading-relaxed max-w-lg">
                Choose from 40+ lending partners. Get instant approvals, lowest interest rates, and flexible repayment tenures.
              </p>
            </div>

            {/* CTA Card */}
            <div className="w-full lg:w-auto lg:min-w-[380px]">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-1 shadow-2xl shadow-blue-200/50 group cursor-pointer transform transition-all hover:-translate-y-1">
                <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-5 flex items-center gap-5 relative overflow-hidden">
                  
                  {/* Card Glow Effect */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-2xl rounded-full -mr-5 -mt-5"></div>

                  <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 shrink-0">
                    <Sparkles className="w-6 h-6 text-blue-300" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-base md:text-lg truncate">Check Eligibility</h4>
                    <p className="text-blue-100/70 text-xs md:text-sm truncate">Free credit report check</p>
                  </div>
                  
                  <div className="bg-white text-blue-900 p-2.5 rounded-lg shrink-0 group-hover:bg-blue-50 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* --- Main Content --- */}
        <main className="px-4 md:px-10 mt-8 md:mt-10 space-y-16 lg:space-y-24">

          {/* 1. Category Grid - 2 Cols Mobile */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 px-1 gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Loan Products</h2>
              {/* UPDATED LINK: Now passes tab=loans query parameter */}
              <Link href="/apply?tab=loans" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all loans <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* CHANGED: grid-cols-2 for mobile, gap-3 for mobile to save space */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 xl:gap-6">
              {loanOptions.map((opt, i) => (
                <Link 
                  key={i} 
                  href={opt.url} 
                  // Optimized card padding and rounding for 2-column mobile view
                  className={`group relative flex flex-col p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                >
                  {/* Hover Gradient Background */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${opt.color.replace('text', 'bg')}`} />

                  <div className="flex items-start justify-between mb-4 md:mb-6 z-10">
                    {/* Optimized Icon Size for Mobile */}
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${opt.bg} ${opt.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                      <opt.icon className="w-5 h-5 md:w-7 md:h-7" />
                    </div>
                    {opt.promo && (
                      <span className="text-[9px] md:text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-md shadow-sm whitespace-nowrap">
                        {opt.promo}
                      </span>
                    )}
                  </div>
                  
                  <div className="z-10 mt-auto">
                    {/* Optimized Typography for Mobile */}
                    <h3 className="font-bold text-slate-900 text-sm md:text-lg leading-tight group-hover:text-blue-700 transition-colors">{opt.title}</h3>
                    <p className="text-[10px] md:text-sm text-slate-500 mt-1 font-medium leading-tight">{opt.hint}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 2. Quick Tools */}
          <section>
            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 pl-1">Financial Tools</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {toolOptions.map((tool, i) => (
                <Link 
                  key={i} 
                  href={tool.url} 
                  className="bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 p-4 rounded-2xl group transition-all duration-200 flex flex-col items-center text-center md:items-start md:text-left gap-3 md:gap-2 active:scale-95"
                >
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-600 group-hover:text-blue-600 group-hover:bg-white transition-colors shadow-sm">
                    <tool.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <span className="block text-sm md:text-base font-bold text-slate-800 group-hover:text-blue-900">{tool.title}</span>
                    <span className="hidden md:block text-xs text-slate-500 mt-0.5">{tool.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 3. SEO & Content Section */}
          <article className="border-t border-slate-200 pt-10 md:pt-16">
            <div className="grid lg:grid-cols-12 gap-10 xl:gap-16">
              
              {/* Left Column: Semantic Content */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-12">
                
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-5">
                    Smart Borrowing Starts Here
                  </h2>
                  <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
                    A loan isn't just debt; it's a tool to achieve your dreams. Whether you are expanding your business, 
                    buying your dream home, or consolidating debt, we help you find the perfect match from India's 
                    top banks and NBFCs.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-xs md:text-sm font-medium text-slate-500">
                    {['#LowInterest', '#FlexibleTenure', '#QuickDisbursal', '#NoHiddenCharges'].map(tag => (
                      <span key={tag} className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{tag}</span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Why Apply via Loanzaar?</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { t: 'Instant Approval', d: 'Paperless process with approval in minutes.', i: CheckCircle2 },
                      { t: 'Best Rates', d: 'Compare interest rates starting at 10.25% p.a.', i: TrendingUp },
                      { t: 'Expert Advice', d: 'Free consultation to choose the right product.', i: Phone },
                      { t: 'Secure Data', d: 'Your financial data is encrypted and safe.', i: Sparkles },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                          <item.i className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm md:text-base">{item.t}</h4>
                          <p className="text-xs md:text-sm text-slate-500 mt-1 leading-relaxed">{item.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: FAQ Sidebar */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="lg:sticky lg:top-8 bg-slate-50/50 rounded-3xl lg:p-6 lg:border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" /> 
                    Common Questions
                  </h3>
                  
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div 
                        key={i} 
                        className={`border rounded-xl transition-all duration-300 overflow-hidden ${activeFaq === i ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                      >
                        <button 
                          onClick={() => toggleFaq(i)} 
                          className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                          aria-expanded={activeFaq === i}
                        >
                          <span className={`text-sm font-bold pr-4 ${activeFaq === i ? 'text-blue-900' : 'text-slate-700'}`}>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-blue-600' : ''}`} />
                        </button>
                        
                        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${activeFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                          <div className="overflow-hidden">
                            <div className="px-4 pb-4 pt-0">
                              <p className="text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                     <Phone className="w-5 h-5 text-blue-600" />
                     <div>
                        <p className="text-xs font-bold text-blue-800">Need help deciding?</p>
                        <p className="text-[10px] text-blue-600">Talk to our certified experts for free</p>
                     </div>
                  </div>

                </div>
              </div>

            </div>
          </article>

        </main>
      </div>

      {/* Bottom Nav */}
      <div>
        <BottomNav />
      </div>
    </div>
  )
}