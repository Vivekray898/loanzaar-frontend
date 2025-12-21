'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Banknote, ShieldCheck, CreditCard, ArrowLeftRight,
  ChevronRight, Sparkles, X, Home, Briefcase,
  HeartPulse, Umbrella, Landmark, Building, Layers,
  Calculator, BookOpen, GraduationCap, FileText,
  Coins, Factory, Sun, Car, RefreshCw, ShoppingCart
} from 'lucide-react'


// --- 1. Extracted & Reordered Data ---

// Order: Most Common -> Least Common
const loanOptions = [
  { title: 'Personal Loan', url: '/personal-loan', icon: Banknote, color: 'text-orange-600', bg: 'bg-orange-50' },
  { title: 'Home Loan', url: '/home-loan', icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Business Loan', url: '/business-loan', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Loan Against Property', url: '/loan-against-property', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: 'Gold Loan', url: '/gold-loan', icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Education Loan', url: '/education-loan', icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50' },
  { title: 'Machinery Loan', url: '/machinery-loan', icon: Factory, color: 'text-slate-700', bg: 'bg-slate-100' },
  { title: 'Solar Loan', url: '/solar-loan', icon: Sun, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { title: 'Mutual Funds', url: '/mutual-funds', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const insuranceOptions = [
  { title: 'Life Insurance', url: '/insurance/life-insurance', icon: Umbrella, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { title: 'Health Insurance', url: '/insurance/health-insurance', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
  { title: 'General Insurance', url: '/insurance/general-insurance', icon: ShieldCheck, color: 'text-slate-600', bg: 'bg-slate-100' },
  { title: 'All Insurance', url: '/insurance/all-insurance', icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
]

// New Car Loan Options
const carLoanOptions = [
  { title: 'New Car Loan', url: '/car-loan/new', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Used Car Loan', url: '/car-loan/used', icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
  { title: 'Car Refinance', url: '/car-loan/refinance', icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const toolOptions = [
  { title: 'EMI Calculator', url: '/calculators', icon: Calculator },
  { title: 'Credit Score', url: '/credit-score-guide', icon: FileText },
  { title: 'Blogs', url: '/blogs', icon: BookOpen },
  { title: 'Glossary', url: '/glossary', icon: GraduationCap },
]

const categories = [
  {
    id: 'loans',
    title: 'Loans',
    subtitle: 'Personal, Home & Business',
    action: 'sheet',
    icon: Banknote,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    borderColor: 'border-blue-100'
  },
  {
    id: 'car-loans', // New Category
    title: 'Car Loans',
    subtitle: 'New, Used & Refinance',
    action: 'sheet',
    icon: Car,
    color: 'text-red-600',
    bg: 'bg-red-50',
    borderColor: 'border-red-100'
  },
  {
    id: 'insurance',
    title: 'Insurance',
    subtitle: 'Health, Life & General',
    action: 'sheet',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    borderColor: 'border-emerald-100'
  },
  {
    title: 'Credit Cards',
    subtitle: 'Best rewards & cashback',
    href: '/credit-cards', 
    icon: CreditCard,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    borderColor: 'border-purple-100'
  },
  {
    title: 'Compare',
    subtitle: 'Side-by-side analysis',
    href: '/compare',
    icon: ArrowLeftRight,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    borderColor: 'border-orange-100'
  }
]

export default function ProductsPage() {
  const [activeSheet, setActiveSheet] = useState(null)

  const closeSheet = () => setActiveSheet(null)

  useEffect(() => {
    if (activeSheet) {
      document.body.style.overflow = 'hidden' 
    } else {
      document.body.style.overflow = 'unset' 
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [activeSheet])

  // Helper to pick the right list based on active sheet
  const getSheetContent = () => {
    switch(activeSheet) {
      case 'loans': return { title: 'Select Product', options: loanOptions }
      case 'insurance': return { title: 'Select Insurance', options: insuranceOptions }
      case 'car-loans': return { title: 'Car Loan Type', options: carLoanOptions }
      default: return { title: '', options: [] }
    }
  }

  const { title: sheetTitle, options: currentOptions } = getSheetContent()

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 relative overflow-hidden">
      
      {/* 1. App Header */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 relative z-10">
        <div className="flex justify-between items-center mb-6">
           <div>
             <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Explore</h1>
             <p className="text-sm text-slate-500 font-medium mt-1">Find the right product for you</p>
           </div>
           <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
              <span className="text-lg">🧭</span>
           </div>
        </div>

        {/* Pro Banner */}
        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-200">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
           <div className="relative z-10 flex items-center gap-4">
             <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10">
               <Sparkles className="w-5 h-5 text-yellow-300" />
             </div>
             <div className="flex-1">
                <h4 className="font-bold text-sm">Credit Report</h4>
                <p className="text-xs text-slate-300 mt-0.5">Updated 2 days ago</p>
             </div>
             <button className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
               Check
             </button>
           </div>
        </div>
      </div>

      {/* 2. Main Categories Grid */}
      <div className="px-6 mt-8">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Browse Categories</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {categories.map((item, index) => {
            const Wrapper = item.href ? Link : 'button'
            const props = item.href ? { href: item.href } : { onClick: () => setActiveSheet(item.id) }

            return (
              <Wrapper 
                key={index} 
                {...props}
                className={`
                  group text-left flex flex-col justify-between p-5 rounded-[1.25rem] bg-white 
                  border ${item.borderColor} shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                  active:scale-[0.97] transition-all duration-300 ease-out
                  hover:shadow-md hover:-translate-y-1 relative overflow-hidden w-full
                `}
              >
                 <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${item.bg}`}></div>
                 <div className={`w-11 h-11 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-5 h-5" />
                 </div>
                 <div className="relative z-10">
                    <h3 className="font-bold text-slate-900 text-[15px]">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">{item.subtitle}</p>
                 </div>
              </Wrapper>
            )
          })}
        </div>
      </div>

      {/* 3. Popular Tools */}
      <div className="mt-10 pl-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Quick Tools</h2>
        <div className="flex gap-3 overflow-x-auto pb-8 pr-6 scrollbar-hide">
           {toolOptions.map((tool, i) => (
             <Link 
               key={i} 
               href={tool.url}
               className="flex-shrink-0 bg-white border border-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 shadow-sm active:scale-95 transition-transform flex items-center gap-2"
             >
               <tool.icon className="w-4 h-4 text-blue-500" />
               {tool.title}
             </Link>
           ))}
        </div>
      </div>

      {/* --- FIXED BOTTOM SHEET --- */}
      {/* (Backdrop) */}
      <div 
        className={`
          fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-40 transition-opacity duration-300
          ${activeSheet ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeSheet}
      />

      {/* (Sheet Panel) */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-[2rem] p-6 pb-safe
          transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) 
          shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-slate-100
          max-h-[85vh] overflow-y-auto
          ${activeSheet ? 'translate-y-0' : 'translate-y-[110%]'}
        `}
      >
        <div className="w-12 h-1.5 bg-slate-200/80 rounded-full mx-auto mb-8 sticky top-0" />

        <div className="flex justify-between items-center mb-6 px-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {sheetTitle}
          </h2>
          <button onClick={closeSheet} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 pb-8">
          {currentOptions.map((opt, i) => (
             <Link 
               key={i}
               href={opt.url}
               onClick={closeSheet}
               className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100/50 rounded-2xl active:bg-slate-100 active:scale-[0.99] transition-all duration-200"
             >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${opt.bg} ${opt.color} flex items-center justify-center`}>
                    <opt.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm group-hover:text-slate-900">
                    {opt.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
             </Link>
          ))}
        </div>
      </div>

    </div>
  )
}