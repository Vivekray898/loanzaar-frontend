'use client'

import React, { useState, useEffect } from 'react';
import StructuredData from '../components/StructuredData';
import { generateWebPageSchema } from '../utils/schema';
import {
  Banknote,
  CreditCard,
  Briefcase,
  Home,
  Building,
  RefreshCw,
  Zap,
  Wallet,
  Gauge,
  FileText,
  Smartphone,
  Lightbulb,
  Receipt,
  TrendingUp,
  Landmark,
  Shield,
  HeartPulse,
  Car,
  Umbrella,
  Percent,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

// --- DATA ---

const heroSlides = [
  {
    id: 1,
    title: "Personal Loan",
    link: "/personal-loan",
    image: "/images/banners/webPLMPGenericBanner.png"
  },
  {
    id: 2,
    title: "Credit Score",
    link: "/check-cibil-score",
    image: "/images/banners/webBureauAcquisitionBanner.png"
  },
  {
    id: 3,
    title: "Credit Cards",
    link: "/credit-cards",
    image: "/images/banners/mwebCCMPGenericBanner.png"
  }
];

const loansAndCards = [
  { title: 'Personal Loan', icon: Banknote, ribbon: 'Cashback Offer', ribbonColor: 'bg-green-600', iconColor: 'text-orange-500', link: '/personal-loan' },
  { title: 'Credit Cards', icon: CreditCard, ribbon: '5% Cashback', ribbonColor: 'bg-green-600', iconColor: 'text-green-600', link: '/credit-cards' },
  { title: 'Business Loan', icon: Briefcase, ribbon: 'Cashback Offer', ribbonColor: 'bg-green-600', iconColor: 'text-amber-700', link: '/business-loan' },
  { title: 'Home Loan', icon: Home, iconColor: 'text-orange-600', link: '/home-loan' },
  { title: 'Loan Against Property', icon: Building, iconColor: 'text-slate-600', link: '/loan-against-property' },
  { title: 'Transfer Home Loan', icon: RefreshCw, iconColor: 'text-orange-700', link: '/home-loan' },
  { title: 'Instant Personal Loan', icon: Zap, iconColor: 'text-yellow-600', link: '/personal-loan' },
  { title: 'Cashback Cards', icon: Wallet, iconColor: 'text-blue-600', link: '/credit-cards' }
];

const creditScoreAndBills = [
  { title: 'Credit Score', icon: Gauge, iconColor: 'text-red-500', link: '/check-cibil-score' },
  { title: 'Credit Health Report', icon: FileText, iconColor: 'text-orange-500', link: '/cibil-score-checker' },
  { title: 'PB Money', icon: Wallet, iconColor: 'text-blue-500' },
  { title: 'Credit Card Bill', icon: Receipt, iconColor: 'text-indigo-600' },
  { title: 'Loan Repayment', icon: RefreshCw, iconColor: 'text-green-600' },
  { title: 'Mobile Recharge', icon: Smartphone, ribbon: 'Coming Soon', ribbonColor: 'bg-green-200 text-green-800', iconColor: 'text-slate-500' },
  { title: 'Electricity Bill Payment', icon: Lightbulb, ribbon: 'Coming Soon', ribbonColor: 'bg-green-200 text-green-800', iconColor: 'text-yellow-500' },
  { title: 'Bill Payments', icon: Receipt, iconColor: 'text-blue-700' }
];

const investmentAndInsurance = [
  { title: 'Bonds', icon: TrendingUp, ribbon: 'Invest & Earn', ribbonColor: 'bg-green-200 text-green-800', iconColor: 'text-green-600' },
  { title: 'Fixed Deposits', icon: Landmark, ribbon: 'Newly Launched', ribbonColor: 'bg-green-200 text-green-800', iconColor: 'text-blue-800' },
  { title: 'Market Linked Plans', icon: TrendingUp, iconColor: 'text-purple-600' },
  { title: 'National Pension Scheme', icon: Shield, iconColor: 'text-red-600' },
  { title: 'Health Insurance', icon: HeartPulse, ribbon: '0% GST', ribbonColor: 'bg-green-200 text-green-800', iconColor: 'text-red-500', link: '/insurance/health-insurance' },
  { title: 'Term Life Insurance', icon: Umbrella, ribbon: '0% GST', ribbonColor: 'bg-green-200 text-green-800', iconColor: 'text-blue-500', link: '/insurance/life-insurance' },
  { title: 'Car Insurance', icon: Car, ribbon: 'Lowest Price', ribbonColor: 'bg-green-200 text-green-800', iconColor: 'text-yellow-600', link: '/insurance/general-insurance' },
  { title: 'All Insurance Products', icon: Shield, iconColor: 'text-slate-600', link: '/insurance/all-insurance' }
];

// --- COMPONENTS ---

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-[344px] h-[168px] md:w-[457px] md:h-[220px] rounded-3xl overflow-hidden shadow-2xl bg-slate-100 mx-auto lg:mx-0">
      {heroSlides.map((slide, index) => (
        <a
          key={slide.id}
          href={slide.link}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-fill md:object-cover"
          />
        </a>
      ))}

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              setCurrentSlide(index);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 shadow-sm ${index === currentSlide ? 'bg-brand-600' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const ProductIcon = ({ item }) => {
  const content = (
    <div className="flex flex-col items-center text-center group cursor-pointer w-full">
      <div className="relative mb-2 md:mb-3 w-full max-w-[90px]">
        {item.ribbon && (
          <div className={`absolute -top-2 md:-top-3 left-1/2 -translate-x-1/2 w-[120%] text-[8px] md:text-[10px] font-bold px-1 py-0.5 text-center shadow-sm z-10 ${item.ribbonColor.includes('text-green-800')
            ? 'bg-green-100 text-green-800 rounded-t-md border-b border-green-200'
            : 'bg-green-600 text-white rounded-t-sm clip-ribbon'
            }`}>
            {item.ribbon}
            {/* Ribbon tail effect for solid green ribbons */}
            {!item.ribbonColor.includes('text-green-800') && (
              <>
                <div className="absolute top-0 -left-1 w-1 h-2 bg-green-800 skew-y-12 -z-10"></div>
                <div className="absolute top-0 -right-1 w-1 h-2 bg-green-800 -skew-y-12 -z-10"></div>
              </>
            )}
          </div>
        )}

        <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center relative overflow-hidden ${item.ribbon ? 'mt-1' : ''}`}>
          <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <item.icon className={`w-7 h-7 md:w-9 md:h-9 ${item.iconColor}`} strokeWidth={1.5} />
        </div>
      </div>
      <span className="text-[10px] sm:text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors leading-tight max-w-[100px]">
        {item.title}
      </span>
    </div>
  );

  if (item.link) {
    return <a href={item.link}>{content}</a>;
  }

  return content;
};

const SectionHeader = ({ title }) => (
  <h3 className="text-base md:text-lg font-bold text-slate-700 uppercase tracking-wide border-l-4 border-brand-500 pl-3">
    {title}
  </h3>
);

const HomePage = () => {
  const schema = generateWebPageSchema({
    name: 'Loanzaar - India\'s Best Financial Platform',
    description: 'One stop for all financial solutions. Loans, Cards, Credit Score & Investments.',
    url: 'https://loanzaar.in',
  });

  return (
    <>
      <StructuredData schema={schema} />
      <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">

        {/* Top Header Section */}
        <section className="pt-6 pb-8 md:pt-10 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <h1 className="font-serif leading-tight">
                <span className="block text-3xl md:text-4xl text-slate-600 mb-2">India's best platform for</span>
                <span className="block text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900">Loans, Cards & Investments</span>
              </h1>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                    <Percent className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-base">One Stop for all</p>
                    <p className="text-sm text-slate-500">Financial Solutions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-base">Quick, easy &</p>
                    <p className="text-sm text-slate-500">hassle free</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Carousel */}
            <div className="lg:col-span-7 w-full">
              <HeroCarousel />
            </div>

          </div>
        </section>

        {/* Loans and Cards Grid */}
        <section className="py-6 md:py-8 px-2 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SectionHeader title="Loans and Cards" />
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-2 md:gap-y-10 md:gap-x-4 mt-6">
            {loansAndCards.map((item, idx) => (
              <ProductIcon key={idx} item={item} />
            ))}
          </div>
        </section>

        {/* Credit Score & Bill Payments Grid */}
        <section className="py-6 md:py-8 px-2 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-base md:text-lg font-bold text-slate-700 uppercase tracking-wide border-l-4 border-brand-500 pl-3">
              Credit Score & Bill Payments
            </h3>
            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Bharat Connect</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-2 md:gap-y-10 md:gap-x-4">
            {creditScoreAndBills.map((item, idx) => (
              <ProductIcon key={idx} item={item} />
            ))}
          </div>
        </section>

        {/* Investment & Insurance Products Grid */}
        <section className="py-6 md:py-8 px-2 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SectionHeader title="Investment & Insurance Products" />
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-2 md:gap-y-10 md:gap-x-4 mt-6">
            {investmentAndInsurance.map((item, idx) => (
              <ProductIcon key={idx} item={item} />
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center py-8 md:py-12 border-t border-slate-100 mt-4 md:mt-8">
          <h4 className="font-serif font-bold text-slate-800 text-base md:text-lg">Keeping You Financially Healthy And Safe, Always</h4>
        </div>

      </div>
    </>
  );
};

export default HomePage;
