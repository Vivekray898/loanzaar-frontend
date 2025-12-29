'use client'

import React from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

import { 
  Phone, 
  MessageCircle, 
  Mail, 
  HelpCircle, 
  Clock, 
  ChevronRight,
  LifeBuoy,
  ArrowRight,
  LucideIcon,
  ShieldCheck
} from 'lucide-react'

// --- Interfaces ---

interface ContactOption {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  href: string;
  colorTheme: 'blue' | 'green' | 'orange'; // Simplified theme handling
  isExternal?: boolean;
}

export default function SupportPage() {
  const supportEmail = 'info@loanzaar.in'
  const phoneNumber = '+911234567890'
  const whatsappNumber = '911234567890'

  const contactOptions: ContactOption[] = [
    {
      id: 'call',
      title: 'Call Support',
      subtitle: 'Talk to an expert directly',
      icon: Phone,
      href: `tel:${phoneNumber}`,
      colorTheme: 'blue'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Chat',
      subtitle: 'Fastest response (< 2 mins)',
      icon: MessageCircle,
      href: `https://wa.me/${whatsappNumber}`,
      colorTheme: 'green',
      isExternal: true
    },
    {
      id: 'email',
      title: 'Email Us',
      subtitle: 'Send documents & queries',
      icon: Mail,
      href: `mailto:${supportEmail}`,
      colorTheme: 'orange'
    }
  ]

  // Helper to get color classes based on theme
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'blue': return 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white border-blue-100';
      case 'green': return 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white border-green-100';
      case 'orange': return 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white border-orange-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-10">
      
      {/* 1. Hero Section */}
      <div className="bg-slate-900 pt-16 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-3 py-1 backdrop-blur-sm">
                <LifeBuoy className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-blue-100 tracking-wide uppercase">Help Center</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                How can we help you?
              </h1>
              <p className="text-slate-400 text-sm md:text-lg max-w-lg leading-relaxed">
                Facing an issue with your loan application or need quick answers? Choose your preferred way to connect.
              </p>
            </div>

            {/* Live Status Widget */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 min-w-[240px]">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute inset-0"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full relative border-2 border-slate-900"></div>
              </div>
              <div>
                <p className="text-white text-sm font-bold">Support is Live</p>
                <p className="text-slate-400 text-xs">Avg. wait time: <span className="text-emerald-400">2 mins</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Floating Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 space-y-8">
        
        {/* Primary Contact Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {contactOptions.map((opt) => (
            <a 
              key={opt.id}
              href={opt.href}
              target={opt.isExternal ? "_blank" : undefined}
              rel={opt.isExternal ? "noopener noreferrer" : undefined}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${getThemeClasses(opt.colorTheme)}`}>
                  <opt.icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {opt.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {opt.subtitle}
                </p>
              </div>
              
              <div className="mt-6 flex items-center text-sm font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                Connect Now <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </div>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          
          {/* FAQ Card */}
          <Link 
            href="/faqs"
            className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all group"
          >
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Frequently Asked Questions</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4 sm:mb-0">
                Browse our knowledge base for answers regarding eligibility, EMI calculations, and documentation.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>

          {/* Business Hours Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-100 p-6 md:p-8 rounded-3xl border border-slate-200">
            <div className="w-16 h-16 bg-white text-slate-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Operating Hours</h3>
              <p className="text-sm text-slate-500 mb-2">
                Our support team is available during the following hours:
              </p>
              <div className="inline-block bg-white px-3 py-1 rounded-md border border-slate-200 text-xs font-bold text-slate-700">
                Mon - Sat: 9:00 AM - 7:00 PM
              </div>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="text-center pt-8">
           <div className="inline-flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Secure & Confidential Support
           </div>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}