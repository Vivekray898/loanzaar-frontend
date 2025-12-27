'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Meta from '@/components/Meta'
import BottomNav from '@/components/BottomNav'
import { 
  Shield, Lock, Eye, FileText, Server, Globe, 
  ChevronRight, ArrowUp, CheckCircle2, AlertCircle
} from 'lucide-react'

// --- Section Data for Easy Maintenance ---
const sections = [
  { id: 'intro', title: 'Introduction', icon: Shield },
  { id: 'collection', title: 'Information We Collect', icon: FileText },
  { id: 'usage', title: 'How We Use Your Data', icon: Server },
  { id: 'sharing', title: 'Information Sharing', icon: Globe },
  { id: 'security', title: 'Data Security', icon: Lock },
  { id: 'rights', title: 'Your Rights & Choices', icon: Eye },
  { id: 'cookies', title: 'Cookies & Tracking', icon: AlertCircle },
]

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('intro')

  // Scroll Spy Logic to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200 // Offset
      
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
      const offset = 100 // Header height
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 md:pb-12">
      <Meta 
        title="Privacy Policy | Loanzaar" 
        description="Read our Privacy Policy to understand how Loanzaar collects, uses, and protects your personal information." 
      />

      {/* 1. Header Section */}
      <div className="bg-slate-900 text-white pt-16 pb-20 md:pt-24 md:pb-32 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Lock className="w-3 h-3" /> Last Updated: December 28, 2025
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            Your privacy is our priority. We are committed to protecting your personal data and ensuring transparency in how we handle it.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* =========================================
              LEFT SIDEBAR: Table of Contents (Desktop)
             ========================================= */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">Contents</p>
              <nav className="space-y-1">
                {sections.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all
                      ${activeSection === item.id 
                        ? 'bg-white text-blue-600 shadow-md shadow-slate-200/50 border border-blue-100' 
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'}
                    `}
                  >
                    <item.icon className={`w-4 h-4 ${activeSection === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    {item.title}
                    {activeSection === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm font-bold text-blue-900 mb-1">Need help?</p>
                <p className="text-xs text-blue-700 mb-3">Contact our Data Protection Officer.</p>
                <Link href="/contact-us" className="text-xs font-bold text-blue-600 hover:underline">
                  Contact Support &rarr;
                </Link>
              </div>
            </div>
          </aside>

          {/* =========================================
              MAIN CONTENT
             ========================================= */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* 1. Introduction */}
            <section id="intro" className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">1. Introduction</h2>
              </div>
              <div className="prose prose-slate prose-sm md:prose-base max-w-none text-slate-600">
                <p>
                  Welcome to <strong>Loanzaar</strong> ("we," "our," or "us"). We value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>loanzaar.in</strong> or use our services.
                </p>
                <p>
                  By accessing or using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </div>
            </section>

            {/* 2. Information Collection */}
            <section id="collection" className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">2. Information We Collect</h2>
              </div>
              <div className="space-y-6 text-slate-600 text-sm md:text-base">
                <p>We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device.</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-3">Personal Information</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> Full Name</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> Email Address</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> Phone Number</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> PAN Card / Aadhaar details</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-3">Financial Information</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" /> Income Details</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" /> Employment Status</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" /> Bank Statements (if uploaded)</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" /> Credit Score Data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Usage */}
            <section id="usage" className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Server className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">3. How We Use Your Data</h2>
              </div>
              <ul className="space-y-4 text-slate-600 text-sm md:text-base list-disc pl-5">
                <li>To provide, maintain, and improve our services, including processing loan applications.</li>
                <li>To facilitate the connection between you and our lending partners (Banks/NBFCs).</li>
                <li>To verify your identity and prevent fraud.</li>
                <li>To communicate with you regarding your account, updates, and promotional offers.</li>
                <li>To comply with legal obligations and regulatory requirements.</li>
              </ul>
            </section>

            {/* 4. Sharing */}
            <section id="sharing" className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">4. Information Sharing</h2>
              </div>
              <p className="text-slate-600 mb-4 text-sm md:text-base">We do not sell your personal data. We may share your information with:</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 text-center">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Lending Partners</h4>
                  <p className="text-xs text-slate-500">Banks & NBFCs for loan processing.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 text-center">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Service Providers</h4>
                  <p className="text-xs text-slate-500">For KYC, SMS, and email services.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 text-center">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Legal Authorities</h4>
                  <p className="text-xs text-slate-500">If required by law or court order.</p>
                </div>
              </div>
            </section>

            {/* 5. Security */}
            <section id="security" className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">5. Data Security</h2>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                We implement industry-standard security measures, including <strong>256-bit SSL encryption</strong>, to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* 6. Rights */}
            <section id="rights" className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">6. Your Rights</h2>
              </div>
              <p className="text-slate-600 text-sm md:text-base mb-4">You have the right to:</p>
              <ul className="space-y-3 text-slate-600 text-sm md:text-base">
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2"></div>
                  <span>Access the personal data we hold about you.</span>
                </li>
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2"></div>
                  <span>Request correction of inaccurate data.</span>
                </li>
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2"></div>
                  <span>Request deletion of your data (subject to legal retention requirements).</span>
                </li>
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2"></div>
                  <span>Opt-out of marketing communications.</span>
                </li>
              </ul>
            </section>

            {/* 7. Cookies */}
            <section id="cookies" className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">7. Cookies Policy</h2>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                We use cookies to enhance your experience, analyze site traffic, and personalize content. You can choose to disable cookies through your browser settings, though this may affect the functionality of our website.
              </p>
            </section>

            {/* Contact Footer */}
            <div className="mt-12 p-8 bg-slate-100 rounded-[2rem] text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Have questions about your privacy?</h3>
              <p className="text-slate-500 mb-6 text-sm">Reach out to our privacy team for clarification.</p>
              <Link 
                href="mailto:privacy@loanzaar.in" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 font-bold rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                Email Privacy Team
              </Link>
            </div>

          </main>
        </div>
      </div>

      {/* Scroll to Top Button (Mobile) */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-4 p-3 bg-slate-900 text-white rounded-full shadow-lg lg:hidden z-40"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <BottomNav />
    </div>
  )
}