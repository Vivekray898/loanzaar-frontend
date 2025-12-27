'use client'

import React, { useState } from 'react';
import Meta from '@/components/Meta';
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav'
import HealthInsuranceForm from '@/components/forms/insurances/HealthInsuranceForm'; // ✅ Import Form
import { 
  ChevronDown, Check, Shield, Heart, Activity, 
  Umbrella, Users, FileText, Info, HelpCircle, 
  ArrowRight, DollarSign, Clock, CreditCard, ShieldCheck,
  Target, Maximize, MinusCircle, Network, XCircle, Phone
} from 'lucide-react';

const HealthInsuranceClient = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('basics');
  const [activeFaq, setActiveFaq] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // ✅ Added State for Form

  const handleApplyClick = () => {
    setIsFormOpen(true); // ✅ Open Form instead of alert
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
    { term: 'Limit', def: 'Max payout amount.', icon: Maximize },
    { term: 'Exclusion', def: 'Services NOT covered.', icon: XCircle }
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
    <div className="min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0 text-slate-900">
      <Meta title="Health Insurance | Loanzaar" description="Protect your health & finances." />
      
      {/* 1. Header (Universal) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <BackButton className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" /> Back
          </BackButton>
          <h1 className="text-base md:text-lg font-bold text-slate-900">Health Insurance</h1>
          <div className="w-8"></div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">

        {/* 2. Hero Section */}
        <section id="basics" className="mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
                  Total Medical Cover
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Best care for <br className="hidden md:block"/> <span className="text-blue-100">your health.</span>
                </h2>
                <p className="text-blue-50 text-sm md:text-lg mb-6 leading-relaxed max-w-lg">
                  Comprehensive plans covering hospitalization, surgery, and critical illness. Cashless treatment at 5000+ hospitals.
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <Shield className="w-4 h-4 text-cyan-400" /> Cashless
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
              { id: 'plans', label: 'Plans', icon: Activity },
              { id: 'coverage', label: 'Coverage', icon: Shield },
              { id: 'terms', label: 'Terms', icon: FileText },
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  What is Health Insurance?
                </h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-justify mb-6">
                  Health insurance pays for medical expenses. It protects you from high costs of illness or injury and ensures access to quality care without depleting your savings.
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h4 className="text-xs md:text-sm font-bold text-blue-800 mb-1">Financial Safety</h4>
                      <p className="text-[10px] md:text-xs text-blue-600 leading-tight">No burden during emergencies.</p>
                   </div>
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h4 className="text-xs md:text-sm font-bold text-blue-800 mb-1">Better Access</h4>
                      <p className="text-[10px] md:text-xs text-blue-600 leading-tight">Quality care when needed.</p>
                   </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Our Services</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {services.map((svc, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                      <svc.icon className="w-6 h-6 text-blue-500 mb-2" />
                      <h4 className="text-xs md:text-sm font-bold text-slate-900">{svc.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">{svc.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PLANS SECTION */}
            <div id="plans" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" /> Plan Types
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planTypes.map((plan, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 text-indigo-600">
                      <plan.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{plan.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">{plan.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COVERAGE SECTION */}
            <div id="coverage" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-600" /> What's Covered?
              </h3>
              
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 mb-6">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                  We cover a wide range of medical expenses, from hospital stays to mental health support.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {coverage.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-emerald-100 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TERMS SECTION */}
            <div id="terms" className="scroll-mt-32 border-t border-slate-200 pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-slate-700" /> Key Terms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyTerms.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="mt-0.5 p-2 bg-slate-50 rounded-lg text-blue-500 shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.term}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.def}</p>
                    </div>
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
                      <Phone className="w-5 h-5 text-blue-600" /> Need Help?
                   </h3>
                   <p className="text-sm text-slate-500 mb-6">Confused about deductibles or co-pays? Our experts are here to help you choose the right plan.</p>
                   
                   <button 
                      onClick={handleApplyClick}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-6 py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200"
                   >
                      Get Free Consultation <ArrowRight className="w-5 h-5" />
                   </button>
                   <p className="text-center text-xs text-slate-400 mt-3">Plans starting @ ₹299/mo</p>
                </div>
                
                {/* Trust Badge Widget */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Verified Plans</p>
                      <p className="text-xs text-slate-500">IRDAI Approved</p>
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
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Health Plans</p>
            <p className="text-sm font-bold text-slate-900">Start @ ₹299/mo</p>
          </div>
          <button 
            onClick={handleApplyClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200"
          >
            Get Covered <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ✅ Wired Form Component */}
      <HealthInsuranceForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />

  <BottomNav />
    </div>
  );
};

export default HealthInsuranceClient;