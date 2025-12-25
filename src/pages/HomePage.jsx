'use client'

import React, { useState, useEffect } from 'react';
import StructuredData from '../components/StructuredData';
import { generateWebPageSchema } from '../utils/schema';
import {
  Banknote, CreditCard, Briefcase, Home, Building, RefreshCw, Zap, Wallet,
  Smartphone, Lightbulb, TrendingUp, Landmark, HeartPulse, Car, 
  Umbrella, ChevronRight, Shield, CheckCircle, Clock, Percent, Factory
} from 'lucide-react';

// --- DATA ---
const heroSlides = [
  { id: 1, title: "Personal Loan", link: "/personal-loan", image: "/images/banners/webPLMPGenericBanner.png" },
  { id: 2, title: "Credit Score", link: "/check-cibil-score", image: "/images/banners/webBureauAcquisitionBanner.png" },
  { id: 3, title: "Credit Cards", link: "/credit-cards", image: "/images/banners/mwebCCMPGenericBanner.png" }
];

const loansAndCards = [
  { title: 'Personal', icon: Banknote, ribbon: 'Instant', ribbonColor: 'bg-orange-100 text-orange-700', iconColor: 'text-orange-500', link: '/loans/personal-loan' },
  { title: 'Credit Card', icon: CreditCard, ribbon: 'Offers', ribbonColor: 'bg-green-100 text-green-700', iconColor: 'text-blue-600', link: '/credit-cards' },
  { title: 'Business', icon: Briefcase, iconColor: 'text-slate-700', link: '/loans/business-loan' },
  { title: 'Home Loan', icon: Home, iconColor: 'text-emerald-600', link: '/loans/home-loan' },
  { title: 'Property', icon: Building, iconColor: 'text-indigo-600', link: '/loans/loan-against-property' },
  { title: 'Education', icon: Landmark, iconColor: 'text-blue-600', link: '/loans/education-loan' },
  { title: 'Machinery', icon: Factory, iconColor: 'text-slate-700', link: '/loans/machinery-loan' },
  { title: 'Gold', icon: Percent, iconColor: 'text-yellow-600', link: '/loans/gold-loan' },
  { title: 'Solar', icon: Lightbulb, iconColor: 'text-amber-400', link: '/loans/solar-loan' },
  { title: 'Transfer', icon: RefreshCw, iconColor: 'text-sky-700', link: '/loans/home-loan' },
  { title: 'Instant', icon: Zap, iconColor: 'text-yellow-500', link: '/loans/personal-loan' },
  { title: 'Premium', icon: Wallet, iconColor: 'text-purple-600', link: '/credit-cards' }
];

const insuranceItems = [
    { title: 'Health', icon: HeartPulse, iconColor: 'text-rose-500' },
    { title: 'General', icon: Shield, iconColor: 'text-amber-600' },
    { title: 'Term Life', icon: Umbrella, iconColor: 'text-blue-500' },
    { title: 'Invest', icon: Landmark, iconColor: 'text-emerald-600' },
];

const features = [
  { title: '100% Paperless', icon: checkIcon(), desc: 'Complete digital process' },
  { title: 'Instant Approval', icon: clockIcon(), desc: 'Disbursal in minutes' },
  { title: 'Best Rates', icon: percentIcon(), desc: 'Starting at 10.49%' },
  { title: 'Secure', icon: shieldIcon(), desc: '256-bit Encryption' },
];

// --- ICONS HELPERS ---
function checkIcon() { return <CheckCircle className="w-5 h-5 text-green-600" />; }
function clockIcon() { return <Clock className="w-5 h-5 text-blue-600" />; }
function percentIcon() { return <Percent className="w-5 h-5 text-orange-600" />; }
function shieldIcon() { return <Shield className="w-5 h-5 text-indigo-600" />; }


// --- COMPONENTS ---

const CompactIcon = ({ item }) => (
  <a href={item.link || '#'} className="group flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 hover:bg-slate-50 active:scale-95">
    {/* Icon Container: Larger on MD/LG */}
    <div className={`relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center ${item.iconColor} bg-opacity-5`}>
      <item.icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" strokeWidth={1.5} />
      {item.ribbon && (
        <span className={`absolute -top-2 -right-2 text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 ${item.ribbonColor}`}>
          {item.ribbon}
        </span>
      )}
    </div>
    {/* Label: Larger on MD/LG */}
    <span className="text-[10px] md:text-xs lg:text-sm font-medium text-slate-600 group-hover:text-slate-900 text-center leading-tight max-w-[80px] md:max-w-full">
      {item.title}
    </span>
  </a>
);

