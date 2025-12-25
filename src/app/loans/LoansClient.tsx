"use client"

import React from 'react'
import Link from 'next/link'
import {
  Banknote, Home, Briefcase, Building, Coins,
  GraduationCap, Factory, Sun, Car, ShoppingCart,
  RefreshCw, Calculator, FileText, BookOpen,
  Sparkles, ChevronRight
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

export default function LoansClient() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-12">
      
      {/* 
        Container for large screens 
        - max-w-6xl constraints width
        - mx-auto centers it
      */}
      <div className="max-w-6xl mx-auto w-full">

        {/* Header Section */}
        <header className="bg-white px-6 pt-12 pb-8 md:pt-16 md:pb-10 md:px-8 rounded-b-[2.5rem] md:rounded-[2.5rem] md:mt-4 md:mx-4 shadow-sm border-b md:border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            
            {/* Title Block */}
            <div className="flex justify-between items-center md:items-start md:flex-col md:gap-4 flex-1">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">Loans Marketplace</h1>
                <p className="text-sm md:text-base text-slate-500 font-medium mt-1 md:mt-2">Compare & apply for quick financing</p>
              </div>
              <div className="h-10 w-10 md:hidden bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                <Banknote className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {/* Credit Banner - Full width on mobile, Compact card on desktop */}
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
            {/* 2 cols on mobile, 3 on tablet, 4 on desktop */}
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
            {/* Stack on mobile, Grid on desktop */}
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
          <section className="pb-8">
            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Loan Tools</h2>
            {/* Horizontal Scroll mobile -> Flex Wrap desktop */}
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

        </main>
      </div>

      {/* Hide BottomNav on md+ screens */}
{/* Now visible on all screen sizes */}
      <div> 
        <BottomNav />
      </div>
    </div>
  )
}