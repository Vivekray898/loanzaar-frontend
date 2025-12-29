'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Meta from '@/components/Meta'
import BottomNav from '@/components/BottomNav'
import { 
  Shield, Lock, Eye, FileText, Server, Globe, 
  ChevronRight, ArrowUp, CheckCircle2, AlertCircle, Mail
} from 'lucide-react'

// --- Section Data ---
const sections = [
  { id: 'intro', title: '1. Introduction', icon: Shield },
  { id: 'collection', title: '2. Info We Collect', icon: FileText },
  { id: 'usage', title: '3. Data Usage', icon: Server },
  { id: 'sharing', title: '4. Sharing Policy', icon: Globe },
  { id: 'security', title: '5. Security', icon: Lock },
  { id: 'rights', title: '6. User Rights', icon: Eye },
  { id: 'cookies', title: '7. Cookies', icon: AlertCircle },
]

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('intro')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250 // Increased offset for better trigger
      
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 120
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-24">
      <Meta 
        title="Privacy Policy | Loanzaar" 
        description="We are committed to protecting your personal data. Read our full privacy policy." 
      />

      {/* 1. Minimalist Header */}
      <header className="bg-white border-b border-slate-200 pt-24 pb-12 md:pt-32 md:pb-16 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-blue-600 font-bold tracking-wide uppercase text-xs mb-3">Legal Center</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Privacy Policy
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                We believe in transparency. Here is a clear breakdown of how we handle your data, your rights, and our security measures.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Effective Date</p>
              <p className="text-sm font-bold text-slate-900">December 28, 2025</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* =========================================
              LEFT NAV RAIL (Sticky)
             ========================================= */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 pl-4">Table of Contents</p>
              
              <nav className="relative border-l border-slate-200 ml-3">
                {sections.map((item) => {
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`
                        block w-full text-left pl-6 py-2 text-sm transition-all duration-200 relative
                        ${isActive 
                          ? 'text-blue-600 font-bold' 
                          : 'text-slate-500 hover:text-slate-800 font-medium'}
                      `}
                    >
                      {/* Active Indicator Line */}
                      {isActive && (
                        <span className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-blue-600 rounded-full transition-all"></span>
                      )}
                      {item.title}
                    </button>
                  )
                })}
              </nav>

              <div className="mt-10 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Mail className="w-5 h-5 text-slate-400 mb-3" />
                <p className="text-sm font-bold text-slate-900 mb-1">Questions?</p>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Our Data Protection Officer is here to help you.
                </p>
                <Link href="mailto:privacy@loanzaar.in" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  privacy@loanzaar.in
                </Link>
              </div>
            </div>
          </aside>

          {/* =========================================
              MAIN DOCUMENT CONTENT
             ========================================= */}
          <main className="lg:col-span-8 lg:col-start-5">
            
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-12 space-y-16">
              
              {/* 1. Introduction */}
              <section id="intro" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">1</span>
                  Introduction
                </h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>
                    Welcome to <strong>Loanzaar</strong> ("we," "our," or "us"). We value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>loanzaar.in</strong> or use our services.
                  </p>
                  <p className="p-4 bg-slate-50 rounded-xl border-l-4 border-blue-500 text-sm italic">
                    By accessing or using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms, please do not access the site.
                  </p>
                </div>
              </section>

              {/* 2. Collection */}
              <section id="collection" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">2</span>
                  Information We Collect
                </h2>
                <p className="text-slate-600 mb-6">
                  We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoCard title="Personal Identity">
                    <ul className="space-y-2">
                      <Li>Full Legal Name</Li>
                      <Li>Email Address</Li>
                      <Li>Phone Number</Li>
                      <Li>PAN / Aadhaar Details</Li>
                    </ul>
                  </InfoCard>
                  <InfoCard title="Financial Data">
                    <ul className="space-y-2">
                      <Li>Employment Status</Li>
                      <Li>Income Statements</Li>
                      <Li>Bank Details (if uploaded)</Li>
                      <Li>Credit History</Li>
                    </ul>
                  </InfoCard>
                </div>
              </section>

              {/* 3. Usage */}
              <section id="usage" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">3</span>
                  How We Use Data
                </h2>
                <ul className="grid gap-3 text-slate-600">
                  <CheckItem text="To process loan applications securely and efficiently." />
                  <CheckItem text="To connect you with relevant lending partners (Banks/NBFCs)." />
                  <CheckItem text="To verify your identity and prevent fraudulent activities." />
                  <CheckItem text="To comply with legal obligations and RBI regulations." />
                </ul>
              </section>

              {/* 4. Sharing */}
              <section id="sharing" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">4</span>
                  Information Sharing
                </h2>
                <p className="text-slate-600 mb-6">
                  We strictly do not sell your personal data. We only share information when necessary to provide our services:
                </p>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid gap-6 md:grid-cols-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Lending Partners</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Banks & NBFCs required to process your specific loan request.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Service Providers</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Third-party vendors for KYC verification, SMS, and email delivery.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Legal Bodies</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">If required by Indian law, court order, or government regulation.</p>
                  </div>
                </div>
              </section>

              {/* 5. Security */}
              <section id="security" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">5</span>
                  Data Security
                </h2>
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <Lock className="w-6 h-6 text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-900 mb-1">Bank-Grade Encryption</h4>
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      We use 256-bit SSL encryption for all data transmission. Your sensitive documents are stored in secure, encrypted cloud environments with strict access controls.
                    </p>
                  </div>
                </div>
              </section>

              {/* 6. Rights */}
              <section id="rights" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">6</span>
                  Your Rights
                </h2>
                <p className="text-slate-600 mb-4">Under applicable laws, you have the right to:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="block font-bold text-slate-800 text-sm">Access Data</span>
                    <span className="text-xs text-slate-500">Request a copy of your personal data.</span>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="block font-bold text-slate-800 text-sm">Correct Data</span>
                    <span className="text-xs text-slate-500">Update inaccurate or incomplete info.</span>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="block font-bold text-slate-800 text-sm">Delete Data</span>
                    <span className="text-xs text-slate-500">Request removal of your account.</span>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="block font-bold text-slate-800 text-sm">Opt-Out</span>
                    <span className="text-xs text-slate-500">Unsubscribe from marketing emails.</span>
                  </div>
                </div>
              </section>

              {/* 7. Cookies */}
              <section id="cookies" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">7</span>
                  Cookies & Tracking
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We use cookies solely to enhance your browsing experience, analyze site traffic, and remember your preferences. You can disable cookies in your browser settings, though this may impact some website features.
                </p>
              </section>

            </div>

            {/* Footer Note */}
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-400">
                For any privacy concerns, reach us at <a href="mailto:privacy@loanzaar.in" className="text-blue-600 font-semibold hover:underline">privacy@loanzaar.in</a>
              </p>
            </div>

          </main>
        </div>
      </div>

      {/* Scroll to Top (Mobile Only) */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-4 p-3 bg-slate-900 text-white rounded-full shadow-lg lg:hidden z-40 active:scale-95 transition-transform"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <BottomNav />
    </div>
  )
}

// --- Helper Components for clean JSX ---

function InfoCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]">
      <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 text-sm uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-slate-600">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
      {children}
    </li>
  )
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
      <span className="text-slate-700">{text}</span>
    </li>
  )
}