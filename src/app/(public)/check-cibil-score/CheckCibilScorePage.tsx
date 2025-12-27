'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Meta from '@/components/Meta';
import CibilScoreFormModal from '@/components/forms/others/CibilScoreFormModal'; // Import the new component
import { 
  ChevronDown, ShieldCheck, BarChart3, Search, Star, Lightbulb, 
  HelpCircle, LayoutGrid, CreditCard, Calendar, User, 
  ArrowRight, CheckCircle2, Lock, TrendingUp, Briefcase
} from 'lucide-react';

const CheckCibilScorePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // --- Scroll Logic ---
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const section = document.getElementById(`${tabId}-section`);
    if (section) {
      const headerOffset = 140; 
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // --- Content Data ---
  
  const scoreRanges = [
    { range: '750 - 900', label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Timely payments. Borrowers are considered low-risk and can get high loan amounts at attractive interest rates and minimal paperwork.' },
    { range: '700 - 749', label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'With a good CIBIL Score, your chances of loan approval increase. Further improve your score to get better interest rates.' },
    { range: '650 - 699', label: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', desc: 'Loan approval is possible but with higher interest rates and fewer benefits. Improve your score by making timely payments.' },
    { range: '550 - 649', label: 'Poor', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', desc: 'Delayed loan payments reflect the risk of not paying a loan on time. Improve your score by paying previous loans before applying for new ones.' },
    { range: '550 and below', label: 'Bad', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', desc: 'You have a low chance of getting a loan, especially for a high amount. Discipline your finances before applying for a loan.' },
  ];

  const benefits = [
    { title: 'Easy Loan Approvals', desc: 'Higher chances of loan approvals from banks and financial institutions.', icon: CheckCircle2, color: 'text-emerald-500' },
    { title: 'Better Interest Rates', desc: 'Access to loans at more competitive interest rates.', icon: TrendingUp, color: 'text-blue-500' },
    { title: 'Higher Credit Limits', desc: 'Eligibility for higher credit limits on credit cards.', icon: BarChart3, color: 'text-indigo-500' },
    { title: 'Faster Processing', desc: 'Quicker processing of your loan applications.', icon: CreditCard, color: 'text-purple-500' },
  ];

  const improvementTips = [
    { t: 'Pay On Time', d: 'Pay your bills on time. Late payments can hurt your CIBIL Score. Set up auto payments or reminders.', i: Calendar },
    { t: 'Manage Credit Utilisation', d: 'Use less than 30% of your total credit across all cards. Low balances show you manage credit well.', i: BarChart3 },
    { t: 'Diversify Credit', d: 'Have a mix of credit accounts, like Revolving Credit (cards) and Installment loans (home/auto).', i: LayoutGrid },
    { t: 'Use Secured Credit Cards', d: 'Building credit from scratch? A secured card against a deposit can establish good payment history.', i: Lock },
    { t: 'Keep Old Accounts', d: 'Older accounts contribute to longer credit history. Closing them can shorten history and spike utilisation.', i: Briefcase },
    { t: 'Monitor CIBIL Score', d: 'Regular monitoring helps you know the impact of financial activities and prevent identity theft.', i: Search },
    { t: 'Check Credit Reports', d: 'Check regularly for errors or fraud. Dispute with the bureau if you find inaccuracies.', i: ShieldCheck },
    { t: 'Seek Professional Help', d: 'Consider credit counselling if you need a personalized debt management plan.', i: User },
    { t: 'Apply Sparingly', d: 'Every application is a hard inquiry. Apply only when needed to avoid lowering your score.', i: Star },
  ];

  const faqs = [
    { q: 'What is a CIBIL score?', a: 'A CIBIL score represents your creditworthiness, calculated from your credit history. Ranging from 300 to 900, a higher score signals better health.' },
    { q: 'What is the maximum CIBIL score?', a: 'The maximum CIBIL score is 900. A score closer to 900 indicates excellent credit health and low lending risk.' },
    { q: 'How is my CIBIL score calculated?', a: 'It is calculated based on payment history (35%), credit utilization (30%), credit history length (15%), credit mix (10%), and new inquiries (10%).' },
    { q: 'Will my CIBIL score improve if I clear my dues?', a: 'Yes, clearing outstanding dues and closing old loans positively impacts your payment history and reduces debt burden, improving your score over time.' },
    { q: 'Do late payments affect my CIBIL score?', a: 'Yes, significantly. Payment history is the most important factor. Even a single late payment can drop your score.' },
    { q: 'How can I improve my CIBIL score?', a: 'Pay bills on time, keep credit utilization under 30%, maintain a healthy credit mix, and avoid multiple loan applications in a short time.' },
    { q: 'Would my score be affected if I checked it?', a: 'No. When you check your own score, it is a "soft inquiry" and does not affect your CIBIL score.' },
    { q: 'Where can I check my CIBIL score for a loan?', a: 'You can check it instantly for free here at Loanzaar. We provide a detailed report to help you understand your standing.' },
    { q: 'What factors affect my CIBIL score?', a: 'Key factors include Repayment History, Credit Utilization Ratio, Duration of Credit History, Credit Mix (Secured/Unsecured), and New Credit Inquiries.' },
    { q: 'Difference between CIBIL report and score?', a: 'The score is a 3-digit number summarizing your credit health. The report is a detailed document listing all your loans, cards, and payment history.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <Meta title="Free CIBIL Score Check | Loanzaar" description="Instantly check your CIBIL score with Loanzaar. Get a detailed credit report for free." />

      {/* 1. Main Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 h-16 transition-all">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <ChevronDown className="w-4 h-4 rotate-90 text-slate-500 group-hover:text-blue-600" />
                </div>
                <span className="font-bold text-slate-700">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Official Partner</span>
            </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 pt-12 pb-20 lg:pt-24 lg:pb-32 px-4">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <Lock className="w-3 h-3" /> Secure & Confidential
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                    Instantly Check Your <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">CIBIL Score</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                    Instantly check your CIBIL score with Loanzaar, India’s leading loan distribution company. Enjoy a seamless experience as you access your credit score for free and get a detailed credit report.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                    <button 
                        onClick={() => setShowModal(true)}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Check Score Now <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="flex -space-x-2">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                                {['A','S','K','P'][i-1]}
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold pl-1">
                            +5k
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Visual */}
            <div className="hidden lg:block relative">
                <div className="relative z-10 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl max-w-md mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <div className="space-y-1">
                            <div className="h-2 w-20 bg-slate-700 rounded"></div>
                            <div className="h-2 w-12 bg-slate-700 rounded"></div>
                        </div>
                        <div className="h-8 w-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <div className="flex justify-center py-8">
                        <div className="relative w-48 h-48 rounded-full border-[12px] border-slate-700 flex items-center justify-center border-t-emerald-500 border-r-emerald-500 transform -rotate-45">
                            <div className="transform rotate-45 text-center">
                                <span className="block text-5xl font-black text-white">785</span>
                                <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Excellent</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>)}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 3. Sticky Tab Bar */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto gap-1 py-3 scrollbar-hide">
                {[
                    { id: 'overview', icon: LayoutGrid, label: 'Overview' },
                    { id: 'ranges', icon: BarChart3, label: 'Score Ranges' },
                    { id: 'benefits', icon: Star, label: 'Benefits' },
                    { id: 'tips', icon: Lightbulb, label: 'Improve Tips' },
                    { id: 'faqs', icon: HelpCircle, label: 'FAQs' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`
                            flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap
                            ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}
                        `}
                    >
                        <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
        
        {/* SECTION: Overview & Importance */}
        <section id="overview-section" className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-4">What is the CIBIL Score?</h2>
                  <p className="text-slate-600 leading-relaxed text-lg">
                      A CIBIL score represents your creditworthiness, calculated from your credit history and financial behavior. Ranging from <span className="font-bold text-slate-900">300 to 900</span>, a higher CIBIL score signals better credit health. Financial institutions use this score to assess lending risk. A good CIBIL score can unlock favorable interest rates and loan terms.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <Search className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-1">Importance of Checking Online</h4>
                        <p className="text-sm text-slate-500">
                          Regularly checking your CIBIL score allows you to monitor your financial standing, catch any inaccuracies, and take steps to improve your score if needed. With convenient CIBIL score check online options, staying informed is simpler than ever.
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-xl text-slate-900 mb-4">How to Check for Free:</h3>
                    <div className="space-y-4">
                      {[
                        { s: 'Go to Check CIBIL Score', d: "Visit our website and click 'Check CIBIL Score'." },
                        { s: 'Sign in with Mobile', d: "Enter your mobile number for verification." },
                        { s: 'Fill out the Form', d: "Enter your details, including your PAN number." },
                        { s: 'Get Your Score', d: "View your CIBIL score instantly for free." }
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                           <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</div>
                           <div>
                              <p className="font-bold text-slate-900 text-sm">{step.s}</p>
                              <p className="text-xs text-slate-500">{step.d}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10">
                    <h3 className="font-bold text-xl mb-4">Managing Your Score with Loanzaar</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                      Managing your CIBIL score is effortless with us. Whether you're seeking loan products, mutual funds, or insurance, our extensive network of 275+ private banks, PSU banks, NBFCs, and financial companies ensures you get the best options tailored to your needs.
                    </p>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                       <h4 className="font-bold text-blue-400 text-sm mb-2">Why Loanzaar?</h4>
                       <ul className="space-y-2 text-xs text-slate-300">
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Free Score Checks</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Expert Advice</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Wide Bank Network</li>
                       </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* SECTION: Ranges */}
        <section id="ranges-section">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Score Range & Meaning</h2>
                <p className="text-slate-500">In India, the CIBIL Score ranges from 300-900.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {scoreRanges.map((item, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl border ${item.bg} ${item.border} flex flex-col justify-between hover:shadow-lg transition-shadow`}>
                        <div>
                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-black uppercase mb-3 bg-white ${item.color}`}>
                                {item.label}
                            </span>
                            <div className={`text-xl font-black mb-2 ${item.color}`}>{item.range}</div>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed opacity-90 ${item.color} text-slate-900`}>
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>

        {/* SECTION: Benefits */}
        <section id="benefits-section" className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-black text-slate-900 mb-4">Benefits of a High Score</h2>
                <p className="text-slate-500">Why regular online CIBIL score checks are essential.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((b, i) => (
                    <div key={i} className="text-center group">
                        <div className={`w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${b.color}`}>
                            <b.icon className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">{b.title}</h3>
                        <p className="text-sm text-slate-500">{b.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* SECTION: Tips */}
        <section id="tips-section">
            <h2 className="text-3xl font-black text-slate-900 mb-8">Tips to Improve Your Score</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {improvementTips.map((tip, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 transition-colors flex gap-4">
                        <div className="shrink-0 text-slate-400">
                            <tip.i className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{tip.t}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{tip.d}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* SECTION: FAQs */}
        <section id="faqs-section" className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">FAQs</h2>
            <div className="space-y-4">
                {faqs.map((f, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <button 
                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                            className="w-full flex justify-between items-center p-6 text-left"
                        >
                            <span className="font-bold text-slate-800 text-sm md:text-base">{f.q}</span>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                        </button>
                        {activeFaq === i && (
                            <div className="px-6 pb-6 pt-0">
                                <p className="text-sm text-slate-500 leading-relaxed pt-4 border-t border-slate-100">{f.a}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>

      </div>

      {/* --- FORM MODAL (Separate Component) --- */}
      <CibilScoreFormModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default CheckCibilScorePage;