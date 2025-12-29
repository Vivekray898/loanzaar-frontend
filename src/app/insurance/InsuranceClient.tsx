'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck, Umbrella, HeartPulse, Layers,
  Calculator, BookOpen, Sparkles,
  ChevronRight, CheckCircle2, TrendingUp, AlertCircle,
  Banknote, Clock, Phone, ChevronDown, ArrowRight,
  LucideIcon
} from 'lucide-react'
 
import BottomNav from '@/components/BottomNav'

// --- Interfaces ---

interface InsuranceItem {
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
const insuranceOptions: InsuranceItem[] = [
  { 
    title: 'Life Insurance', url: '/insurance/life-insurance', icon: Umbrella, 
    color: 'text-cyan-600', bg: 'bg-cyan-50', 
    hint: 'Term plans & savings', promo: '✅ Tax Saver' 
  },
  { 
    title: 'Health Insurance', url: '/insurance/health-insurance', icon: HeartPulse, 
    color: 'text-rose-600', bg: 'bg-rose-50', 
    hint: 'Medical & critical illness', promo: '🛡️ Cashless' 
  },
  { 
    title: 'General Insurance', url: '/insurance/general-insurance', icon: ShieldCheck, 
    color: 'text-slate-600', bg: 'bg-slate-100', 
    hint: 'Car, bike & travel', promo: '⚡ Instant' 
  },
  { 
    title: 'All Insurance', url: '/insurance/all-insurance', icon: Layers, 
    color: 'text-blue-600', bg: 'bg-blue-50', 
    hint: 'Explore all categories' 
  },
]

const toolOptions: ToolItem[] = [
  { title: 'Premium Calc', url: '/calculators', icon: Calculator, desc: 'Estimate cost' },
  { title: 'Compare Plans', url: '/compare', icon: Layers, desc: 'Side-by-side' },
  { title: 'Claim Support', url: '/support', icon: Phone, desc: '24/7 Assistance' },
  { title: 'Insurance Guide', url: 'https://blog.loanzaar.in', icon: BookOpen, desc: 'Expert tips on loans, finance and investments' },
]

// Helper to detect external links (http, https, mailto, tel)
const isExternal = (url?: string) => typeof url === 'string' && (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:'));

const faqs: FAQItem[] = [
  { q: 'Which insurance plan offers tax benefits?', a: 'Life insurance premiums qualify for deductions under Section 80C (up to ₹1.5 Lakh). Health insurance premiums allow deductions under Section 80D (up to ₹25,000 for individuals).' },
  { q: 'What is Claim Settlement Ratio (CSR)?', a: 'CSR indicates the percentage of claims settled by an insurer. A higher CSR (above 95%) implies the insurer is reliable.' },
  { q: 'Can I apply for insurance online?', a: 'Yes, applying online via Loanzaar is faster, cheaper, and requires minimal paperwork with instant policy issuance.' },
  { q: 'Is a medical test mandatory?', a: 'Not always. Many insurers offer plans without medical tests for individuals under 45 years of age, depending on coverage amount.' },
]

export default function InsuranceClient() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-12 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      <h1 className="sr-only">
        Compare & Buy Insurance Plans Online in India - Life, Health, Car & Bike Insurance
      </h1>

      <div className="max-w-7xl mx-auto w-full">

        {/* --- Header Section --- */}
        <header className="bg-white px-5 pt-8 pb-8 md:pt-12 md:pb-12 md:px-10 rounded-b-[2rem] md:rounded-[3rem] lg:mx-6 lg:mt-6 shadow-sm border-b md:border border-slate-100 relative overflow-hidden">
          
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            
            {/* Title Block */}
            <div className="flex flex-col gap-3 flex-1 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-emerald-700 font-bold tracking-wider text-xs md:text-sm uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  Secure Your Future
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Insurance <span className="text-emerald-600 inline-block">Hub</span>
              </h2>
              
              <p className="text-slate-500 font-medium text-sm sm:text-base md:text-lg leading-relaxed max-w-lg">
                Compare India's top policies, calculate premiums instantly, and save taxes with our trusted platform.
              </p>
            </div>

            {/* CTA Card */}
            <div className="w-full lg:w-auto lg:min-w-[380px]">
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl p-1 shadow-2xl shadow-emerald-200/50 group cursor-pointer transform transition-all hover:-translate-y-1">
                <div className="bg-emerald-900/50 backdrop-blur-sm rounded-xl p-5 flex items-center gap-5 relative overflow-hidden">
                  
                  {/* Card Glow Effect */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-2xl rounded-full -mr-5 -mt-5"></div>

                  <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 shrink-0">
                    <Sparkles className="w-6 h-6 text-emerald-300" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-base md:text-lg truncate">Get Instant Quote</h4>
                    <p className="text-emerald-100/70 text-xs md:text-sm truncate">Save up to 25% today</p>
                  </div>
                  
                  <div className="bg-white text-emerald-900 p-2.5 rounded-lg shrink-0 group-hover:bg-emerald-50 transition-colors">
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
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Explore Plans</h2>
              {/* UPDATED LINK: Now passes tab=insurance query parameter */}
              <Link href="/apply?tab=insurance" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View all categories <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 xl:gap-6">
              {insuranceOptions.map((opt, i) => (
                <Link 
                  key={i} 
                  href={opt.url} 
                  className={`group relative flex flex-col p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                >
                  {/* Hover Gradient Background */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${opt.color.replace('text', 'bg')}`} />

                  <div className="flex items-start justify-between mb-4 md:mb-6 z-10">
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
                    <h3 className="font-bold text-slate-900 text-sm md:text-lg leading-tight group-hover:text-emerald-700 transition-colors">{opt.title}</h3>
                    <p className="text-[10px] md:text-sm text-slate-500 mt-1 font-medium leading-tight">{opt.hint}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 2. Quick Tools - Grid System */}
          <section>
            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 pl-1">Tools & Resources</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {toolOptions.map((tool, i) => (
                isExternal(tool.url) ? (
                  <a
                    key={i}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 p-4 rounded-2xl group transition-all duration-200 flex flex-col items-center text-center md:items-start md:text-left gap-3 md:gap-2 active:scale-95"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-600 group-hover:text-emerald-600 group-hover:bg-white transition-colors shadow-sm">
                      <tool.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <span className="block text-sm md:text-base font-bold text-slate-800 group-hover:text-emerald-900">{tool.title}</span>
                      <span className="hidden md:block text-xs text-slate-500 mt-0.5">{tool.desc}</span>
                    </div>
                  </a>
                ) : (
                  <Link 
                    key={i} 
                    href={tool.url} 
                    className="bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 p-4 rounded-2xl group transition-all duration-200 flex flex-col items-center text-center md:items-start md:text-left gap-3 md:gap-2 active:scale-95"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-600 group-hover:text-emerald-600 group-hover:bg-white transition-colors shadow-sm">
                      <tool.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <span className="block text-sm md:text-base font-bold text-slate-800 group-hover:text-emerald-900">{tool.title}</span>
                      <span className="hidden md:block text-xs text-slate-500 mt-0.5">{tool.desc}</span>
                    </div>
                  </Link>
                )
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
                    Why is Insurance Important?
                  </h2>
                  <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
                    Insurance acts as a financial shield. Whether you are protecting your family's future with 
                    <strong className="text-slate-900"> Life Insurance</strong> or ensuring access to quality medical care with 
                    <strong className="text-slate-900"> Health Insurance</strong>, the right coverage prevents savings erosion during emergencies.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-xs md:text-sm font-medium text-slate-500">
                    {['#FinancialSafety', '#TaxSaving', '#FamilyProtection', '#AssetCover'].map(tag => (
                      <span key={tag} className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{tag}</span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Key Benefits of Buying Online</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { t: 'Lower Premiums', d: 'Zero agent commissions means up to 20% cheaper plans.', i: Banknote },
                      { t: 'Easy Comparison', d: 'Compare features & CSR of 20+ insurers instantly.', i: Layers },
                      { t: 'Tax Savings', d: 'Save under Section 80C (Life) and 80D (Health).', i: TrendingUp },
                      { t: '24/7 Support', d: 'Get digital claim assistance anytime, anywhere.', i: Clock },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                          <item.i className="w-6 h-6 text-emerald-600" />
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

              {/* Right Column: Sticky FAQ Sidebar */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="lg:sticky lg:top-8 bg-slate-50/50 rounded-3xl lg:p-6 lg:border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-emerald-600" /> 
                    Common Questions
                  </h3>
                  
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div 
                        key={i} 
                        className={`border rounded-xl transition-all duration-300 overflow-hidden ${activeFaq === i ? 'bg-white border-emerald-200 shadow-md ring-1 ring-emerald-100' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                      >
                        <button 
                          onClick={() => toggleFaq(i)} 
                          className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                          aria-expanded={activeFaq === i}
                        >
                          <span className={`text-sm font-bold pr-4 ${activeFaq === i ? 'text-emerald-900' : 'text-slate-700'}`}>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-emerald-600' : ''}`} />
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
                  
                  <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                     <Phone className="w-5 h-5 text-emerald-600" />
                     <div>
                        <p className="text-xs font-bold text-emerald-800">Need help deciding?</p>
                        <p className="text-[10px] text-emerald-600">Talk to our certified experts for free</p>
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