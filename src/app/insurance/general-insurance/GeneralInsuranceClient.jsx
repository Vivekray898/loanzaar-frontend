'use client'

import React, { useState } from 'react';
import Meta from '@/components/Meta';
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav';
import GeneralInsuranceForm from '@/components/forms/insurances/GeneralInsuranceForm'; // ✅ Import the form
import { 
  ChevronDown, Shield, Layers, Star, FileText, HelpCircle, 
  ArrowRight, Clock, CreditCard, ShieldCheck, Heart, Plane, 
  Home, Ship, Truck, Smartphone, Bike, Building, AlertTriangle, 
  UserX, File, Phone
} from 'lucide-react';

const GeneralInsuranceClient = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('what-is');
  const [activeFaq, setActiveFaq] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // ✅ Added state for form

  const handleApplyClick = () => {
    setIsFormOpen(true); // ✅ Toggle form state
  };

  // Smooth Scroll Handler
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Height of sticky headers
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
    { title: 'Motor Insurance', icon: Truck, desc: 'Covers accidents, theft, & damage for vehicles.' },
    { title: 'Health Insurance', icon: Heart, desc: 'Medical expense coverage for illness/injury.' },
    { title: 'Travel Insurance', icon: Plane, desc: 'Covers trip cancellations, lost luggage, & medical.' },
    { title: 'Home Insurance', icon: Home, desc: 'Protects property against fire, theft, & disasters.' },
    { title: 'Marine Insurance', icon: Ship, desc: 'Covers ships & cargo during sea voyages.' },
    { title: 'Rural Insurance', icon: Truck, desc: 'Protects agricultural assets & livestock.' },
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
    { q: 'How to use it?', a: 'File a claim when a covered event occurs for compensation.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0 text-slate-900">
      <Meta title="General Insurance | Loanzaar" description="Protect your assets." />
      
      {/* 1. Header (Universal) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" /> Back
          </BackButton>
          <h1 className="text-base md:text-lg font-bold text-slate-900">General Insurance</h1>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">

        {/* 2. Hero Section */}
        <section id="what-is" className="mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                  Asset Protection
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Secure what <br className="hidden md:block"/> <span className="text-blue-100">you value.</span>
                </h2>
                <p className="text-blue-50 text-sm md:text-lg mb-6 leading-relaxed max-w-lg">
                  Comprehensive coverage for your car, home, travel, and more. 100% secure with quick processing.
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Shield className="w-4 h-4 text-cyan-400" /> 100% Secure
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Clock className="w-4 h-4 text-white" /> Quick Process
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
              { id: 'what-is', label: 'Basics', icon: Shield },
              { id: 'types', label: 'Types', icon: Layers },
              { id: 'services', label: 'Services', icon: Star },
              { id: 'policies', label: 'Policies', icon: FileText },
              { id: 'faqs', label: 'FAQs', icon: HelpCircle },
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
            
            {/* BASICS SECTION */}
            <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab === 'what-is' ? 'block' : 'hidden lg:block'}`}>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  What is General Insurance?
                </h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify mb-6">
                  General insurance serves as a protective shield for your non-life assets such as your car, home, or travel plans. It ensures you are compensated for repairs or replacements if unexpected events like accidents, theft, or natural disasters occur.
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                      <h4 className="text-xs md:text-sm font-bold text-blue-800 mb-1">Asset Protection</h4>
                      <p className="text-[10px] md:text-xs text-blue-600 leading-tight">Safety for property & vehicles.</p>
                   </div>
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                      <h4 className="text-xs md:text-sm font-bold text-blue-800 mb-1">Peace of Mind</h4>
                      <p className="text-[10px] md:text-xs text-blue-600 leading-tight">Security against financial loss.</p>
                   </div>
                </div>
              </div>
            </div>

            {/* TYPES SECTION */}
            <div id="types" className={`scroll-mt-32 border-t border-slate-200 pt-8 ${activeTab === 'types' ? 'block' : 'hidden lg:block'}`}>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-600" /> Types of Insurance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {insuranceTypes.map((type, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
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

            {/* SERVICES SECTION */}
            <div id="services" className={`scroll-mt-32 border-t border-slate-200 pt-8 ${activeTab === 'services' ? 'block' : 'hidden lg:block'}`}>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Our Services
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {services.map((svc, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-blue-600">
                      <svc.icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{svc.title}</h4>
                    <p className="text-xs text-slate-500 leading-tight">{svc.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* POLICIES SECTION */}
            <div id="policies" className={`scroll-mt-32 border-t border-slate-200 pt-8 ${activeTab === 'policies' ? 'block' : 'hidden lg:block'}`}>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-slate-700" /> Specialized Policies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {policyTypes.map((item, i) => (
                  <div key={i} className="flex flex-col p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-blue-500 mb-3">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQS SECTION */}
            <div id="faqs" className={`scroll-mt-32 border-t border-slate-200 pt-8 ${activeTab === 'faqs' ? 'block' : 'hidden lg:block'}`}>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-slate-700" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((item, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-blue-300 transition-colors">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full flex justify-between items-center p-5 text-left"
                    >
                      <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180 text-blue-600' : ''}`} />
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
                      <Phone className="w-5 h-5 text-blue-600" /> Expert Assistance
                   </h3>
                   <p className="text-sm text-slate-500 mb-6">Not sure which insurance is right for your asset? Speak to our certified experts.</p>
                   
                   <button 
                      onClick={handleApplyClick}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-6 py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200"
                   >
                      Get Quote Now <ArrowRight className="w-5 h-5" />
                   </button>
                   <p className="text-center text-xs text-slate-400 mt-3">Free quotes. No obligation.</p>
                </div>
                
                {/* Trust Badge Widget */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Claim Assistance</p>
                      <p className="text-xs text-slate-500">24/7 Support Team</p>
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
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Asset Cover</p>
            <p className="text-sm font-bold text-slate-900">Get Quote</p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ✅ Wired Form Component */}
      <GeneralInsuranceForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />

    <BottomNav />            
    </div>
  );
};

export default GeneralInsuranceClient;