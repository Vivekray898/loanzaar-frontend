'use client'

import React, { useState } from 'react';
import Meta from '../components/Meta';
import { submitInsuranceInquiry } from '../config/api';
import { 
  ChevronDown, Shield, Layers, Star, FileText, HelpCircle, 
  ArrowRight, Clock, CreditCard, ShieldCheck, Heart, Plane, 
  Home, Ship, Truck, Smartphone, Bike, Building, AlertTriangle, 
  UserX, File
} from 'lucide-react';

const GeneralInsurancePage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('what-is');
  const [activeFaq, setActiveFaq] = useState(null);

  const handleApplyClick = () => {
    alert("Opens General Insurance Inquiry Form"); 
  };

  // --- Data Preserved from Original ---
  const insuranceTypes = [
    { title: 'Motor Insurance', icon: Truck, desc: 'Covers accidents, theft, & damage for vehicles.' },
    { title: 'Health Insurance', icon: Heart, desc: 'Medical expense coverage for illness/injury.' },
    { title: 'Travel Insurance', icon: Plane, desc: 'Covers trip cancellations, lost luggage, & medical.' },
    { title: 'Home Insurance', icon: Home, desc: 'Protects property against fire, theft, & disasters.' },
    { title: 'Marine Insurance', icon: Ship, desc: 'Covers ships & cargo during sea voyages.' },
    { title: 'Rural Insurance', icon: Truck, desc: 'Protects agricultural assets & livestock.' }, // Using Truck as proxy for Tractor
    { title: 'Mobile Insurance', icon: Smartphone, desc: 'Covers damage, theft, or loss of smartphones.' },
    { title: 'Bicycle Insurance', icon: Bike, desc: 'Protects bicycles against theft & accidents.' },
    { title: 'Commercial Insurance', icon: Building, desc: 'Safeguards businesses from operational risks.' }
  ];

  const services = [
    { title: '24x7 Support', icon: Clock, desc: 'Client is our priority.' },
    { title: 'Easy Claims', icon: FileText, desc: 'Simple claim filing.' },
    { title: 'Easy Pay', icon: CreditCard, desc: 'Simple installments.' },
    { title: 'Secure', icon: ShieldCheck, desc: 'Asset protection.' }
  ];

  const policyTypes = [
    { title: 'Critical Illness', icon: AlertTriangle, desc: 'Lump sum for major illnesses + life cover.' },
    { title: 'Basic Plan', icon: File, desc: 'General insurance + basic life cover.' },
    { title: 'Accidental Death', icon: UserX, desc: 'Payout for accidental death + life cover.' }
  ];

  const faqs = [
    { q: 'What is general insurance?', a: 'Coverage for assets like cars, homes, and travel against financial loss from accidents or theft.' },
    { q: 'Why do I need it?', a: 'To protect against unexpected financial losses and ensure peace of mind.' },
    { q: 'What does it cover?', a: 'Varies by policy but typically covers vehicles, homes, travel, and other assets.' },
    { q: 'How to buy?', a: 'Compare policies online or through agents and choose coverage that fits your needs.' },
    { q: 'What is a premium?', a: 'Regular payment to maintain your insurance coverage.' },
    { q: 'How to use it?', a: 'File a claim when a covered event occurs for compensation.' },
    { q: 'Doctor/Repair shop choice?', a: 'Depends on policy; some have networks, others allow choice.' },
    { q: 'Is it expensive?', a: 'Cost varies but protects against much larger potential losses.' },
    { q: 'If I don\'t have it?', a: 'You bear full financial burden of accidents or damages.' },
    { q: 'Can I change plans?', a: 'Yes, typically during renewal periods.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      <Meta title="General Insurance | Loanzaar" description="Protect your assets." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </a>
        <h1 className="text-sm font-bold text-slate-900">General Insurance</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Asset Protection
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Secure what <br/> <span className="text-blue-100">you value.</span>
            </h2>
            <p className="text-blue-50 text-sm mb-6 leading-relaxed">
              Comprehensive coverage for your car, home, travel, and more.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3 text-cyan-400" /> 100% Secure
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Clock className="w-3 h-3 text-white" /> Quick Process
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
            { id: 'what-is', label: 'Basics', icon: Shield },
            { id: 'types', label: 'Types', icon: Layers },
            { id: 'services', label: 'Services', icon: Star },
            { id: 'policies', label: 'Policies', icon: FileText },
            { id: 'faqs', label: 'FAQs', icon: HelpCircle },
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
                <h3 className="text-lg font-bold text-slate-900 mb-2">What is it?</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  General insurance is a shield for your non-life assets like car, home, or travel. It helps pay for repairs or replacements if something unexpected happens.
                </p>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <h4 className="text-xs font-bold text-blue-800 mb-1">Asset Protection</h4>
                      <p className="text-[10px] text-blue-600 leading-tight">Safety for property & vehicles.</p>
                   </div>
                   <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <h4 className="text-xs font-bold text-blue-800 mb-1">Peace of Mind</h4>
                      <p className="text-[10px] text-blue-600 leading-tight">Security against financial loss.</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* TYPES TAB */}
          {activeTab === 'types' && (
            <div className="grid grid-cols-1 gap-3">
              {insuranceTypes.map((type, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 text-indigo-600">
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

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-2 gap-3">
              {services.map((svc, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-blue-600">
                    <svc.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{svc.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">{svc.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* POLICIES TAB */}
          {activeTab === 'policies' && (
            <div className="space-y-3">
              {policyTypes.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="mt-0.5 min-w-[24px]">
                    <item.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
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
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Protect Assets</p>
            <p className="text-xs text-slate-400">Comprehensive plans</p>
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

export default GeneralInsurancePage;