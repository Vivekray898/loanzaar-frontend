'use client'

import React, { useState, useEffect } from 'react'
import StructuredData from '@/components/StructuredData'
import { generateWebPageSchema } from '@/utils/schema'
import {
  Banknote, CreditCard, Briefcase, Home, Building, RefreshCw, Zap, Wallet,
  Smartphone, Lightbulb, TrendingUp, Landmark, HeartPulse, Car,
  Umbrella, ChevronRight, Shield, CheckCircle, Clock, Percent, Factory,
  AlertCircle, ChevronDown, CheckCircle2, ArrowRight
} from 'lucide-react'

interface HeroSlide {
  id: number
  title: string
  link: string
  image: string
}

interface ProductItem {
  title: string
  icon: React.ElementType
  iconColor: string
  link?: string
  ribbon?: string
  ribbonColor?: string
}

const heroSlides: HeroSlide[] = [
  { id: 1, title: 'Personal Loan', link: '/personal-loan', image: '/images/banners/webPLMPGenericBanner.png' },
  { id: 2, title: 'Credit Score', link: '/check-cibil-score', image: '/images/banners/webBureauAcquisitionBanner.png' },
  { id: 3, title: 'Credit Cards', link: '/credit-cards', image: '/images/banners/mwebCCMPGenericBanner.png' }
]

const loansAndCards: ProductItem[] = [
  { title: 'Personal', icon: Banknote, ribbon: 'Instant', ribbonColor: 'bg-orange-100 text-orange-700', iconColor: 'text-orange-500', link: '/loans/personal-loan' },
  { title: 'Credit Card', icon: CreditCard, ribbon: 'Offers', ribbonColor: 'bg-green-100 text-green-700', iconColor: 'text-blue-600', link: '/credit-cards' },
  { title: 'Business', icon: Briefcase, iconColor: 'text-slate-700', link: '/loans/business-loan' },
  { title: 'Home Loan', icon: Home, iconColor: 'text-emerald-600', link: '/loans/home-loan' },
  { title: 'Property', icon: Building, iconColor: 'text-indigo-600', link: '/loans/loan-against-property' },
  { title: 'Education', icon: Landmark, iconColor: 'text-blue-600', link: '/loans/education-loan' },
  { title: 'Machinery', icon: Factory, iconColor: 'text-slate-700', link: '/loans/machinery-loan' },
  { title: 'Gold', icon: Percent, iconColor: 'text-yellow-600', link: '/loans/gold-loan' },
  { title: 'Solar', icon: Lightbulb, iconColor: 'text-amber-400', link: '/loans/solar-loan' },
  { title: 'Transfer', icon: RefreshCw, iconColor: 'text-sky-700', link: '/loans/home-loan' },
  { title: 'Instant', icon: Zap, iconColor: 'text-yellow-500', link: '/loans/personal-loan' },
  { title: 'Premium', icon: Wallet, iconColor: 'text-purple-600', link: '/credit-cards' }
]

const insuranceItems: ProductItem[] = [
  { title: 'Health', icon: HeartPulse, iconColor: 'text-rose-500' },
  { title: 'General', icon: Shield, iconColor: 'text-amber-600' },
  { title: 'Term Life', icon: Umbrella, iconColor: 'text-blue-500' },
  { title: 'Invest', icon: Landmark, iconColor: 'text-emerald-600' },
]

const faqs = [
  { q: 'How can I check my CIBIL score for free?', a: 'You can check your CIBIL score for free on Loanzaar by entering your PAN card details. We provide a detailed report analysis instantly.' },
  { q: 'What is the interest rate for a personal loan?', a: 'Personal loan interest rates on Loanzaar start from 10.49% p.a., depending on your credit score, income, and employer profile.' },
  { q: 'Can I apply for a credit card without income proof?', a: 'Yes, some banks offer credit cards against fixed deposits (secured cards) or based on existing relationship value without requiring strict income proof.' },
]

const CompactIcon: React.FC<{ item: ProductItem }> = ({ item }) => (
  <a href={item.link || '#'} className="group flex flex-col items-center justify-center p-2 md:p-4 rounded-2xl transition-all duration-300 hover:bg-slate-50 hover:scale-105 active:scale-95 border border-transparent hover:border-slate-100 hover:shadow-sm h-full" aria-label={item.title}>
    <div className={`relative w-11 h-11 md:w-14 md:h-14 mb-2 md:mb-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center ${item.iconColor} bg-opacity-5`}>
      <item.icon className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
      {item.ribbon && <span className={`absolute -top-2 -right-2 text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10 ${item.ribbonColor}`}>{item.ribbon}</span>}
    </div>
    <span className="text-[11px] md:text-sm font-semibold text-slate-700 group-hover:text-slate-900 text-center leading-tight">{item.title}</span>
  </a>
)

