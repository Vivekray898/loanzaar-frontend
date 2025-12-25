"use client"

import React, { useState } from "react"
import Link from "next/link"
import NavBar from "@/components/NavBar"
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
  Search
} from "lucide-react"

export default function ApplyHubPage() {
  const [activeTab, setActiveTab] = useState('loans');
  const [query, setQuery] = useState('')

  const LOANS = [
    { href: '/loans/personal-loan', title: 'Personal', hint: 'Quick approval', icon: Banknote, color: 'text-blue-600', bg: 'bg-blue-50' },
    { href: '/loans/home-loan', title: 'Home', hint: 'Low interest', icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { href: '/loans/car-loan', title: 'Car Loan', hint: '100% funding', icon: Car, color: 'text-orange-600', bg: 'bg-orange-50' },
    { href: '/loans/business-loan', title: 'Business', hint: 'Grow fast', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      <NavBar />
      
      {/* 1. Compact Dashboard Header */}
      <header className="bg-white px-5 pt-8 pb-5 rounded-b-[2rem] shadow-sm border-b border-slate-100">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Apply</h1>
              <p className="text-xs text-slate-500 font-medium">Choose a financial product</p>
            </div>
            <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Compact Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-6">
        
        {/* 2. Priority Action Card (Resume) - Height Reduced */}
        <section>
          <Link 
            href="/dashboard/applications"
            className="group block relative overflow-hidden bg-slate-900 rounded-2xl p-4 shadow-lg shadow-slate-200/50 active:scale-[0.98] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Continue application</h3>
                  <p className="text-[10px] text-slate-400 font-medium tracking-wide">Pick up where you left off</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </section>

        {/* 3. Interactive Switcher - Slimmer */}
        <section>
          <div className="bg-slate-200/60 p-1 rounded-xl flex items-center mb-4">
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

          {/* 4. Categorized Grid Content - Tighter Grid */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'loans' ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredLoans.length > 0 ? filteredLoans.map(item => (
                  <HubCard key={item.href} {...item} icon={item.icon} color={item.color} bg={item.bg} />
                )) : (
                  <div className="col-span-2 text-center text-sm text-slate-400">No results for "{query}"</div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredInsurance.length > 0 ? filteredInsurance.map(item => (
                  <HubListCard key={item.href} {...item} icon={item.icon} color={item.color} bg={item.bg} />
                )) : (
                  <div className="text-center text-sm text-slate-400">No results for "{query}"</div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 5. Support Context - Smaller */}
        <footer className="text-center pt-2">
           <p className="text-[10px] text-slate-400 font-medium">Select a category to begin</p>
        </footer>

      </div>
      
      <BottomNav />
    </main>
  )
}

// --- Optimized Components ---

function HubCard({ href, icon: Icon, color, bg, title, hint }) {
  return (
    <Link 
      href={href}
      className="group flex flex-col p-3.5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:shadow-slate-200/50 active:scale-[0.97] transition-all duration-300"
    >
      {/* Icon Container: Smaller (w-9 h-9) */}
      <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5">
        <p className="font-bold text-xs text-slate-900 leading-tight">{title}</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide truncate">{hint}</p>
      </div>
    </Link>
  )
}

function HubListCard({ href, icon: Icon, color, bg, title, hint }) {
  return (
    <Link 
      href={href}
      className="group flex items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-300"
    >
      {/* Icon Container: Smaller (w-9 h-9) */}
      <div className={`w-9 h-9 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="flex-1 ml-3 min-w-0">
        <p className="font-bold text-xs text-slate-900 truncate tracking-tight">{title}</p>
        <p className="text-[10px] text-slate-500 truncate font-medium">{hint}</p>
      </div>
      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
    </Link>
  )
}