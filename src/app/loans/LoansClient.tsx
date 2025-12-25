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
    <div className="min-h-screen bg-slate-50 font-sans pb-14">
      
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Loans</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Quick & easy financing</p>
          </div>
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
            <Banknote className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* Credit Banner */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Loan Eligibility</h4>
              <p className="text-xs text-slate-300 mt-0.5">Check your limit in 2 mins</p>
            </div>
            <button className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg">Check</button>
          </div>
        </div>
      </div>

      {/* Main Loan Grid */}
      <div className="px-6 mt-8">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Popular Loans</h2>
        <div className="grid grid-cols-2 gap-4">
          {loanOptions.map((opt, i) => (
            <Link key={i} href={opt.url} className="group p-5 rounded-[1.25rem] bg-white border border-slate-100 shadow-sm active:scale-95 transition-all">
              <div className={`w-11 h-11 rounded-2xl ${opt.bg} ${opt.color} flex items-center justify-center mb-4`}>
                <opt.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-[15px]">{opt.title}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Car Loan Section */}
      <div className="px-6 mt-10">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Car Financing</h2>
        <div className="space-y-3">
          {carLoanOptions.map((opt, i) => (
            <Link key={i} href={opt.url} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl active:scale-[0.98] transition-all">
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${opt.bg} ${opt.color} flex items-center justify-center`}>
                    <opt.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{opt.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="mt-10 pl-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Loan Tools</h2>
        <div className="flex gap-3 overflow-x-auto pb-8 pr-6">
          {toolOptions.map((tool, i) => (
            <Link key={i} href={tool.url} className="flex-shrink-0 bg-white border border-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2">
              <tool.icon className="w-4 h-4 text-blue-500" />
              {tool.title}
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