const SectionTitle: React.FC<{ title: string; action?: { label: string; link: string } }> = ({ title, action }) => (
  <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
    <h3 className="text-base md:text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
    {action && (
      <a href={action.link} className="group flex items-center text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
        {action.label}
        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-0.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    )}
  </div>
)

const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative mt-4 lg:bg-white lg:rounded-[2.5rem] lg:p-12 lg:shadow-sm lg:border lg:border-slate-100 overflow-hidden">
      <div className="hidden lg:block absolute top-0 left-0 w-full h-full bg-slate-50/40 -z-10" />
      <div className="flex flex-col lg:flex-row items-center lg:gap-16">
        <div className="hidden lg:flex w-full lg:w-[554px] lg:h-[258px] lg:justify-center flex-col z-10 text-left">
          <div className="mb-4">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs tracking-wider uppercase">Celebrate with Loanzaar</span>
          </div>
          <h1 className="text-[2.75rem] leading-[1.1] font-extrabold text-slate-900 tracking-tight mb-8">India's best platform for <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Loans, Cards & Investments</span></h1>
          <div className="flex flex-row items-center gap-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform duration-300"><Percent className="w-6 h-6" strokeWidth={2.5} /></div>
              <div className="flex flex-col"><span className="text-lg font-extrabold text-slate-900 leading-none mb-1">One Stop</span><span className="text-sm font-medium text-slate-500 leading-tight">for all Financial<br/>Solutions</span></div>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300"><Clock className="w-6 h-6" strokeWidth={2.5} /></div>
              <div className="flex flex-col"><span className="text-lg font-extrabold text-slate-900 leading-none mb-1">Quick & Easy</span><span className="text-sm font-medium text-slate-500 leading-tight">Hassle free<br/>approvals</span></div>
            </div>
          </div>
        </div>

        <div className="w-full aspect-[21/9] md:aspect-[3/1] lg:aspect-auto lg:w-[457px] lg:h-[220px] relative group">
          <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-slate-100 lg:border-4 lg:border-white">
            {heroSlides.map((slide, index) => (
              <a key={slide.id} href={slide.link} className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`} title={slide.title}>
                <img src={slide.image} alt={`Banner for ${slide.title}`} className="w-full h-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} />
              </a>
            ))}
            <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2 p-1.5 md:p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full shadow-lg">
              {heroSlides.map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)} className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out shadow-sm ${index === currentSlide ? 'w-6 md:w-8 bg-white' : 'w-1.5 md:w-2 bg-white/60 hover:bg-white/80'}`} aria-label={`Go to slide ${index + 1}`} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function HomePageClient() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  const schema = {
    ...generateWebPageSchema({ title: 'Loanzaar', description: 'Compare Loans & Credit Cards in India', url: 'https://loanzaar.in' }),
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } }))
    }
  }

  const toggleFaq = (index: number) => setActiveFaq(activeFaq === index ? null : index)

  return (
    <>
      <StructuredData schema={schema} />
      <h1 className="sr-only">Apply for Loans & Credit Cards Online - Loanzaar India</h1>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-1 md:pb-10 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8">
          <div className="mt-2"><HeroCarousel /></div>

          <section className="mt-8 md:mt-12">
            <SectionTitle title="Loans & Cards" />
            <div className="bg-white p-3 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-y-2 gap-x-1 md:gap-y-6 md:gap-x-6">
                {loansAndCards.map((item, idx) => (<CompactIcon key={idx} item={item} />))}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 md:mt-12">
            <section className="flex flex-col h-full">
              <SectionTitle title="Car Loans" action={{ label: 'View All', link: '/car-loans' }} />
              <div className="grid grid-cols-3 gap-3 md:gap-4 flex-1">
                {[{ label: 'New Car', icon: Car, color: 'text-amber-600', link: '/car-loan/new-car-loan' }, { label: 'Used Car', icon: CheckCircle, color: 'text-green-500', link: '/car-loan/used-car-loan' }, { label: 'Refinance', icon: RefreshCw, color: 'text-sky-600', link: '/car-loan/car-refinance' }].map((item, i) => (
                  <a key={i} href={item.link} className="group bg-white p-4 md:p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md hover:border-blue-100 active:scale-95 transition-all duration-200"><item.icon className={`w-7 h-7 md:w-9 md:h-9 ${item.color} transition-transform group-hover:scale-110`} /><span className="text-xs md:text-sm font-semibold text-slate-700 group-hover:text-slate-900">{item.label}</span></a>
                ))}
              </div>
            </section>

            <section className="flex flex-col h-full">
              <SectionTitle title="Insurance" action={{ label: 'View All', link: '/insurance/all-insurance' }} />
              <div className="grid grid-cols-4 gap-2 md:gap-4 flex-1">
                {insuranceItems.map((item, i) => (
                  <a key={i} href="#" className="group bg-white p-3 md:p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2 md:gap-3 shadow-sm hover:shadow-md hover:border-blue-100 active:scale-95 transition-all duration-200"><item.icon className={`w-6 h-6 md:w-8 md:h-8 ${item.iconColor} transition-transform group-hover:scale-110`} /><span className="text-[10px] md:text-sm font-semibold text-slate-700 text-center group-hover:text-slate-900 leading-tight">{item.title}</span></a>
                ))}
              </div>
            </section>
          </div>

          <article className="mt-12 md:mt-20 bg-white rounded-[2rem] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-10 text-white"><h2 className="text-xl md:text-3xl font-bold mb-3">Why Loanzaar is India's Trusted Financial Hub?</h2><p className="text-slate-300 text-sm md:text-base max-w-2xl">We simplify finance by connecting you with top lenders. Compare interest rates, check eligibility, and apply for loans entirely online with zero paperwork.</p></div>
            <div className="p-6 md:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-12">{[{ t: '100% Paperless', i: <CheckCircle2 className="w-5 h-5 text-green-600" />, d: 'Complete digital process' }, { t: 'Instant Approval', i: <Clock className="w-5 h-5 text-blue-600" />, d: 'Disbursal in minutes' }, { t: 'Best Rates', i: <Percent className="w-5 h-5 text-orange-600" />, d: 'Starting at 10.49%' }, { t: 'Secure', i: <Shield className="w-5 h-5 text-indigo-600" />, d: '256-bit Encryption' }].map((feat, idx) => (<div key={idx} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-blue-50/50 hover:border-blue-100 transition-colors"><div className="flex items-center gap-2 mb-1">{feat.i}<span className="font-bold text-xs md:text-sm text-slate-900">{feat.t}</span></div><p className="text-[10px] md:text-xs text-slate-500 leading-relaxed font-medium">{feat.d}</p></div>))}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12"><section><h3 className="text-sm md:text-base font-bold text-slate-900 mb-2 flex items-center gap-2"><Banknote className="w-4 h-4 text-blue-600" /> Personal Loans</h3><p className="text-xs md:text-sm text-slate-500 leading-relaxed text-justify">Looking for an instant personal loan? Loanzaar connects you with India's top banks and NBFCs. Get loans up to <strong>₹50 Lakhs</strong> with minimal documentation, flexible tenures, and competitive interest rates starting at <strong>10.49% p.a.</strong></p><a href="/loans/personal-loan" className="inline-flex items-center text-xs font-bold text-blue-600 mt-2 hover:underline">Apply Now <ArrowRight className="w-3 h-3 ml-1"/></a></section><section><h3 className="text-sm md:text-base font-bold text-slate-900 mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4 text-purple-600" /> Credit Cards</h3><p className="text-xs md:text-sm text-slate-500 leading-relaxed text-justify">Compare and apply for the best credit cards in India. Whether you want <strong>cashback</strong>, <strong>travel rewards</strong>, or <strong>lifetime free cards</strong>, find the perfect match for your spending habits and maximize your savings.</p><a href="/credit-cards" className="inline-flex items-center text-xs font-bold text-blue-600 mt-2 hover:underline">Compare Cards <ArrowRight className="w-3 h-3 ml-1"/></a></section><section><h3 className="text-sm md:text-base font-bold text-slate-900 mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-600" /> CIBIL Score</h3><p className="text-xs md:text-sm text-slate-500 leading-relaxed text-justify">Your CIBIL score is the key to financial approvals. Check your <strong>credit score for free</strong> on Loanzaar, get detailed insights into your credit health, and learn how to improve it to unlock better loan offers.</p><a href="/check-cibil-score" className="inline-flex items-center text-xs font-bold text-blue-600 mt-2 hover:underline">Check Free <ArrowRight className="w-3 h-3 ml-1"/></a></section></div>
              <section className="border-t border-slate-100 pt-8"><h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-500" /> Frequently Asked Questions</h3><div className="space-y-4">{faqs.map((faq, i) => (<div key={i} className={`border rounded-xl transition-all duration-200 overflow-hidden ${activeFaq === i ? 'bg-slate-50 border-blue-200' : 'bg-white border-slate-100'}`}><button onClick={() => toggleFaq(i)} className="w-full flex items-center justify-between p-4 text-left focus:outline-none"><span className={`text-xs md:text-sm font-bold pr-4 ${activeFaq === i ? 'text-slate-900' : 'text-slate-700'}`}>{faq.q}</span><ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-blue-600' : ''}`} /></button>{activeFaq === i && (<div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1"><p className="text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-2">{faq.a}</p></div>)}</div>))}</div></section>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}