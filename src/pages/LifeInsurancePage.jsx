'use client'

import React, { useState } from 'react';
import dynamic from 'next/dynamic'; // Lazy loading
import Meta from '@/components/Meta';
import BackButton from '@/components/BackButton';
import { 
  ChevronDown, Check, Shield, Heart, 
  Umbrella, Users, FileText, Info, HelpCircle, 
  ArrowRight, Clock, Infinity, TrendingUp, PiggyBank, 
  DollarSign, Sun, Baby, Layers, Phone
} from 'lucide-react';

// 1. Dynamic Import of the Form
const LifeInsuranceForm = dynamic(
  () => import('@/components/forms/insurances/LifeInsuranceForm'), 
  { ssr: false } 
);

const LifeInsurancePage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('basics');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyClick = () => {
    setIsModalOpen(true); 
  };

  // Smooth Scroll Handler
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // --- Data ---
  const lifeInsuranceTypes = [
    { title: 'Term Life', icon: Clock, desc: 'Pure protection for a specific period. High cover, low premium.' },
    { title: 'Whole Life', icon: Infinity, desc: 'Lifetime coverage (up to 99 years) with a savings component.' },
    { title: 'ULIP', icon: TrendingUp, desc: 'Insurance + Investment. Returns linked to market performance.' },
    { title: 'Endowment', icon: PiggyBank, desc: 'Guaranteed savings + Life cover. Lump sum on maturity.' },
    { title: 'Money Back', icon: DollarSign, desc: 'Periodic payouts during the term + Sum assured at end.' },
    { title: 'Retirement', icon: Sun, desc: 'Build a corpus for a regular pension after retirement.' },
    { title: 'Child Plan', icon: Baby, desc: 'Secures child\'s education and marriage goals.' },
    { title: 'Group Plan', icon: Users, desc: 'Cover for employees or members of an organization.' }
  ];

  const whoShouldBuy = [
    'Parents with young children',
    'Breadwinners of the family',
    'People with outstanding debts (Loans)',
    'Business Owners',
    'Anyone wanting to leave a legacy'
  ];

  const keyTerms = [
    { term: 'Premium', def: 'Regular payment to keep policy active.' },
    { term: 'Sum Assured', def: 'The guaranteed amount paid on death.' },
    { term: 'Beneficiary', def: 'Person who receives the payout.' },
    { term: 'Riders', def: 'Extra add-ons like Accidental Cover.' }
  ];

  const faqs = [
    { q: 'What is life insurance?', a: 'A contract where you pay premiums, and the insurer pays a lump sum to your family if you pass away.' },
    { q: 'How much cover do I need?', a: 'Typically 10-15 times your annual income is recommended.' },
    { q: 'Term vs Whole Life?', a: 'Term is cheaper and for a fixed time. Whole life covers you until death and builds cash value.' },
    { q: 'Is it taxable?', a: 'Death benefits are usually tax-free. Premiums may be tax-deductible under 80C.' },
    { q: 'Can I have multiple policies?', a: 'Yes, you can buy multiple policies to cover different financial goals.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0 text-slate-900">
      <Meta title="Life Insurance | Loanzaar" description="Secure your family's future." />
      
      {/* 1. Header (Universal) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" /> Back
          </BackButton>
          <h1 className="text-base md:text-lg font-bold text-slate-900">Life Insurance</h1>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">

        {/* 2. Hero Section */}
        <section id="basics" className="mb-8">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-teal-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                  Family Protection
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  A promise for <br className="hidden md:block"/> <span className="text-teal-100">their future.</span>
                </h2>
                <p className="text-teal-50 text-sm md:text-lg mb-6 leading-relaxed max-w-lg">
                  Ensure your loved ones are financially secure, no matter what happens. Plans starting from ₹499/mo.
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Shield className="w-4 h-4 text-cyan-400" /> 100% Payout
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <FileText className="w-4 h-4 text-white" /> Tax Benefits
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Sticky Navigation Anchor Bar */}
        <div className="sticky top-16 z-40 bg-slate-50/95 backdrop-blur-sm pt-2 pb-4 border-b border-slate-200 mb-8">
          <div className="flex overflow-x-auto gap-2 md:gap-4 pb-2 scrollbar-hide">
            {[
              { id: 'basics', label: 'Basics', icon: Info },
              { id: 'types', label: 'Types', icon: Layers },
              { id: 'who', label: 'Who Needs It', icon: Users },
              { id: 'faqs', label: 'FAQs', icon: HelpCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300
                  ${activeTab === tab.id 
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-200' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}
                `}
              >
                <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
          
          {/* LEFT COLUMN: Content Sections (col-span-8) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* BASICS SECTION */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  How it Works
                </h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify mb-8">
                  Life insurance acts as a safety net. You pay small amounts (premiums) now to ensure a large, tax-free payout (Sum Assured) for your family later if the unforeseen happens.
                </p>

                {/* Visual Flow */}
                <div className="flex items-center justify-between px-4 md:px-12 py-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                   <div className="text-center group">
                      <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-slate-700">Pay Premium</p>
                   </div>
                   <div className="h-0.5 flex-1 bg-slate-200 mx-4"></div>
                   <div className="text-center group">
                      <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6" />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-slate-700">Get Covered</p>
                   </div>
                   <div className="h-0.5 flex-1 bg-slate-200 mx-4"></div>
                   <div className="text-center group">
                      <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Heart className="w-6 h-6" />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-slate-700">Family Secure</p>
                   </div>
                </div>
              </div>

              <div className="bg-teal-50/80 p-6 rounded-2xl border border-teal-100">
                <h3 className="text-sm font-bold text-teal-900 mb-4 uppercase tracking-wide">Key Terms to Know</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyTerms.map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-teal-50 shadow-sm">
                      <div className="flex gap-3">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-teal-500 shrink-0"></div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 block mb-1">{item.term}</span>
                          <span className="text-xs text-slate-500 leading-relaxed">{item.def}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TYPES SECTION */}
            <div id="types" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Layers className="w-6 h-6 text-teal-600" /> Types of Life Insurance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lifeInsuranceTypes.map((type, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center shrink-0 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <type.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{type.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">{type.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WHO NEEDS IT SECTION */}
            <div id="who" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-slate-700" /> Who Needs It?
              </h3>
              
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 mb-6">
                <Info className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-sm text-orange-800 leading-relaxed font-medium">
                  Rule of Thumb: If anyone relies on your income financially, you need life insurance.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {whoShouldBuy.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                       <Check className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <span className="text-sm text-slate-700 font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQS SECTION */}
            <div id="faqs" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-slate-700" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((item, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-teal-300 transition-colors">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full flex justify-between items-center p-5 text-left"
                    >
                      <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180 text-teal-600' : ''}`} />
                    </button>
                    {activeFaq === i && (
                      <div className="px-5 pb-5 pt-0 bg-white">
                        <div className="h-px bg-slate-100 w-full mb-3"></div>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Sticky Sidebar (Consultation) (lg:col-span-4) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
             <div className="sticky top-32 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                   <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-teal-600" /> Expert Advice
                   </h3>
                   <p className="text-sm text-slate-500 mb-6">Unsure which plan fits you? Talk to our certified advisors for free.</p>
                   
                   <button 
                      onClick={handleApplyClick}
                      className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all text-white px-6 py-4 rounded-xl font-bold text-base shadow-lg shadow-teal-200"
                   >
                      Get Free Consultation <ArrowRight className="w-5 h-5" />
                   </button>
                   <p className="text-center text-xs text-slate-400 mt-3">No spam. Only helpful advice.</p>
                </div>
                
                {/* Trust Badge Widget */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-teal-600">
                      <Shield className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Claim Support</p>
                      <p className="text-xs text-slate-500">Dedicated assistance</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>

      {/* 5. Sticky Bottom Action Bar (Mobile/Tablet Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Secure Future</p>
            <p className="text-sm font-bold text-slate-900">Plans from ₹499/mo</p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-200"
          >
            Get Advice <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 
         Dynamic Modal Integration
      */}
      {isModalOpen && (
        <LifeInsuranceForm 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          insuranceType="Life Insurance"
        />
      )}

    </div>
  );
};

export default LifeInsurancePage;