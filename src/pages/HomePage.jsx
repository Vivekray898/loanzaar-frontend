'use client'

import React, { useState, useEffect } from 'react';
import StructuredData from '../components/StructuredData';
import { generateWebPageSchema } from '../utils/schema';
import {
  Banknote, CreditCard, Briefcase, Home, Building, RefreshCw, Zap, Wallet,
  Gauge, FileText, Smartphone, Lightbulb, Receipt, TrendingUp, Landmark,
  Shield, HeartPulse, Car, Umbrella, Percent, Clock, ChevronRight, CheckCircle, Award,
  Sparkles, TrendingDown
} from 'lucide-react';

// --- DATA ---
const heroSlides = [
  { id: 1, title: "Personal Loan", link: "/personal-loan", image: "/images/banners/webPLMPGenericBanner.png" },
  { id: 2, title: "Credit Score", link: "/check-cibil-score", image: "/images/banners/webBureauAcquisitionBanner.png" },
  { id: 3, title: "Credit Cards", link: "/credit-cards", image: "/images/banners/mwebCCMPGenericBanner.png" }
];

const quickActions = [
  { title: 'Credit Score', icon: Gauge, color: 'text-rose-600', bg: 'bg-rose-50', link: '/check-cibil-score' },
  { title: 'Pay Loan', icon: RefreshCw, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/loan-repay' },
  { title: 'CC Bill', icon: Receipt, color: 'text-violet-600', bg: 'bg-violet-50', link: '/cc-bill' },
  { title: 'Transactions', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', link: '/transactions' }
];

const loansAndCards = [
  { title: 'Personal', icon: Banknote, ribbon: 'Instant', ribbonColor: 'bg-orange-100 text-orange-700', iconColor: 'text-orange-500', link: '/personal-loan' },
  { title: 'Credit Card', icon: CreditCard, ribbon: 'Offers', ribbonColor: 'bg-green-100 text-green-700', iconColor: 'text-blue-600', link: '/credit-cards' },
  { title: 'Business', icon: Briefcase, iconColor: 'text-slate-700', link: '/business-loan' },
  { title: 'Home Loan', icon: Home, iconColor: 'text-emerald-600', link: '/home-loan' },
  { title: 'Property', icon: Building, iconColor: 'text-indigo-600', link: '/loan-against-property' },
  { title: 'Transfer', icon: RefreshCw, iconColor: 'text-sky-700', link: '/home-loan' },
  { title: 'Instant', icon: Zap, iconColor: 'text-yellow-500', link: '/personal-loan' },
  { title: 'Premium', icon: Wallet, iconColor: 'text-purple-600', link: '/credit-cards' }
];

const insuranceItems = [
    { title: 'Health', icon: HeartPulse, iconColor: 'text-rose-500' },
    { title: 'Car', icon: Car, iconColor: 'text-amber-600' },
    { title: 'Term Life', icon: Umbrella, iconColor: 'text-blue-500' },
    { title: 'Invest', icon: Landmark, iconColor: 'text-emerald-600' },
];

// --- COMPONENTS ---

const CompactIcon = ({ item }) => (
  <a href={item.link || '#'} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform p-1">
    <div className={`relative w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center ${item.iconColor} bg-opacity-5`}>
      <item.icon className="w-6 h-6" strokeWidth={1.5} />
      {item.ribbon && (
        <span className={`absolute -top-1.5 -right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10 ${item.ribbonColor}`}>
          {item.ribbon}
        </span>
      )}
    </div>
    <span className="text-[10px] font-medium text-slate-600 text-center leading-tight max-w-[64px]">
      {item.title}
    </span>
  </a>
);

const SectionTitle = ({ title, action }) => (
  <div className="flex justify-between items-end mb-3 px-1">
    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
    {action && <a href={action.link} className="text-xs font-semibold text-blue-600 flex items-center">{action.label} <ChevronRight className="w-3 h-3" /></a>}
  </div>
);

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-200">
      {heroSlides.map((slide, index) => (
        <a key={slide.id} href={slide.link} className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
        </a>
      ))}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5">
        {heroSlides.map((_, index) => (
          <div key={index} className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-4 bg-white' : 'w-1 bg-white/60'}`} />
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  const schema = generateWebPageSchema({ name: 'Loanzaar', description: 'Financial App', url: 'https://loanzaar.in' });

  return (
    <>
      <StructuredData schema={schema} />
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 overflow-x-hidden">
        
        {/* 1. App Header */}
        <div className="bg-white px-5 pt-12 pb-4 rounded-b-3xl shadow-sm border-b border-slate-100 sticky top-0 z-30">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                   <span className="text-lg">👤</span>
                </div>
                <div>
                   <p className="text-xs text-slate-500">Welcome back,</p>
                   <p className="text-sm font-bold text-slate-900">Guest User</p>
                </div>
             </div>
             <div className="flex gap-3">
                <div className="p-2 rounded-full bg-slate-50 border border-slate-100 text-slate-600 relative">
                   <Sparkles className="w-5 h-5" />
                   <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </div>
             </div>
          </div>

          {/* Quick Stats / Credit Score Widget */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg shadow-slate-200 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
             <div className="flex justify-between items-start relative z-10">
                <div>
                   <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Credit Score</p>
                   <h2 className="text-3xl font-bold tracking-tight">768 <span className="text-sm font-normal text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded ml-1">Excellent</span></h2>
                </div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                   <Gauge className="w-6 h-6 text-blue-300" />
                </div>
             </div>
             <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center relative z-10">
                <p className="text-[10px] text-slate-400">Last updated: Today</p>
                <button className="text-[10px] font-bold bg-white text-slate-900 px-3 py-1 rounded-full">Check Now</button>
             </div>
          </div>
        </div>

        {/* 2. Quick Actions (Horizontal Scroll) */}
        <div className="mt-6 pl-5">
           <div className="flex gap-4 overflow-x-auto pb-4 pr-5 scrollbar-hide">
              {quickActions.map((action, i) => (
                 <a key={i} href={action.link} className="flex flex-col items-center gap-2 min-w-[72px]">
                    <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center shadow-sm border border-white`}>
                       <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600">{action.title}</span>
                 </a>
              ))}
           </div>
        </div>

        {/* 3. Offers Banner */}
        <div className="px-5 mt-2">
           <HeroCarousel />
        </div>

        {/* 4. Products Grid (The "App Drawer" look) */}
        <div className="px-5 mt-8">
           <SectionTitle title="Loans & Cards" />
           <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                 {loansAndCards.map((item, idx) => (
                    <CompactIcon key={idx} item={item} />
                 ))}
              </div>
           </div>
        </div>

        {/* 5. Bills & Recharge (Compact List) */}
        <div className="px-5 mt-8">
           <SectionTitle title="Bills & Recharge" action={{label: 'View All', link: '#'}} />
           <div className="grid grid-cols-4 gap-3">
              {[
                 {title: 'Mobile', icon: Smartphone, color: 'text-blue-500'},
                 {title: 'Electricity', icon: Lightbulb, color: 'text-yellow-500'},
                 {title: 'DTH', icon:  Zap, color: 'text-purple-500'},
                 {title: 'More', icon:  TrendingUp, color: 'text-slate-400'},
              ].map((item, i) => (
                 <div key={i} className="bg-white p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1 shadow-sm h-20">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-[10px] font-medium text-slate-600">{item.title}</span>
                 </div>
              ))}
           </div>
        </div>

        {/* 6. Insurance Row */}
        <div className="px-5 mt-8 mb-4">
           <SectionTitle title="Insurance" />
           <div className="grid grid-cols-4 gap-2">
              {insuranceItems.map((item, i) => (
                 <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 shadow-sm">
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                    <span className="text-[10px] font-medium text-slate-600 text-center">{item.title}</span>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </>
  );
};

export default HomePage;