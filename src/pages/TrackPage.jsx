'use client'

import React from 'react'
import Link from 'next/link'
import { 
  FileText, 
  HelpCircle, 
  ChevronRight,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import ProtectedUserRoute from '../components/ProtectedUserRoute'

export default function TrackPage() {
  return (
    <ProtectedUserRoute>
      <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-10">
      
        {/* 1. App Header with Summary Stats */}
        <div className="bg-white pt-8 pb-6 px-6 rounded-b-[2rem] shadow-sm border-b border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Track</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Monitor your financial journey
              </p>
            </div>
            {/* Animated Activity Icon */}
            <div className="relative h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
               <Activity className="w-6 h-6" />
               <span className="absolute top-3 right-3 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
               <span className="absolute top-3 right-3 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 text-center flex flex-col items-center justify-center">
               <p className="text-xl font-bold text-emerald-700">2</p>
               <p className="text-[10px] uppercase font-bold text-emerald-600/80 tracking-wider mt-0.5">Active</p>
             </div>
             <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 text-center flex flex-col items-center justify-center">
               <p className="text-xl font-bold text-amber-700">1</p>
               <p className="text-[10px] uppercase font-bold text-amber-600/80 tracking-wider mt-0.5">Pending</p>
             </div>
             <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100 text-center flex flex-col items-center justify-center">
               <p className="text-xl font-bold text-blue-700">0</p>
               <p className="text-[10px] uppercase font-bold text-blue-600/80 tracking-wider mt-0.5">Action</p>
             </div>
          </div>
        </div>

        {/* 2. Main Tracking Grid */}
        <div className="px-6 -mt-4 space-y-4">
          
          {/* Applications Card */}
          <Link 
            href="/dashboard/applications" 
            className="group block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-all relative overflow-hidden"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base">My Applications</h3>
                <p className="text-xs text-slate-500 mt-0.5">Loans & Insurance status</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                 {/* Badge */}
                 <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] font-bold">2 Updates</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          </Link>

          {/* Support Enquiries Card */}
          <Link 
            href="/dashboard/enquiries" 
            className="group block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base">My Requests</h3>
                <p className="text-xs text-slate-500 mt-0.5">Support tickets & queries</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="text-[10px] font-bold">All Solved</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
              </div>
            </div>
          </Link>
        </div>

        {/* 3. Recent Activity Widget (Timeline Style) */}
        <div className="mt-8 px-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Recent Activity</h2>
             <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View All</button>
          </div>
          
          <div className="space-y-3">
             {/* Activity Item 1 */}
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex gap-4 relative overflow-hidden">
                {/* Status Indicator Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                
                <div className="mt-1">
                  <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-start w-full">
                     <p className="text-sm font-bold text-slate-800">Home Loan Application</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                     Your application <span className="font-medium text-slate-700">#HL-2049</span> is currently under 
                     <span className="font-medium text-amber-600"> Verification</span>.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Today, 10:30 AM</p>
                </div>
             </div>

             {/* Activity Item 2 (Example) */}
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex gap-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                
                <div className="mt-1">
                  <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-800">Document Uploaded</p>
                   <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      You successfully uploaded <span className="font-medium text-slate-700">Income Proof</span>.
                   </p>
                   <p className="text-[10px] text-slate-400 mt-2 font-medium">Yesterday, 4:15 PM</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </ProtectedUserRoute>
  )
}