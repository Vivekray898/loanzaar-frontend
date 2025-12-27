"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Banknote, Home, Briefcase, Building, Coins,
  GraduationCap, Factory, Sun, Car, ShoppingCart,
  RefreshCw, Calculator, FileText, BookOpen,
  Sparkles, ChevronRight, CheckCircle2, AlertCircle,
  TrendingUp, Percent, ChevronDown
} from 'lucide-react'

import BottomNav from '@/components/BottomNav'

const loanOptions = [
  { title: 'Personal Loan', url: '/loans/personal-loan', icon: Banknote, color: 'text-orange-600', bg: 'bg-orange-50' },
  { title: 'Home Loan', url: '/loans/home-loan', icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Business Loan', url: '/loans/business-loan', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Loan Against Property', url: '/loans/loan-against-property', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: 'Gold Loan', url: '/loans/gold-loan', icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Education Loan', url: '/loans/education-loan', icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50' },
  { title: 'Machinery Loan', url: '/loans/machinery-loan', icon: Factory, color: 'text-slate-700', bg: 'bg-slate-100' },
  { title: 'Solar Loan', url: '/loans/solar-loan', icon: Sun, color: 'text-yellow-600', bg: 'bg-yellow-50' },
]

const carLoanOptions = [
  { title: 'New Car Loan', url: '/car-loan/new', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Used Car Loan', url: '/car-loan/used', icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
  { title: 'Car Refinance', url: '/car-loan/refinance', icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const toolOptions = [
  { title: 'EMI Calculator', url: '/calculators', icon: Calculator },
  { title: 'Credit Score', url: '/credit-score-guide', icon: FileText },
  { title: 'Blogs', url: '/blogs', icon: BookOpen },
]

const faqs = [
  { q: 'What is the minimum CIBIL score for a personal loan?', a: 'Most banks prefer a CIBIL score of 750 or above for quick approval and lower interest rates. However, some NBFCs offer loans to scores around 650-700 at slightly higher rates.' },
  { q: 'Can I apply for a loan online without visiting the bank?', a: 'Yes, Loanzaar allows you to compare and apply for loans entirely online. You can upload documents digitally, and disbursement often happens within 24-48 hours.' },
  { q: 'What documents are required for a home loan?', a: 'Standard documents include Identity Proof (Aadhaar/PAN), Address Proof, Income Proof (Salary slips/ITR), and Property documents (Agreement to Sell, Title Deed).' },
  { q: 'How does a Business Loan differ from a Personal Loan?', a: 'Business loans are designed for commercial use (expansion, inventory, machinery) and can be secured or unsecured. They often offer larger amounts and longer tenures compared to personal loans.' },
]

export default function LoansClient() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-12 text-slate-900">
      
      {/* 
        SEO GOLD: Hidden H1
        Google reads this, Users see the design below.
      */}
      <h1 className="sr-only">
        Apply for Loans Online - Compare Personal, Home & Business Loans in India
      </h1>

      <div className="max-w-6xl mx-auto w-full">

        {/* Header Section */}
        <header className="bg-white px-6 pt-12 pb-8 md:pt-16 md:pb-10 md:px-8 rounded-b-[2.5rem] md:rounded-[2.5rem] md:mt-4 md:mx-4 shadow-sm border-b md:border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            
            <div className="flex justify-between items-center md:items-start md:flex-col md:gap-4 flex-1">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight" aria-hidden="true">Loans Marketplace</h2>
                <p className="text-sm md:text-base text-slate-500 font-medium mt-1 md:mt-2">Compare & apply for quick financing</p>
              </div>
              <div className="h-10 w-10 md:hidden bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                <Banknote className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="w-full md:w-auto md:min-w-[320px]">
              <div className="bg-slate-900 hover:bg-slate-800 transition-colors rounded-2xl p-5 text-white shadow-xl cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md group-hover:bg-white/20 transition-colors">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">Loan Eligibility</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Check your limit in 2 mins</p>
                  </div>
                  <button className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg group-hover:bg-slate-100 transition-colors">Check</button>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-6 md:px-8 mt-8 md:mt-12 space-y-12">

          {/* Popular Loans Grid */}
          <section>
            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Popular Loans</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {loanOptions.map((opt, i) => (
                <Link 
                  key={i} 
                  href={opt.url} 
                  className="group flex flex-col p-5 md:p-6 rounded-[1.25rem] bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 hover:-translate-y-1 active:scale-95 transition-all duration-300"
                >
                  <div className={`w-11 h-11 md:w-14 md:h-14 rounded-2xl ${opt.bg} ${opt.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <opt.icon className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-[15px] md:text-lg group-hover:text-blue-700 transition-colors">
                    {opt.title}
                  </h3>
                  <div className="hidden md:flex items-center gap-1 mt-2 text-xs font-semibold text-slate-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                    Apply Now <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Car Loan Section */}
          <section>
            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Car Financing</h2>
            <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-6">
              {carLoanOptions.map((opt, i) => (
                <Link 
                  key={i} 
                  href={opt.url} 
                  className="group flex items-center justify-between p-4 md:p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-slate-200 active:scale-[0.98] transition-all"
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${opt.bg} ${opt.color} flex items-center justify-center shrink-0`}>
                        <opt.icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <span className="font-bold text-slate-700 text-sm md:text-base group-hover:text-slate-900">{opt.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </section>

          {/* Tools Section */}
          <section className="pb-4">
            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Loan Tools</h2>
            <div className="flex md:flex-wrap gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mr-6 md:mr-0 pr-6 md:pr-0 scrollbar-hide">
              {toolOptions.map((tool, i) => (
                <Link 
                  key={i} 
                  href={tool.url} 
                  className="flex-shrink-0 bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 px-4 py-2.5 md:py-3 md:px-5 rounded-xl text-xs md:text-sm font-bold text-slate-600 hover:text-blue-700 flex items-center gap-2 transition-all"
                >
                  <tool.icon className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  {tool.title}
                </Link>
              ))}
            </div>
          </section>

          {/* 
            ===========================================
            SEO CONTENT BLOCK
            Designed to rank for "Loans in India", "Low Interest", "Apply Online".
            ===========================================
          */}
          <article className="border-t border-slate-200 pt-10 pb-6">
            
            {/* Intro SEO Text */}
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-8 space-y-8">
                <section>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                    Compare & Apply for the Best Loans in India
                  </h2>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    Looking for financial support? At Loanzaar, we help you compare interest rates, processing fees, and tenure options from India’s top banks and NBFCs. Whether you need a 
                    <span className="font-semibold text-blue-700"> Personal Loan</span> for emergencies, a 
                    <span className="font-semibold text-blue-700"> Home Loan</span> for your dream house, or a 
                    <span className="font-semibold text-blue-700"> Business Loan</span> to expand operations, we make the process 100% digital and hassle-free.
                  </p>
                </section>

                {/* Features / Benefits (Keywords: Paperless, Low Interest, Instant) */}
                <section className="grid sm:grid-cols-2 gap-4">
                  {[
                    { t: 'Low Interest Rates', d: 'Interest rates starting from 8.5% p.a.*', i: Percent },
                    { t: 'Instant Approval', d: 'Get loan sanction letters in minutes.', i: Sparkles },
                    { t: 'Paperless Process', d: '100% digital application & KYC.', i: FileText },
                    { t: 'High Eligibility', d: 'Loans available for low CIBIL scores.', i: TrendingUp },
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-3 items-start p-4 bg-white border border-slate-100 rounded-xl">
                      <feat.i className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{feat.t}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{feat.d}</p>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Detailed Services (Long-tail keywords) */}
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Types of Loans Available</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <p className="text-sm text-slate-600">
                        <strong className="text-slate-800">Unsecured Loans:</strong> Personal loans and education loans that do not require collateral. Ideal for quick funds.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <p className="text-sm text-slate-600">
                        <strong className="text-slate-800">Secured Loans:</strong> Home loans, car loans, and loans against property where you pledge an asset for lower interest rates.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <p className="text-sm text-slate-600">
                        <strong className="text-slate-800">Business Finance:</strong> Working capital loans, machinery loans, and MSME loans to boost your business growth.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* FAQ Sidebar (Rich Snippet Target) */}
              <div className="lg:col-span-4">
                <div className="bg-slate-100/50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    Loan FAQs
                  </h3>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                        <button 
                          onClick={() => toggleFaq(i)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="text-xs font-bold text-slate-800 pr-2">{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180 text-blue-600' : ''}`} />
                        </button>
                        {activeFaq === i && (
                          <div className="px-4 pb-4">
                            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-50">
                              {faq.a}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </article>

        </main>
      </div>

      <div> 
        <BottomNav />
      </div>
    </div>
  )
}