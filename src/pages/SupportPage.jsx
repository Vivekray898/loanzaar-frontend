'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  HelpCircle, 
  Clock, 
  ChevronRight,
  LifeBuoy
} from 'lucide-react'

export default function SupportPage() {
  const supportEmail = 'support@loanzaar.in'
  const phoneNumber = '+911234567890'
  const whatsappNumber = '911234567890'

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      <div className="pb-10">
        {/* 1. App Header with Greeting */}
        <div className="bg-white px-6 pt-12 pb-8 rounded-b-3xl shadow-sm border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Support</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                Hello! How can we help you today?
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <LifeBuoy className="w-6 h-6" />
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-6 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full w-fit">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wide uppercase">Agents Online</span>
          </div>
        </div>

        {/* 2. Primary Action Grid */}
        <div className="px-6 -mt-4">
          <div className="space-y-4">
            
            {/* Call Expert Card */}
            <a 
              href={`tel:${phoneNumber}`}
              className="group block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Call an Expert</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Available 9 AM - 7 PM</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                   <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </a>

            {/* WhatsApp Card */}
            <a 
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">WhatsApp Chat</h3>
                  <p className="text-xs text-green-600 font-medium mt-0.5">⚡ Typically replies in 2 mins</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                   <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </a>

            {/* Email Card */}
            <a 
              href={`mailto:${supportEmail}`}
              className="group block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Email Us</h3>
                  <p className="text-xs text-slate-500 mt-0.5">For detailed queries & docs</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                   <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </a>

          </div>
        </div>

        {/* 3. Self Help Section */}
        <div className="px-6 mt-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Self Help</h2>
          
          <Link 
            href="/faqs"
            className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
               <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                 <HelpCircle className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="font-semibold text-slate-900 text-sm">FAQs</h3>
                 <p className="text-xs text-slate-500">Find answers instantly</p>
               </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* 4. Footer Info */}
        <div className="mt-8 text-center px-8">
           <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              <Clock className="w-3 h-3" />
              <span>Support Time: Mon-Sat, 9:00 AM - 7:00 PM</span>
           </div>
           <p className="text-[10px] text-slate-300 mt-4">
             Loanzaar Customer Care
           </p>
        </div>
      </div>
    </div>
  )
}