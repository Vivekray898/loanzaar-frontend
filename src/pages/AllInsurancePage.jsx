'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import BackButton from '../components/BackButton';
import { submitInsuranceInquiry } from '../config/api';
import StructuredData from '../components/StructuredData';
import { 
  ChevronDown, Check, Star, Shield, Heart, Activity, 
  Umbrella, Building, Users, FileText, Info, HelpCircle, 
  ArrowRight, Target, Maximize, DollarSign, RefreshCw, XCircle
} from 'lucide-react';

const AllInsurancePage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('what-is');
  
  // Form State
  const [showForm, setShowForm] = useState(false); // Controls modal visibility

  const handleApplyClick = () => {
    // In a real app, this would open a modal or sheet
    alert("Opens Insurance Inquiry Form"); 
  };

  // --- Data Preserved from Original ---
  const insuranceTypes = [
    {
      category: 'Life Insurance',
      icon: Heart,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      desc: 'Financial protection for your family in case of unforeseen events.',
      plans: ['Term Plan (Pure Protection)', 'Endowment (Savings + Cover)', 'ULIP (Investment + Cover)']
    },
    {
      category: 'Health Insurance',
      icon: Activity,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      desc: 'Covers medical expenses, hospitalization, and critical illness treatments.',
      plans: ['Individual Health Plan', 'Family Floater', 'Critical Illness Cover']
    },
    {
      category: 'General Insurance',
      icon: Shield,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      desc: 'Protects assets like car, home, and travel against damages and theft.',
      plans: ['Car/Bike Insurance', 'Home Insurance', 'Travel Insurance']
    }
  ];

  const keyConsiderations = [
    { icon: Target, title: 'Coverage', desc: 'Ensure it covers your specific needs.' },
    { icon: DollarSign, title: 'Cost', desc: 'Compare premiums vs benefits.' },
    { icon: Maximize, title: 'Limits', desc: 'Check max payout amounts.' },
    { icon: RefreshCw, title: 'Renewability', desc: 'Check renewal terms & age limits.' },
    { icon: XCircle, title: 'Exclusions', desc: 'Know what is NOT covered.' }
  ];

  const advantages = [
    { icon: Shield, title: 'Protection', desc: 'Safety net against financial shocks.' },
    { icon: Umbrella, title: 'Peace of Mind', desc: 'Less stress about future risks.' },
    { icon: Users, title: 'Risk Sharing', desc: 'Community pool covers individual loss.' },
    { icon: FileText, title: 'Tax Benefits', desc: 'Deductions under 80C & 80D.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-14 text-slate-900">
      <Meta title="Insurance | Loanzaar" description="Life, Health & General Insurance." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </BackButton>
        <h1 className="text-sm font-bold text-slate-900">Insurance</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Financial Safety Net
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Protect what <br/> <span className="text-blue-100">matters most.</span>
            </h2>
            <p className="text-blue-50 text-sm mb-6 leading-relaxed">
              Comprehensive Life, Health, and Asset insurance plans starting @ ₹499/mo.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3 text-cyan-400" /> 99% Claim Ratio
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Check className="w-3 h-3 text-green-400" /> Tax Saver
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
            { id: 'what-is', label: 'Basics', icon: Info },
            { id: 'types', label: 'Types', icon: Umbrella },
            { id: 'benefits', label: 'Benefits', icon: Star },
            { id: 'tips', label: 'Tips', icon: HelpCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
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
          {activeTab === 'what-is' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">What is Insurance?</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  It is a contract where you pay a small premium to transfer your financial risk to an insurance company. If something bad happens (illness, accident, damage), they pay for the losses.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wide">How it Works</h3>
                <div className="space-y-4">
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 shadow-sm">1</div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-800">Pay Premium</h4>
                        <p className="text-xs text-slate-600">You pay a small amount regularly.</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 shadow-sm">2</div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-800">Risk Pooling</h4>
                        <p className="text-xs text-slate-600">Money is pooled from many people.</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 shadow-sm">3</div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-800">Claim Settlement</h4>
                        <p className="text-xs text-slate-600">Losses are paid from this pool.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* TYPES TAB */}
          {activeTab === 'types' && (
            <div className="space-y-4">
              {insuranceTypes.map((type, i) => (
                <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className={`px-4 py-3 border-b border-slate-100 flex items-center gap-3 ${type.bg}`}>
                    <type.icon className={`w-5 h-5 ${type.color}`} />
                    <h3 className="font-bold text-slate-800 text-sm">{type.category}</h3>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{type.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {type.plans.map((plan, j) => (
                        <span key={j} className="text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100">
                          {plan}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BENEFITS TAB */}
          {activeTab === 'benefits' && (
            <div className="grid grid-cols-2 gap-3">
              {advantages.map((adv, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-purple-600">
                    <adv.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{adv.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">{adv.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* TIPS TAB */}
          {activeTab === 'tips' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-xs text-orange-800 leading-relaxed">
                  Check these factors before buying any policy.
                </p>
              </div>
              
              <div className="space-y-3">
                {keyConsiderations.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="mt-0.5 min-w-[24px]">
                      <item.icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-50">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Secure Future</p>
            <p className="text-xs text-slate-400">Plans from top insurers</p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200"
          >
            Get Insured <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default AllInsurancePage;