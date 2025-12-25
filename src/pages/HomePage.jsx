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
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-14 overflow-x-hidden">
        
        {/* 1. Offers Banner (First visible element) */}
        <div className="px-2 mt-2 pt-2">
           <HeroCarousel />
        </div>

        {/* 2. Products Grid (The "App Drawer" look) */}
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

        {/* 3. Car Loans (Compact List) */}
        <div className="px-5 mt-8">
           <SectionTitle title="Car Loans" action={{label: 'View All', link: '#'}} />
            <div className="grid grid-cols-4 gap-3">
              <a href="/car-loan/new" className="bg-white p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1 shadow-sm h-20">
                <Car className="w-5 h-5 text-amber-600" />
                <span className="text-[10px] font-medium text-slate-600">New Car</span>
              </a>
              <a href="/car-loan/used" className="bg-white p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1 shadow-sm h-20">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-[10px] font-medium text-slate-600">Used Car</span>
              </a>
              <a href="/car-loan/refinance" className="bg-white p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1 shadow-sm h-20">
                <RefreshCw className="w-5 h-5 text-sky-600" />
                <span className="text-[10px] font-medium text-slate-600">Refinance</span>
              </a>
            </div>
        </div>

        {/* 4. Insurance Row */}
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

        {/* 5. SEO Content Section */}
        <div className="mt-12 bg-white rounded-t-3xl shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] px-6 py-8">
            <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-900 mb-2">Why Choose Loanzaar?</h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {features.map((feat, idx) => (
                        <div key={idx} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                                {feat.icon}
                                <span className="font-semibold text-xs text-slate-800">{feat.title}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Personal Loans Made Easy</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Looking for an instant personal loan? Loanzaar connects you with India's top banks and NBFCs. 
                        Get loans up to ₹50 Lakhs with minimal documentation, flexible tenures, and competitive interest rates starting at 10.49% p.a.
                    </p>
                </div>
                
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Credit Cards for Every Need</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Compare and apply for the best credit cards in India. Whether you want cashback, travel rewards, or lifetime free cards, 
                        find the perfect match for your spending habits and maximize your savings.
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Check Free Credit Score</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Your CIBIL score is the key to financial approvals. Check your credit score for free on Loanzaar, 
                        get detailed insights into your credit health, and learn how to improve it to unlock better loan offers.
                    </p>
                </div>
            </div>


        </div>

      </div>
    </>
  );
};

export default HomePage;