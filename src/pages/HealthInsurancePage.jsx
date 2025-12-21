'use client'

import React, { useState } from 'react';
import Meta from '../components/Meta';
import { submitInsuranceInquiry } from '../config/api';
import { 
  ChevronDown, Check, Shield, Heart, Activity, 
  Umbrella, Users, FileText, Info, HelpCircle, 
  ArrowRight, DollarSign, Clock, CreditCard, ShieldCheck,
  Target, Maximize, MinusCircle, Network, XCircle, RefreshCw
} from 'lucide-react';

const HealthInsurancePage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('basics');
  const [activeFaq, setActiveFaq] = useState(null);

  const handleApplyClick = () => {
    alert("Opens Health Insurance Inquiry Form"); 
  };

  // --- Data Preserved from Original ---
  const planTypes = [
    { title: 'Indemnity Plan', icon: Users, desc: 'Fee-for-Service. Choose your own doctor. Pay upfront & get reimbursed.' },
    { title: 'Fixed Benefit', icon: DollarSign, desc: 'Specific payouts for defined events (e.g., surgery, critical illness) regardless of actual cost.' }
  ];

  const services = [
    { title: '24x7 Support', icon: Clock, desc: 'Round-the-clock assistance.' },
    { title: 'Easy Claims', icon: FileText, desc: 'Streamlined filing process.' },
    { title: 'Easy Pay', icon: CreditCard, desc: 'Simple premium installments.' },
    { title: 'Secure', icon: ShieldCheck, desc: 'Robust data & asset protection.' }
  ];

  const coverage = [
    'Hospitalization (Room, Surgery)',
    'Outpatient (Consults, Diagnostics)',
    'Medications (Prescriptions)',
    'Emergency (ER, Ambulance)',
    'Preventive (Vaccines, Check-ups)',
    'Specialist Treatments',
    'Maternity & Newborn Care',
    'Lab Tests & Imaging',
    'Mental Health Support'
  ];

  const keyTerms = [
    { term: 'Premium', def: 'Regular payment for coverage.', icon: DollarSign },
    { term: 'Deductible', def: 'Your initial out-of-pocket cost.', icon: MinusCircle },
    { term: 'Co-pay', def: 'Fixed amount you pay per service.', icon: CreditCard },
    { term: 'Network', def: 'Approved doctors & hospitals list.', icon: Network },
    { term: 'Claim', def: 'Request for payment after care.', icon: FileText },
    { term: 'Pre-existing', def: 'Health issues before policy start.', icon: Activity },
    { term: 'Exclusion', def: 'Services NOT covered.', icon: XCircle },
    { term: 'Limit', def: 'Max payout amount.', icon: Maximize }
  ];

  const faqs = [
    { q: 'What is health insurance?', a: 'Coverage that pays for medical and surgical expenses, protecting you from high healthcare costs.' },
    { q: 'Why do I need it?', a: 'To protect against high medical bills, ensure access to quality care, and maintain financial stability.' },
    { q: 'What is covered?', a: 'Hospitalization, outpatient care, meds, emergency services, preventive care, and more.' },
    { q: 'How does it work?', a: 'You pay premiums. Insurer pays medical costs (minus deductibles/co-pays) up to limits.' },
    { q: 'Can I choose my doctor?', a: 'Depends on plan. Indemnity plans offer choice; network plans restrict to approved providers.' },
    { q: 'What is a deductible?', a: 'Amount you pay before insurance starts covering costs.' },
    { q: 'Waiting period?', a: 'Yes, usually 30-90 days before coverage kicks in for non-emergencies.' },
    { q: 'Pre-existing conditions?', a: 'Coverage varies; often covered after a waiting period.' },
    { q: 'How to claim?', a: 'Submit bills and forms to insurer. Cashless claims available at network hospitals.' },
    { q: 'Tax benefits?', a: 'Yes, premiums are deductible under Section 80D.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      <Meta title="Health Insurance | Loanzaar" description="Protect your health & finances." />
      
      {/* 1. Mobile Header (Sticky) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" /> Back
        </a>
        <h1 className="text-sm font-bold text-slate-900">Health Insurance</h1>
        <div className="w-8"></div>
      </nav>

      {/* 2. Compact Hero Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              Medical Cover
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Best care for <br/> <span className="text-blue-100">your health.</span>
            </h2>
            <p className="text-blue-50 text-sm mb-6 leading-relaxed">
              Comprehensive plans covering hospitalization, surgery, and critical illness.
            </p>
            
            <div className="flex gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3 text-cyan-400" /> Cashless
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <FileText className="w-3 h-3 text-white" /> Tax Benefit
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
            { id: 'plans', label: 'Plans', icon: Activity },
            { id: 'coverage', label: 'Coverage', icon: Shield },
            { id: 'terms', label: 'Terms', icon: FileText },
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
          {activeTab === 'basics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">What is it?</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Health insurance pays for medical expenses. It protects you from high costs of illness or injury and ensures access to quality care.
                </p>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <h4 className="text-xs font-bold text-blue-800 mb-1">Financial Safety</h4>
                      <p className="text-[10px] text-blue-600 leading-tight">No burden during emergencies.</p>
                   </div>
                   <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <h4 className="text-xs font-bold text-blue-800 mb-1">Better Access</h4>
                      <p className="text-[10px] text-blue-600 leading-tight">Quality care when needed.</p>
                   </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Our Services</h3>
                <div className="grid grid-cols-2 gap-3">
                  {services.map((svc, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col items-center text-center">
                      <svc.icon className="w-6 h-6 text-blue-500 mb-2" />
                      <h4 className="text-xs font-bold text-slate-900">{svc.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">{svc.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PLANS TAB */}
          {activeTab === 'plans' && (
            <div className="grid grid-cols-1 gap-3">
              {planTypes.map((plan, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 text-indigo-600">
                    <plan.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{plan.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{plan.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* COVERAGE TAB */}
          {activeTab === 'coverage' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-800 leading-relaxed">
                  We cover a wide range of medical expenses, from hospital stays to mental health.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {coverage.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TERMS TAB */}
          {activeTab === 'terms' && (
            <div className="space-y-3">
              {keyTerms.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="mt-0.5 min-w-[24px]">
                    <item.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.term}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.def}</p>
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
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Secure Health</p>
            <p className="text-xs text-slate-400">Plans starting @ ₹299/mo</p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200"
          >
            Get Covered <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default HealthInsurancePage;