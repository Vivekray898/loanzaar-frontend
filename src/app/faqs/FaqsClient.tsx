'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Search, ChevronDown, ChevronRight, HelpCircle, 
  Banknote, ShieldCheck, CreditCard, User, FileText, 
  MessageCircle, Phone
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'

// --- Types & Data ---

type CategoryId = 'all' | 'loans' | 'insurance' | 'credit' | 'account'

interface FaqItem {
  id: string
  question: string
  answer: React.ReactNode
  category: CategoryId
}

const CATEGORIES: { id: CategoryId; label: string; icon: any }[] = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'loans', label: 'Loans', icon: Banknote },
  { id: 'insurance', label: 'Insurance', icon: ShieldCheck },
  { id: 'credit', label: 'Credit & Cards', icon: CreditCard },
  { id: 'account', label: 'Account & Safety', icon: User },
]

const FAQ_DATA: FaqItem[] = [
  // Loans
  {
    id: 'l1',
    category: 'loans',
    question: 'What is the minimum CIBIL score required for a Personal Loan?',
    answer: 'Most lending partners prefer a CIBIL score of 750 or above. However, some NBFCs on our platform offer loans to applicants with scores between 650-750 at slightly higher interest rates.'
  },
  {
    id: 'l2',
    category: 'loans',
    question: 'How long does it take for loan disbursal?',
    answer: 'For pre-approved personal loans, funds can be disbursed in as little as 2 hours. Standard personal loans typically take 24-48 hours, while Home and Business loans may take 3-7 working days for property verification.'
  },
  {
    id: 'l3',
    category: 'loans',
    question: 'Can I foreclose my loan early? Are there charges?',
    answer: 'Yes, most lenders allow foreclosure after a lock-in period (usually 6-12 months). Foreclosure charges vary from 0% to 4% of the outstanding principal, depending on the lender policy.'
  },
  
  // Insurance
  {
    id: 'i1',
    category: 'insurance',
    question: 'Is a medical test mandatory for Health Insurance?',
    answer: 'Not always. Many insurers offer policies without a medical check-up for individuals under 45 years of age, provided they have no pre-existing conditions. For higher coverages (>₹1 Cr), a tele-medical or physical test might be required.'
  },
  {
    id: 'i2',
    category: 'insurance',
    question: 'Does my car insurance policy cover engine damage?',
    answer: 'Standard comprehensive policies do not cover engine failure due to waterlogging (hydrostatic lock). You need to purchase an "Engine Protect" add-on cover for this specific protection.'
  },

  // Credit
  {
    id: 'c1',
    category: 'credit',
    question: 'How can I check my Credit Score for free?',
    answer: (
      <span>
        You can check your latest credit score instantly on Loanzaar by visiting the <Link href="/check-cibil-score" className="text-blue-600 font-semibold hover:underline">Credit Score</Link> page. It is 100% free and does not impact your score.
      </span>
    )
  },
  {
    id: 'c2',
    category: 'credit',
    question: 'Can I get a credit card without income proof?',
    answer: 'Yes, you can apply for a secured credit card against a Fixed Deposit (FD). Some banks also offer cards based on your relationship value (savings balance) without requiring salary slips.'
  },

  // Account
  {
    id: 'a1',
    category: 'account',
    question: 'Is my data safe with Loanzaar?',
    answer: 'Absolutely. We use bank-grade 256-bit SSL encryption to protect your data. We only share your details with the specific lender you choose to apply with, and never sell data to third-party spammers.'
  },
  {
    id: 'a2',
    category: 'account',
    question: 'How do I track my application status?',
    answer: (
      <span>
        Log in to your account and visit the <Link href="/account/track" className="text-blue-600 font-semibold hover:underline">Track Application</Link> section. You will see real-time updates from "Submitted" to "Approved" or "Disbursed".
      </span>
    )
  }
]

export default function FaqsClient() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  // Toggle Accordion
  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Filter Logic
  const filteredFaqs = FAQ_DATA.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-12 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- Header Section --- */}
      <header className="bg-white border-b border-slate-200 pt-10 pb-8 px-4 md:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            How can we <span className="text-blue-600">help you?</span>
          </h1>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">
            Search our knowledge base for answers regarding loans, insurance, and your account settings.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search for 'interest rates', 'eligibility'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm text-base"
            />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8 md:mt-12">
        
        {/* --- Category Tabs --- */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border
                  ${isActive 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <Icon size={16} strokeWidth={2.5} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* --- FAQ List --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div 
                  key={faq.id} 
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${openItems[faq.id] ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full flex items-start justify-between p-5 md:p-6 text-left focus:outline-none"
                  >
                    <span className={`text-base md:text-lg font-bold pr-4 ${openItems[faq.id] ? 'text-blue-700' : 'text-slate-800'}`}>
                      {faq.question}
                    </span>
                    <div className={`mt-1 p-1 rounded-full transition-colors ${openItems[faq.id] ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <ChevronDown size={20} className={`transition-transform duration-300 ${openItems[faq.id] ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  <div 
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${openItems[faq.id] ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 pt-0">
                        <div className="h-px w-full bg-slate-100 mb-4" />
                        <div className="text-slate-600 leading-relaxed text-sm md:text-base">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-300">
                <div className="inline-flex bg-slate-50 p-4 rounded-full mb-3">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No results found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your search or category filter.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="mt-4 text-blue-600 text-sm font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar / Contact */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                  <MessageCircle className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Can't find the answer you're looking for? Our support team is here to help you.
                </p>
                <Link 
                  href="/contact-us"
                  className="block w-full py-3.5 bg-white text-slate-900 text-center rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Contact Support
                </Link>
                <div className="mt-4 flex justify-center gap-6 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><Phone size={12} /> +91 1800-123-4567</span>
                  <span className="flex items-center gap-1.5"><FileText size={12} /> support@loanzaar.in</span>
                </div>
              </div>
              
              {/* Decor */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hidden lg:block">
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy-policy" className="flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 group">
                    Privacy Policy <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 group">
                    Terms of Service <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/check-cibil-score" className="flex items-center justify-between text-sm text-slate-600 hover:text-blue-600 group">
                    Check CIBIL <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      <div>
        <BottomNav />
      </div>
    </div>
  )
}