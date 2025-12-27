"use client"

import React, { useState } from "react"
import Link from "next/link"
import BottomNav from "@/components/BottomNav"
import { 
  Banknote, Home, Car, Briefcase, HeartPulse, ShieldCheck, 
  Umbrella, ChevronRight, FileText, Sparkles, Search, ArrowRight, 
  Zap, Clock, Coins, GraduationCap, Factory, Sun, Building2, 
  CreditCard, RefreshCw, Layers
} from "lucide-react"

export default function ApplyHubPage() {
  const [activeTab, setActiveTab] = useState('loans');
  const [query, setQuery] = useState('')

  // Full List of Loan Products
  const LOANS = [
    { 
      href: '/loans/personal-loan', 
      title: 'Personal Loan', 
      hint: 'Get up to ₹40 Lakhs', 
      promo: '⚡ Instant Approval',
      icon: Banknote, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      href: '/loans/business-loan', 
      title: 'Business Loan', 
      hint: 'Collateral Free Capital', 
      promo: '🚀 Disbursal in 24h',
      icon: Briefcase, 
      color: 'text-slate-700', 
      bg: 'bg-slate-100' 
    },
    { 
      href: '/loans/home-loan', 
      title: 'Home Loan', 
      hint: 'Lowest Interest Rates', 
      promo: '🏠 Paperless Process',
      icon: Home, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      href: '/loans/gold-loan', 
      title: 'Gold Loan', 
      hint: 'Cash against Ornaments', 
      promo: '💰 30 Mins Cash',
      icon: Coins, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      href: '/loans/education-loan', 
      title: 'Education Loan', 
      hint: 'Study in India or Abroad', 
      promo: '🎓 100% Financing',
      icon: GraduationCap, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      href: '/loans/loan-against-property', 
      title: 'Loan Against Property', 
      hint: 'Unlock Property Value', 
      promo: '🏢 High LTV Ratio',
      icon: Building2, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      href: '/loans/machinery-loan', 
      title: 'Machinery Loan', 
      hint: 'Equipment Finance', 
      promo: '⚙️ MSME Special',
      icon: Factory, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
    { 
      href: '/loans/solar-loan', 
      title: 'Solar Loan', 
      hint: 'Rooftop Solar Finance', 
      promo: '☀️ Zero Electricity Bill',
      icon: Sun, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      href: '/car-loan/new', 
      title: 'New Car Loan', 
      hint: 'Drive your Dream Car', 
      promo: '🚗 100% On-Road',
      icon: Car, 
      color: 'text-red-600', 
      bg: 'bg-red-50' 
    },
    { 
      href: '/car-loan/used', 
      title: 'Used Car Loan', 
      hint: 'Pre-owned Vehicles', 
      promo: '🗝️ Quick Transfer',
      icon: Car, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50' 
    },
    { 
      href: '/car-loan/refinance', 
      title: 'Car Refinance', 
      hint: 'Reduce your Car EMI', 
      promo: '📉 Cash Top-up',
      icon: RefreshCw, 
      color: 'text-cyan-600', 
      bg: 'bg-cyan-50' 
    },
    { 
      href: '/loans/credit-cards', 
      title: 'Credit Cards', 
      hint: 'Premium Rewards', 
      promo: '💳 Lifetime Free',
      icon: CreditCard, 
      color: 'text-pink-600', 
      bg: 'bg-pink-50' 
    },
  ]

  // Full List of Insurance Products
  const INSURANCE = [
    { 
      href: '/insurance/health-insurance', 
      title: 'Health Insurance', 
      hint: 'Cashless claims at 5000+ hospitals', 
      promo: '🛡️ Policy in 2 mins',
      icon: HeartPulse, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50' 
    },
    { 
      href: '/insurance/life-insurance', 
      title: 'Life Insurance', 
      hint: "Secure your family's future today", 
      promo: '✅ Tax Benefits',
      icon: ShieldCheck, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      href: '/insurance/general-insurance', 
      title: 'General Insurance', 
      hint: 'Full protection for assets (Home, Travel, etc.)', 
      promo: '⚡ Instant Cover',
      icon: Umbrella, 
      color: 'text-cyan-600', 
      bg: 'bg-cyan-50' 
    },
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
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs md:text-sm text-slate-500 font-medium">98% Approval Rate today</p>
              </div>
            </div>
            
            {/* Search Bar */}
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
            
            {/* Mobile Only Tabs */}
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
              <div className="hidden lg:flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Layers className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Loan Products</h2>
                 </div>
                 <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                    ⚡ Fast Disbursal Active
                 </span>
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
            
            {/* Resume Application Card */}
            <div className="lg:sticky lg:top-8">
              <Link 
                href="/dashboard/applications"
                className="group block relative overflow-hidden bg-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 active:scale-[0.99] transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/5">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm animate-pulse">
                       2 Drafts Pending
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">Continue Application</h3>
                    <p className="text-xs md:text-sm text-slate-400 font-medium mt-1 leading-relaxed">
                      Pick up exactly where you left off. Your progress is saved.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center text-xs font-bold text-white uppercase tracking-widest opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    Resume Now <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
              
              {/* Trust Indicators */}
              <div className="hidden lg:grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-900">2 Mins</p>
                      <p className="text-[10px] text-slate-500">Quick process</p>
                   </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-900">Secure</p>
                      <p className="text-[10px] text-slate-500">Encrypted data</p>
                   </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Footer Context */}
        <footer className="md:hidden text-center pt-6 pb-2">
           <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[10px] font-medium">100% Secure & Paperless</span>
           </div>
        </footer>

      </div>
      
      <div>
        <BottomNav />
      </div>
    </main>
  )
}

// --- Optimized Components ---

function HubCard({ href, icon: Icon, color, bg, title, hint, promo }) {
  return (
    <Link 
      href={href}
      className="group flex flex-col p-4 md:p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:shadow-slate-200/50 hover:border-blue-100 active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${bg} ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
        </div>
        {/* Aggressive Promo Tag */}
        {promo && (
          <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors whitespace-nowrap">
            {promo}
          </span>
        )}
      </div>
      
      <div className="space-y-0.5 md:space-y-1 mt-auto">
        <p className="font-bold text-sm md:text-base text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{title}</p>
        <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">{hint}</p>
      </div>
    </Link>
  )
}

function HubListCard({ href, icon: Icon, color, bg, title, hint, promo }) {
  return (
    <Link 
      href={href}
      className="group flex items-center p-3 md:p-4 bg-white border border-slate-100 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 active:scale-[0.99] transition-all duration-300"
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        <Icon size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
      </div>
      <div className="flex-1 ml-3 md:ml-4 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
           <p className="font-bold text-xs md:text-base text-slate-900 truncate tracking-tight group-hover:text-blue-600 transition-colors">{title}</p>
           {/* Aggressive Inline Tag for List View */}
           {promo && (
             <span className="hidden sm:inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
               {promo}
             </span>
           )}
        </div>
        <p className="text-[10px] md:text-xs text-slate-500 truncate font-medium">{hint}</p>
        {/* Mobile-only tagline below */}
        {promo && <p className="sm:hidden text-[9px] font-bold text-emerald-600 mt-0.5">{promo}</p>}
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
        <ChevronRight size={16} className="md:w-5 md:h-5" />
      </div>
    </Link>
  )
}