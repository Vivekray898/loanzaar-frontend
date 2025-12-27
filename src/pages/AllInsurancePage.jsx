'use client'

import React, { useState } from 'react';
import Meta from '../components/Meta';
import BackButton from '../components/BackButton';
import AllInsuranceForm from '../components/forms/insurances/AllInsuranceForm'; 
import { 
  ChevronDown, Check, Star, Shield, Heart, Activity, 
  Umbrella, Users, FileText, Info, HelpCircle, 
  ArrowRight, Target, Maximize, DollarSign, RefreshCw, XCircle, Phone
} from 'lucide-react';

const AllInsurancePage = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('what-is');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const handleApplyClick = () => {
    setIsFormOpen(true);
  };

  // Smooth Scroll Handler
  const scrollToSection = (id) => {
    setActiveTab(id); // Keeps the button highlighted
    const element = document.getElementById(id);
    if (element) {
      // Adjusted offset to account for Header + Sticky Nav height
      const offset = 140; 
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
  const insuranceTypes = [
    {
      category: 'Life Insurance',
      icon: Heart,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      desc: 'Financial protection for your family in case of unforeseen events.',
      plans: ['Term Plan', 'Endowment', 'ULIP']
    },
    {
      category: 'Health Insurance',
      icon: Activity,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      desc: 'Covers medical expenses, hospitalization, and critical illness treatments.',
      plans: ['Individual Health', 'Family Floater', 'Critical Illness']
    },
    {
      category: 'General Insurance',
      icon: Shield,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      desc: 'Protects assets like car, home, and travel against damages and theft.',
      plans: ['Car/Bike', 'Home', 'Travel']
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
    <div className="min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0 text-slate-900">
      <Meta title="Insurance | Loanzaar" description="Life, Health & General Insurance." />
      
      {/* 1. Header (Universal) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" /> Back
          </BackButton>
          <h1 className="text-base md:text-lg font-bold text-slate-900">Insurance Hub</h1>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">

        {/* 2. Hero Section */}
        <section id="what-is" className="mb-8 scroll-mt-32">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                  Financial Safety Net
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Protect what <br className="hidden md:block"/> <span className="text-blue-100">matters most.</span>
                </h2>
                <p className="text-blue-50 text-sm md:text-lg mb-6 leading-relaxed max-w-lg">
                  Comprehensive Life, Health, and Asset insurance plans designed to secure your future.
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Shield className="w-4 h-4 text-cyan-400" /> 99% Claim Ratio
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Check className="w-4 h-4 text-green-400" /> Tax Saver
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
              { id: 'what-is', label: 'Basics', icon: Info },
              { id: 'types', label: 'Types', icon: Umbrella },
              { id: 'benefits', label: 'Benefits', icon: Star },
              { id: 'tips', label: 'Tips', icon: HelpCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300
                  ${activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
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
            
            {/* BASICS SECTION (Always Visible) */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  What is Insurance?
                </h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify mb-6">
                  Insurance is a financial contract that transfers the risk of potential financial loss from you to an insurance company. In exchange for a small periodic payment (premium), the insurer agrees to compensate you for specific losses or damages.
                </p>
                
                {/* How it Works */}
                <div className="bg-blue-50/80 p-6 rounded-2xl border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 mb-6 uppercase tracking-wide">How it Works</h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                     <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-lg shrink-0 shadow-sm border border-blue-100">1</div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-800">Pay Premium</h4>
                          <p className="text-xs text-slate-600 mt-0.5">Small regular payments.</p>
                        </div>
                     </div>
                     <div className="hidden md:block w-8 h-0.5 bg-blue-200"></div>
                     <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-lg shrink-0 shadow-sm border border-blue-100">2</div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-800">Risk Pooling</h4>
                          <p className="text-xs text-slate-600 mt-0.5">Funds are collected.</p>
                        </div>
                     </div>
                     <div className="hidden md:block w-8 h-0.5 bg-blue-200"></div>
                     <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-lg shrink-0 shadow-sm border border-blue-100">3</div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-800">Claim Payout</h4>
                          <p className="text-xs text-slate-600 mt-0.5">Losses are covered.</p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TYPES SECTION (Always Visible) */}
            <div id="types" className="scroll-mt-48 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Umbrella className="w-6 h-6 text-purple-600" /> Types of Insurance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {insuranceTypes.map((type, i) => (
                  <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className={`px-5 py-4 border-b border-slate-100 flex items-center gap-3 ${type.bg}`}>
                      <div className={`p-2 bg-white rounded-lg shadow-sm ${type.color}`}>
                        <type.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{type.category}</h3>
                    </div>
                    <div className="p-5 bg-white">
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{type.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {type.plans.map((plan, j) => (
                          <span key={j} className="text-xs font-semibold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100">
                            {plan}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BENEFITS SECTION (Always Visible) */}
            <div id="benefits" className="scroll-mt-48 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Key Benefits
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {advantages.map((adv, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-purple-600">
                      <adv.icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{adv.title}</h4>
                    <p className="text-xs text-slate-500 leading-tight">{adv.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* TIPS SECTION (Always Visible) */}
            <div id="tips" className="scroll-mt-48 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-slate-700" /> Buying Guide
              </h3>
              
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 mb-6">
                <Info className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-sm text-orange-800 leading-relaxed font-medium">
                  Check these key factors before purchasing any insurance policy.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyConsiderations.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="mt-0.5 p-2 bg-slate-50 rounded-lg text-slate-500 shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
             <div className="sticky top-32 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                   <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-600" /> Need Guidance?
                   </h3>
                   <p className="text-sm text-slate-500 mb-6">Confused about which insurance to buy? Our certified experts can help you choose the perfect plan.</p>
                   
                   <button 
                      onClick={handleApplyClick}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-6 py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200"
                   >
                      Get Free Consultation <ArrowRight className="w-5 h-5" />
                   </button>
                   <p className="text-center text-xs text-slate-400 mt-3">No spam. Only helpful advice.</p>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                      <Shield className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Secure Future</p>
                      <p className="text-xs text-slate-500">24/7 Claim Support</p>
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
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Insurance Plans</p>
            <p className="text-sm font-bold text-slate-900">Start @ ₹499/mo</p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200"
          >
            Get Insured <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AllInsuranceForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />

    </div>
  );
};

export default AllInsurancePage;