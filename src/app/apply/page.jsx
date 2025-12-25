"use client"

import React, { useState } from "react"
import Link from "next/link"
import BottomNav from "@/components/BottomNav"
import { 
  Banknote, 
  Home, 
  Car, 
  Briefcase, 
  HeartPulse, 
  ShieldCheck, 
  Umbrella, 
  ChevronRight, 
  FileText,
  Sparkles,
  Search,
  ArrowRight
} from "lucide-react"

export default function ApplyHubPage() {
  const [activeTab, setActiveTab] = useState('loans');
  const [query, setQuery] = useState('')

  const LOANS = [
    { href: '/loans/personal-loan', title: 'Personal Loan', hint: 'Quick approval', icon: Banknote, color: 'text-blue-600', bg: 'bg-blue-50' },
    { href: '/loans/home-loan', title: 'Home Loan', hint: 'Low interest', icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { href: '/loans/car-loan', title: 'Car Loan', hint: '100% funding', icon: Car, color: 'text-orange-600', bg: 'bg-orange-50' },
    { href: '/loans/business-loan', title: 'Business Loan', hint: 'Grow fast', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  const INSURANCE = [
    { href: '/insurance/health-insurance', title: 'Health Insurance', hint: 'Cashless claims at 5000+ hospitals', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
    { href: '/insurance/life-insurance', title: 'Life Insurance', hint: "Secure your family's future today", icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { href: '/insurance/general-insurance', title: 'General Insurance', hint: 'Full protection for your assets', icon: Umbrella, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ]

  const q = query.trim().toLowerCase()
  const filteredLoans = q ? LOANS.filter(item => (item.title + ' ' + item.hint).toLowerCase().includes(q)) : LOANS
  const filteredInsurance = q ? INSURANCE.filter(item => (item.title + ' ' + item.hint).toLowerCase().includes(q)) : INSURANCE

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-12 pt-0 md:pt-8">
      
      {/* Desktop Container */}
      <div className="max-w-6xl mx-auto md:px-6">

        {/* 1. Header Section */}
        <header className="bg-white md:bg-transparent px-5 pt-8 pb-5 md:p-0 rounded-b-[2rem] shadow-sm md:shadow-none border-b border-slate-100 md:border-none md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Apply Hub</h1>
              <p className="text-xs md:text-base text-slate-500 font-medium mt-1">Choose a financial product to get started</p>
            </div>
            
            {/* Search Bar - Full width mobile, fixed width desktop */}
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-3.5 top-2.5 md:top-3 h-4 w-4 md:h-5 md:w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-50 md:bg-white border border-slate-200 md:border-slate-200 rounded-xl py-2 md:py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs md:text-sm font-medium placeholder:text-slate-400 shadow-sm"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-0 mt-5 md:mt-0">
          
          {/* =========================================================
              LEFT COLUMN: Main Content (lg:col-span-8)
             ========================================================= */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Mobile Only Tabs (Hidden on Desktop) */}
            <div className="lg:hidden bg-slate-200/60 p-1 rounded-xl flex items-center mb-2">
              <button 
                onClick={() => setActiveTab('loans')}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'loans' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Loans
              </button>
              <button 
                onClick={() => setActiveTab('insurance')}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'insurance' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Insurance
              </button>
            </div>

            {/* LOANS SECTION */}
            <div className={`space-y-4 ${activeTab === 'loans' ? 'block' : 'hidden lg:block'}`}>
              <div className="hidden lg:flex items-center gap-2">
                 <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                 </div>
                 <h2 className="text-lg font-bold text-slate-900">Loan Products</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-5">
                {filteredLoans.length > 0 ? filteredLoans.map(item => (
                  <HubCard key={item.href} {...item} />
                )) : (
                  <div className="col-span-2 text-center text-sm text-slate-400 py-8">No loans found for "{query}"</div>
                )}
              </div>
            </div>

            {/* INSURANCE SECTION */}
            <div className={`space-y-4 ${activeTab === 'insurance' ? 'block' : 'hidden lg:block'}`}>
              <div className="hidden lg:flex items-center gap-2 pt-4 border-t border-slate-100">
                 <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <h2 className="text-lg font-bold text-slate-900">Insurance Plans</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-2.5 md:gap-4">
                {filteredInsurance.length > 0 ? filteredInsurance.map(item => (
                  <HubListCard key={item.href} {...item} />
                )) : (
                  <div className="text-center text-sm text-slate-400 py-8">No insurance found for "{query}"</div>
                )}
              </div>
            </div>

          </div>

          {/* =========================================================
              RIGHT COLUMN: Sidebar Widgets (lg:col-span-4)
             ========================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-first lg:order-last">
            
            {/* Resume Application Card - Sticky on Desktop */}
            <div className="lg:sticky lg:top-8">
              <Link 
                href="/dashboard/applications"
                className="group block relative overflow-hidden bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 active:scale-[0.99] transition-all duration-300"
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/5">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                       Drafts Available
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">Continue Application</h3>
                    <p className="text-xs md:text-sm text-slate-400 font-medium mt-1 leading-relaxed">
                      Pick up exactly where you left off. Your progress is saved automatically.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center text-xs font-bold text-white uppercase tracking-widest opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    Resume Now <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
              
              {/* Trust Indicators (Desktop Only) */}
              <div className="hidden lg:grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-900">98% Approval</p>
                      <p className="text-[10px] text-slate-500">High success rate</p>
                   </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-900">Secure Data</p>
                      <p className="text-[10px] text-slate-500">256-bit Encryption</p>
                   </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Footer Context */}
        <footer className="md:hidden text-center pt-6 pb-2">
           <p className="text-[10px] text-slate-400 font-medium">Select a category to begin</p>
        </footer>

      </div>
      
      {/* Mobile Bottom Nav */}
      <div>
        <BottomNav />
      </div>
    </main>
  )
}

// --- Optimized Components ---

function HubCard({ href, icon: Icon, color, bg, title, hint }) {
  return (
    <Link 
      href={href}
      className="group flex flex-col p-4 md:p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:shadow-slate-200/50 hover:border-blue-100 active:scale-[0.98] transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${bg} ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          <Icon size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
           <ArrowRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
      
      <div className="space-y-0.5 md:space-y-1">
        <p className="font-bold text-sm md:text-base text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{title}</p>
        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wide truncate">{hint}</p>
      </div>
    </Link>
  )
}

function HubListCard({ href, icon: Icon, color, bg, title, hint }) {
  return (
    <Link 
      href={href}
      className="group flex items-center p-3 md:p-4 bg-white border border-slate-100 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 active:scale-[0.99] transition-all duration-300"
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        <Icon size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
      </div>
      <div className="flex-1 ml-3 md:ml-4 min-w-0">
        <p className="font-bold text-xs md:text-base text-slate-900 truncate tracking-tight group-hover:text-blue-600 transition-colors">{title}</p>
        <p className="text-[10px] md:text-xs text-slate-500 truncate font-medium">{hint}</p>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
        <ChevronRight size={16} className="md:w-5 md:h-5" />
      </div>
    </Link>
  )
}