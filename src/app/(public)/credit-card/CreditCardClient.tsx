'use client'

import React, { useState } from 'react';
import Meta from '@/components/Meta';
// @ts-ignore - Assuming file exists
import CreditCardFormModal from '@/components/forms/others/CreditCardFormModal';
import { 
  CreditCard, ShieldCheck, Zap, Globe, Briefcase, Fuel, 
  ShoppingBag, CheckCircle2, FileText, ChevronDown, 
  Star, HelpCircle, LayoutGrid, ArrowRight, Wallet,
  Calendar, Lock, LucideIcon
} from 'lucide-react';

// --- Interfaces ---

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface CardTypeItem {
  name: string;
  icon: LucideIcon;
  desc: string;
  color: string;
}

const CreditCardClient: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // --- Scroll Logic ---
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const section = document.getElementById(`${tabId}-section`);
    if (section) {
      const headerOffset = 130; 
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // --- Data ---
  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'features', label: 'Features', icon: Star },
    { id: 'eligibility', label: 'Eligibility', icon: CheckCircle2 },
    { id: 'documents', label: 'Docs', icon: FileText },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle }
  ];

  const cardTypes: CardTypeItem[] = [
    { name: 'Shopping', icon: ShoppingBag, desc: '5% Cashback online', color: 'bg-rose-50 text-rose-600' },
    { name: 'Travel', icon: Globe, desc: 'Free lounge access', color: 'bg-sky-50 text-sky-600' },
    { name: 'Fuel', icon: Fuel, desc: 'Surcharge waiver', color: 'bg-orange-50 text-orange-600' },
    { name: 'Rewards', icon: Wallet, desc: '10X points dining', color: 'bg-purple-50 text-purple-600' },
    { name: 'Business', icon: Briefcase, desc: 'Expense tools', color: 'bg-slate-100 text-slate-700' },
    { name: 'Lifestyle', icon: Star, desc: 'Golf & concierge', color: 'bg-yellow-50 text-yellow-600' },
    { name: 'Cashback', icon: Zap, desc: 'Flat bill cashback', color: 'bg-green-50 text-green-600' },
    { name: 'Secured', icon: Lock, desc: 'Credit builder', color: 'bg-indigo-50 text-indigo-600' }
  ];

  const features: FeatureItem[] = [
    { title: 'High Limits', icon: Wallet, description: 'Up to 3x monthly income limits.' },
    { title: 'Interest-Free', icon: Calendar, description: 'Up to 50 days credit period.' },
    { title: 'Global Use', icon: Globe, description: 'Accepted at millions of outlets.' },
    { title: 'Security', icon: ShieldCheck, description: 'Zero liability fraud protection.' },
  ];

  const faqs = [
    { q: 'Min salary for credit card?', a: 'Generally ₹15,000/mo, varies by card type.' },
    { q: 'Does checking affect score?', a: 'No, checking eligibility here is a soft inquiry.' },
    { q: 'Approval time?', a: 'Instant approval available. Delivery in 3-5 days.' },
    { q: 'Are there free cards?', a: 'Yes, many banks offer lifetime free cards.' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      <Meta title="Best Credit Cards in India | Apply Online" description="Compare and apply for top credit cards with instant approval and exclusive rewards." />

      {/* 1. Optimized Hero Section */}
      <section className="relative pt-20 pb-12 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-purple-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Top Rated 2024
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Unlock Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Financial Power</span>
            </h1>
            
            <p className="text-sm md:text-lg text-slate-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Compare India's best credit cards. Get instant approval, exclusive rewards, and lifetime free options.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm md:text-base shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Find My Card <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              
              {/* Compact Stats */}
              <div className="flex items-center justify-center gap-4 px-4 py-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="text-center">
                  <p className="text-lg md:text-xl font-black text-slate-900 leading-none">50+</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Partners</p>
                </div>
                <div className="w-px h-6 bg-slate-100"></div>
                <div className="text-center">
                  <p className="text-lg md:text-xl font-black text-slate-900 leading-none">2M+</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Visual (Hidden on mobile to save space) */}
          <div className="relative hidden lg:block">
             <div className="relative w-full max-w-md mx-auto aspect-[4/3]">
                {/* Floating Cards */}
                <div className="absolute top-0 right-0 w-80 h-52 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl transform rotate-12 z-10 p-6 flex flex-col justify-between border border-slate-700">
                   <div className="flex justify-between items-start">
                      <Zap className="w-8 h-8 text-yellow-400" />
                      <span className="text-white/40 font-mono text-sm">PREMIUM</span>
                   </div>
                   <div className="space-y-4">
                      <div className="flex gap-2">
                         <div className="w-12 h-8 bg-white/10 rounded"></div>
                      </div>
                      <div className="text-white/90 font-mono text-xl tracking-widest">•••• 8892</div>
                   </div>
                </div>
                <div className="absolute top-12 left-0 w-80 h-52 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl shadow-2xl transform -rotate-6 z-20 p-6 flex flex-col justify-between border-t border-white/20">
                   <div className="flex justify-between items-start">
                      <Globe className="w-8 h-8 text-white/80" />
                      <span className="text-white/40 font-mono text-sm">TRAVEL</span>
                   </div>
                   <div className="space-y-4">
                      <div className="flex gap-2">
                         <div className="w-12 h-8 bg-white/20 rounded"></div>
                      </div>
                      <div className="text-white font-mono text-xl tracking-widest">•••• 4242</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. Sticky Navigation - Compact */}
      <div className="sticky top-14 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 py-2.5 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] md:text-xs font-bold whitespace-nowrap transition-all
                  ${activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-600 border border-slate-100'}
                `}
              >
                <tab.icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 space-y-16 md:space-y-24">
        
        {/* SECTION: Overview (Card Types) - Grid Optimized */}
        <section id="overview-section" className="space-y-8">
           <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Cards for Every Lifestyle</h2>
              <p className="text-sm md:text-base text-slate-500">Shopaholic, globetrotter, or starter - we have the perfect card.</p>
           </div>

           {/* Mobile: 2 Columns, Desktop: 4 Columns */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {cardTypes.map((card, i) => (
                 <div 
                    key={i} 
                    onClick={() => setIsModalOpen(true)}
                    className="group bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer text-center"
                 >
                    <div className={`w-10 h-10 md:w-14 md:h-14 mx-auto rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${card.color}`}>
                       <card.icon className="w-5 h-5 md:w-7 md:h-7" />
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-slate-900 mb-0.5">{card.name}</h3>
                    <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-tight">{card.desc}</p>
                 </div>
              ))}
           </div>
        </section>

        {/* SECTION: Features - Compact Layout */}
        <section id="features-section" className="bg-slate-900 rounded-3xl p-6 md:p-12 text-white overflow-hidden relative">
           <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-16 items-start">
              <div className="space-y-4">
                 <h2 className="text-2xl md:text-3xl font-black">Why Choose a Credit Card?</h2>
                 <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                    More than plastic money. Security, convenience, and rewards debit cards can't match.
                 </p>
                 <button onClick={() => setIsModalOpen(true)} className="text-blue-400 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all pt-2">
                    Check Eligibility <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
              <div className="grid gap-3 md:gap-4">
                 {features.map((feat, i) => (
                    <div key={i} className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                       <div className="shrink-0 mt-0.5">
                          <feat.icon className="w-5 h-5 text-blue-400" />
                       </div>
                       <div>
                          <h4 className="font-bold text-sm md:text-base mb-0.5">{feat.title}</h4>
                          <p className="text-xs md:text-sm text-slate-400 leading-snug">{feat.description}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* SECTION: Eligibility & Docs - Stacked on Mobile */}
        <section id="eligibility-section" className="grid md:grid-cols-2 gap-6 md:gap-8">
           <div className="bg-blue-50/50 p-6 md:p-8 rounded-3xl border border-blue-100">
              <h3 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> Eligibility
              </h3>
              <ul className="space-y-3">
                 {[
                    { l: 'Age', v: '21 - 60 Yrs' },
                    { l: 'Income (Job)', v: '₹20k / mo' },
                    { l: 'Income (Biz)', v: 'ITR > ₹3L' },
                    { l: 'Score', v: '700+' },
                 ].map((item, i) => (
                    <li key={i} className="flex justify-between items-center pb-2 border-b border-blue-100 last:border-0">
                       <span className="text-xs md:text-sm font-medium text-slate-500">{item.l}</span>
                       <span className="text-xs md:text-sm font-bold text-slate-900">{item.v}</span>
                    </li>
                 ))}
              </ul>
           </div>

           <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200" id="documents-section">
              <h3 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2">
                 <FileText className="w-5 h-5 md:w-6 md:h-6 text-slate-400" /> Documents
              </h3>
              <div className="grid gap-2.5">
                 {['PAN Card Copy', 'Aadhaar / Voter ID', '3 Months Payslips', '6 Months Bank Stmt'].map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></div>
                       <span className="text-xs md:text-sm font-bold text-slate-700">{doc}</span>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* SECTION: FAQs */}
        <section id="faqs-section" className="max-w-3xl mx-auto">
           <h2 className="text-2xl md:text-3xl font-black text-center text-slate-900 mb-6 md:mb-8">FAQs</h2>
           <div className="space-y-3">
              {faqs.map((item, i) => (
                 <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <button 
                       onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                       className="w-full flex justify-between items-center p-4 md:p-5 text-left"
                    >
                       <span className="font-bold text-slate-800 text-xs md:text-sm pr-4">{item.q}</span>
                       <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${activeFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {activeFaq === i && (
                       <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0">
                          <p className="text-xs md:text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{item.a}</p>
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </section>

      </div>

      {/* --- FORM COMPONENT --- */}
      <CreditCardFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        // @ts-ignore
        cardTypes={cardTypes}
      />
    </div>
  );
};

export default CreditCardClient;