const SectionTitle = ({ title, action }) => (
  <div className="flex justify-between items-end mb-4 px-1">
    <h3 className="text-sm md:text-lg font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
    {action && (
      <a href={action.link} className="text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center transition-colors">
        {action.label} <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-0.5" />
      </a>
    )}
  </div>
);

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    // Responsive aspect ratio: Taller on desktop (32/9 or fixed height) to avoid looking like a thin strip
    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] lg:h-[380px] lg:aspect-auto rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-200 group">
      {heroSlides.map((slide, index) => (
        <a key={slide.id} href={slide.link} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
        </a>
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button 
            key={index} 
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'}`} 
            aria-label={`Go to slide ${index + 1}`}
          />
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
      {/* Main Container - Centered and max-width constrained for big screens */}
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 md:pb-12 overflow-x-hidden">
        
        {/* Responsive Width Wrapper */}
        <div className="max-w-7xl mx-auto w-full">

          {/* 1. Offers Banner */}
          <div className="px-3 md:px-8 mt-2 pt-4 md:pt-6">
             <HeroCarousel />
          </div>

          {/* 2. Products Grid */}
          <div className="px-5 md:px-8 mt-8 md:mt-12">
             <SectionTitle title="Loans & Cards" />
             <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                {/* Responsive Grid: 4 cols mobile -> 6 cols tablet -> 8 cols desktop */}
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-y-6 md:gap-y-8 gap-x-2 md:gap-x-6">
                   {loansAndCards.map((item, idx) => (
                      <CompactIcon key={idx} item={item} />
                   ))}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-5 md:px-8 mt-8 md:mt-12">
            
            {/* 3. Car Loans */}
            <div>
               <SectionTitle title="Car Loans" action={{label: 'View All', link: '#'}} />
                {/* 3 cols mobile -> 3 cols desktop (but wider cards) */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {[
                    { label: 'New Car', icon: Car, color: 'text-amber-600' },
                    { label: 'Used Car', icon: CheckCircle, color: 'text-green-500' },
                    { label: 'Refinance', icon: RefreshCw, color: 'text-sky-600' }
                  ].map((item, i) => (
                    <a key={i} href="/car-loan/new" className="group bg-white p-3 md:p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 h-20 md:h-28">
                      <item.icon className={`w-5 h-5 md:w-8 md:h-8 ${item.color} transition-transform group-hover:scale-110`} />
                      <span className="text-[10px] md:text-sm font-medium text-slate-600 group-hover:text-slate-900">{item.label}</span>
                    </a>
                  ))}
                </div>
            </div>

            {/* 4. Insurance Row */}
            <div>
               <SectionTitle title="Insurance" />
               {/* 4 cols mobile -> 4 cols desktop (aligned with car loans) */}
               <div className="grid grid-cols-4 gap-2 md:gap-4">
                  {insuranceItems.map((item, i) => (
                     <a key={i} href="#" className="group bg-white p-3 md:p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 h-20 md:h-28">
                        <item.icon className={`w-6 h-6 md:w-8 md:h-8 ${item.iconColor} transition-transform group-hover:scale-110`} />
                        <span className="text-[10px] md:text-sm font-medium text-slate-600 text-center group-hover:text-slate-900">{item.title}</span>
                     </a>
                  ))}
               </div>
            </div>
          </div>

          {/* 5. SEO Content Section */}
          <div className="mt-12 md:mt-20 bg-white md:mx-8 md:rounded-3xl rounded-t-3xl shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] md:shadow-sm md:border border-slate-100 px-6 md:px-12 py-8 md:py-12">
              <div className="mb-8 md:mb-12">
                  <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-6">Why Choose Loanzaar?</h2>
                  {/* Features Grid: 2 cols mobile -> 4 cols desktop */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {features.map((feat, idx) => (
                          <div key={idx} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-2 mb-1">
                                  {feat.icon}
                                  <span className="font-semibold text-xs md:text-sm text-slate-800">{feat.title}</span>
                              </div>
                              <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Text Content: Stacked mobile -> 3 columns desktop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                  <div>
                      <h3 className="text-sm md:text-base font-bold text-slate-800 mb-2">Personal Loans Made Easy</h3>
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                          Looking for an instant personal loan? Loanzaar connects you with India's top banks and NBFCs. 
                          Get loans up to ₹50 Lakhs with minimal documentation, flexible tenures, and competitive interest rates starting at 10.49% p.a.
                      </p>
                  </div>
                  
                  <div>
                      <h3 className="text-sm md:text-base font-bold text-slate-800 mb-2">Credit Cards for Every Need</h3>
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                          Compare and apply for the best credit cards in India. Whether you want cashback, travel rewards, or lifetime free cards, 
                          find the perfect match for your spending habits and maximize your savings.
                      </p>
                  </div>

                  <div>
                      <h3 className="text-sm md:text-base font-bold text-slate-800 mb-2">Check Free Credit Score</h3>
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                          Your CIBIL score is the key to financial approvals. Check your credit score for free on Loanzaar, 
                          get detailed insights into your credit health, and learn how to improve it to unlock better loan offers.
                      </p>
                  </div>
              </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default HomePage;