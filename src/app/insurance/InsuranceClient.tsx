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
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-12">
      
      {/* Container for large screens 
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
                <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">Insurance</h1>
                <p className="text-sm md:text-base text-slate-500 font-medium mt-1 md:mt-2">Protect what matters most</p>
              </div>
              <div className="h-10 w-10 md:hidden bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            {/* Info Banner - Full width mobile, compact card desktop */}
            <div className="w-full md:w-auto md:min-w-[320px]">
              <div className="bg-emerald-900 hover:bg-emerald-800 transition-colors rounded-2xl p-5 text-white shadow-xl shadow-emerald-100/50 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md group-hover:bg-white/20 transition-colors">
                    <Sparkles className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">Instant Quote</h4>
                    <p className="text-xs text-emerald-100 mt-0.5">Save up to 25% on premiums</p>
                  </div>
                  <button className="bg-white text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-lg group-hover:bg-emerald-50 transition-colors">Get Quote</button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-6 md:px-8 mt-8 md:mt-12 space-y-12">

          {/* Insurance Grid */}
          <section>
            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Categories</h2>
            {/* Grid: 1 col mobile -> 2 cols tablet -> 3 cols desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {insuranceOptions.map((opt, i) => (
                <Link 
                  key={i} 
                  href={opt.url} 
                  className="group flex items-center p-5 md:p-6 rounded-[1.25rem] bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-100 hover:-translate-y-1 active:scale-95 transition-all duration-300"
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${opt.bg} ${opt.color} flex items-center justify-center mr-4 md:mr-5 shrink-0 transition-transform group-hover:scale-110`}>
                    <opt.icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-[16px] md:text-lg group-hover:text-emerald-700 transition-colors">{opt.title}</h3>
                    <p className="text-[12px] md:text-sm text-slate-500 group-hover:text-slate-600 transition-colors">{opt.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Insurance Tools */}
          <section className="pb-8">
            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Resources</h2>
            {/* Scroll on mobile -> Wrap on desktop */}
            <div className="flex md:flex-wrap gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mr-6 md:mr-0 pr-6 md:pr-0 scrollbar-hide">
              {toolOptions.map((tool, i) => (
                <Link 
                  key={i} 
                  href={tool.url} 
                  className="flex-shrink-0 bg-white border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 px-4 py-2.5 md:py-3 md:px-5 rounded-xl text-xs md:text-sm font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-2 transition-all"
                >
                  <tool.icon className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                  {tool.title}
                </Link>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* Bottom Nav:
        - Visible on Mobile/Tablet (block)
        - Hidden on Desktop (md:hidden or lg:hidden depending on preference)
        - Currently set to `md:hidden` so it disappears on tablets/desktops
      */}
      <div>
        <BottomNav />
      </div>
    </div>
  )
}