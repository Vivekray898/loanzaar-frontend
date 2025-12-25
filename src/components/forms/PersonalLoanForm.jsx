"use client"

import React, { useState } from "react"
import { 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Loader2 
} from "lucide-react"

export default function PersonalLoanForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <section className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        
        {/* 1. Form Header with Progress Decor */}
        <header className="relative bg-slate-900 px-8 pt-10 pb-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-500/20 p-1.5 rounded-lg backdrop-blur-md">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Eligibility Check</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              Get Your Loan <br/> Offer in Seconds
            </h2>
            <p className="mt-2 text-slate-400 text-sm font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Takes less than 2 minutes
            </p>
          </div>

          {/* Minimalist Progress Indicator */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
             <div className="h-full w-1/3 bg-blue-500 transition-all duration-500" />
          </div>
        </header>

        {/* 2. Interactive Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${focusedField === 'name' ? 'text-blue-600' : 'text-slate-400'}`}>
              Full Name
            </label>
            <div className="relative group">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'name' ? 'text-blue-600' : 'text-slate-300'}`}>
                <User size={20} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                required
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="As per PAN Card"
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${focusedField === 'phone' ? 'text-blue-600' : 'text-slate-400'}`}>
              Mobile Number
            </label>
            <div className="relative group">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'phone' ? 'text-blue-600' : 'text-slate-300'}`}>
                <Phone size={20} strokeWidth={2.5} />
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="10-digit mobile number"
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${focusedField === 'city' ? 'text-blue-600' : 'text-slate-400'}`}>
              Current City
            </label>
            <div className="relative group">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'city' ? 'text-blue-600' : 'text-slate-300'}`}>
                <MapPin size={20} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                required
                onFocus={() => setFocusedField('city')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your city"
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] disabled:opacity-70 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Trust Line */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            End-to-End Encrypted
          </div>
        </form>
      </div>
    </section>
  )
}

import React, { useState } from "react"
import { 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Loader2 
} from "lucide-react"

export default function PersonalLoanForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <section className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        
        {/* 1. Form Header with Progress Decor */}
        <header className="relative bg-slate-900 px-8 pt-10 pb-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-500/20 p-1.5 rounded-lg backdrop-blur-md">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Eligibility Check</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              Get Your Loan <br/> Offer in Seconds
            </h2>
            <p className="mt-2 text-slate-400 text-sm font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Takes less than 2 minutes
            </p>
          </div>

          {/* Minimalist Progress Indicator */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
             <div className="h-full w-1/3 bg-blue-500 transition-all duration-500" />
          </div>
        </header>

        {/* 2. Interactive Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${focusedField === 'name' ? 'text-blue-600' : 'text-slate-400'}`}>
              Full Name
            </label>
            <div className="relative group">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'name' ? 'text-blue-600' : 'text-slate-300'}`}>
                <User size={20} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                required
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="As per PAN Card"
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${focusedField === 'phone' ? 'text-blue-600' : 'text-slate-400'}`}>
              Mobile Number
            </label>
            <div className="relative group">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'phone' ? 'text-blue-600' : 'text-slate-300'}`}>
                <Phone size={20} strokeWidth={2.5} />
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="10-digit mobile number"
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${focusedField === 'city' ? 'text-blue-600' : 'text-slate-400'}`}>
              Current City
            </label>
            <div className="relative group">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'city' ? 'text-blue-600' : 'text-slate-300'}`}>
                <MapPin size={20} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                required
                onFocus={() => setFocusedField('city')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your city"
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] disabled:opacity-70 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Trust Line */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            End-to-End Encrypted
          </div>
        </form>
      </div>
    </section>
  )
}