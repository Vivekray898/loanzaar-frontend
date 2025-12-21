'use client'

import React, { useState } from 'react';
import Meta from '../components/Meta';
import { submitInsuranceInquiry } from '../config/api';
import { 
  ChevronDown, Check, Shield, Heart, Activity, 
  Umbrella, Users, FileText, Info, HelpCircle, 
  ArrowRight, Clock, Infinity, TrendingUp, PiggyBank, 
  DollarSign, Sun, Baby, Layers
} from 'lucide-react';

const LifeInsurancePage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('basics');
  const [activeFaq, setActiveFaq] = useState(null);

  const handleApplyClick = () => {
    alert("Opens Insurance Inquiry Form"); 
  };

  // --- Data Preserved from Original ---
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
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      <Meta title="Life Insurance | Loanzaar" description="Secure your family's future." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </a>
        <h1 className="text-sm font-bold text-slate-900">Life Insurance</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-xl shadow-teal-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Family Protection
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              A promise for <br/> <span className="text-teal-100">their future.</span>
            </h2>
            <p className="text-teal-50 text-sm mb-6 leading-relaxed">
              Ensure your loved ones are financially secure, no matter what happens.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3 text-cyan-400" /> 100% Payout
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <FileText className="w-3 h-3 text-white" /> Tax Benefits
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tabbed Content Container */}
      <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] -mt-2 pt-2 min-h-screen">
        
        {/* Scrollable Tabs */}
        <div className="flex overflow-x-auto gap-2 px-4 py-4 scrollbar-hide border-b border-slate-100 sticky top-14 bg-white z-40">
          {[
            { id: 'basics', label: 'Basics', icon: Info },
            { id: 'types', label: 'Types', icon: Layers },
            { id: 'who', label: 'Who Needs It', icon: Users },
            { id: 'faqs', label: 'FAQs', icon: HelpCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${activeTab === tab.id 
                  ? 'bg-teal-50 text-teal-600 border border-teal-100' 
                  : 'bg-slate-50 text-slate-500 border border-transparent'}
              `}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* BASICS TAB */}
          {activeTab === 'basics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">How it Works</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  It acts as a safety net. You pay small amounts now to ensure a large payout for your family later.
                </p>
                {/* Visual Flow */}
                <div className="flex items-center justify-between px-2">
                   <div className="text-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-2">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-700">Pay Premium</p>
                   </div>
                   <div className="h-0.5 w-8 bg-slate-200"></div>
                   <div className="text-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-2">
                        <Shield className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-700">Get Covered</p>
                   </div>
                   <div className="h-0.5 w-8 bg-slate-200"></div>
                   <div className="text-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-2">
                        <Heart className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-700">Family Secure</p>
                   </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Key Terms</h3>
                <div className="space-y-3">
                  {keyTerms.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></div>
                      <div>
                        <span className="text-sm font-bold text-slate-800">{item.term}: </span>
                        <span className="text-sm text-slate-600">{item.def}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TYPES TAB */}
          {activeTab === 'types' && (
            <div className="grid grid-cols-1 gap-3">
              {lifeInsuranceTypes.map((type, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0 text-teal-600">
                    <type.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{type.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{type.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WHO NEEDS IT TAB */}
          {activeTab === 'who' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-xs text-orange-800 leading-relaxed">
                  If anyone relies on your income financially, you need life insurance.
                </p>
              </div>
              
              <div className="space-y-2">
                {whoShouldBuy.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Check className="w-4 h-4 text-teal-500" />
                    <span className="text-sm text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQS TAB */}
          {activeTab === 'faqs' && (
            <div className="space-y-3">
              {faqs.map((item, i) => (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex justify-between items-center p-4 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-800 pr-4">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === i && (
                    <div className="px-4 pb-4 pt-0 bg-white">
                      <div className="h-px bg-slate-100 w-full mb-3"></div>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* 4. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-50">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Secure Future</p>
            <p className="text-xs text-slate-400">Plans starting @ ₹499/mo</p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-200"
          >
            Get Advice <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default LifeInsurancePage;