"use client"

import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck, Umbrella, HeartPulse, Layers,
  Calculator, BookOpen, FileText, Sparkles,
  ChevronRight
} from 'lucide-react'

 
import BottomNav from '@/components/BottomNav'

const insuranceOptions = [
  { title: 'Life Insurance', url: '/insurance/life-insurance', icon: Umbrella, color: 'text-cyan-600', bg: 'bg-cyan-50', desc: 'Secure your family' },
  { title: 'Health Insurance', url: '/insurance/health-insurance', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Medical cover' },
  { title: 'General Insurance', url: '/insurance/general-insurance', icon: ShieldCheck, color: 'text-slate-600', bg: 'bg-slate-100', desc: 'Asset protection' },
  { title: 'All Insurance', url: '/insurance/all-insurance', icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Browse all' },
]

const toolOptions = [
  { title: 'Premium Calc', url: '/calculators', icon: Calculator },
  { title: 'Compare Plans', url: '/compare', icon: ChevronRight },
  { title: 'Insurance Guide', url: '/blogs', icon: BookOpen },
]

export default function InsuranceClient() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-14">
      

      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Insurance</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Protect what matters</p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-emerald-900 rounded-2xl p-5 text-white shadow-xl shadow-emerald-100">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Instant Quote</h4>
              <p className="text-xs text-emerald-100 mt-0.5">Save up to 25% on premiums</p>
            </div>
            <button className="bg-white text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-lg">Get Quote</button>
          </div>
        </div>
      </div>

      {/* Insurance Grid */}
      <div className="px-6 mt-8">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Categories</h2>
        <div className="grid grid-cols-1 gap-4">
          {insuranceOptions.map((opt, i) => (
            <Link key={i} href={opt.url} className="group flex items-center p-5 rounded-[1.25rem] bg-white border border-slate-100 shadow-sm active:scale-95 transition-all">
              <div className={`w-12 h-12 rounded-2xl ${opt.bg} ${opt.color} flex items-center justify-center mr-4`}>
                <opt.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-[16px]">{opt.title}</h3>
                <p className="text-[12px] text-slate-500">{opt.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </Link>
          ))}
        </div>
      </div>

      {/* Insurance Tools */}
      <div className="mt-10 pl-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Resources</h2>
        <div className="flex gap-3 overflow-x-auto pb-8 pr-6">
          {toolOptions.map((tool, i) => (
            <Link key={i} href={tool.url} className="flex-shrink-0 bg-white border border-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2">
              <tool.icon className="w-4 h-4 text-emerald-500" />
              {tool.title}
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
