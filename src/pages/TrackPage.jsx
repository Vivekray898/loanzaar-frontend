'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  HelpCircle, 
  ChevronRight,
  ChevronLeft,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import ProtectedUserRoute from '../components/ProtectedUserRoute'

export default function TrackPage() {
  const router = useRouter()

  return (
    <ProtectedUserRoute>
      <div className="min-h-screen bg-slate-50 font-sans pb-14 md:pb-12 pt-0 md:pt-8">
      
        {/* Desktop Container */}
        <div className="max-w-6xl mx-auto md:px-6">
          
          {/* Desktop Header Navigation */}
          <div className="hidden md:flex items-center gap-2 mb-6">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold text-sm">Track Application</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* =========================================================
                LEFT COLUMN: Overview & Navigation (lg:col-span-7)
               ========================================================= */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. Dashboard Header Card */}
              <div className="bg-white pt-8 pb-6 px-6 md:p-8 rounded-b-[2rem] md:rounded-3xl shadow-sm border-b md:border border-slate-100">
                {/* Mobile Back Button */}
                <button 
                  onClick={() => router.back()} 
                  className="md:hidden flex items-center gap-1 text-slate-500 mb-4 -ml-2 px-2 py-1"
                >
                  <ChevronLeft className="w-5 h-5" /> <span className="text-sm font-semibold">Back</span>
                </button>

                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Track Activity</h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
                      Monitor your financial journey & application status
                    </p>
                  </div>
                  {/* Activity Pulse Icon */}
                  <div className="relative h-12 w-12 md:h-14 md:w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                     <Activity className="w-6 h-6 md:w-7 md:h-7" />
                     <span className="absolute top-3 right-3 w-2 h-2 md:w-2.5 md:h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
                     <span className="absolute top-3 right-3 w-2 h-2 md:w-2.5 md:h-2.5 bg-indigo-500 rounded-full"></span>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                   <div className="bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-2xl p-3 md:p-5 border border-emerald-100 text-center flex flex-col items-center justify-center group cursor-default">
                     <p className="text-xl md:text-3xl font-bold text-emerald-700 group-hover:scale-110 transition-transform">2</p>
                     <p className="text-[10px] md:text-xs uppercase font-bold text-emerald-600/80 tracking-wider mt-1 md:mt-2">Active</p>
                   </div>
                   <div className="bg-amber-50 hover:bg-amber-100 transition-colors rounded-2xl p-3 md:p-5 border border-amber-100 text-center flex flex-col items-center justify-center group cursor-default">
                     <p className="text-xl md:text-3xl font-bold text-amber-700 group-hover:scale-110 transition-transform">1</p>
                     <p className="text-[10px] md:text-xs uppercase font-bold text-amber-600/80 tracking-wider mt-1 md:mt-2">Pending</p>
                   </div>
                   <div className="bg-blue-50 hover:bg-blue-100 transition-colors rounded-2xl p-3 md:p-5 border border-blue-100 text-center flex flex-col items-center justify-center group cursor-default">
                     <p className="text-xl md:text-3xl font-bold text-blue-700 group-hover:scale-110 transition-transform">0</p>
                     <p className="text-[10px] md:text-xs uppercase font-bold text-blue-600/80 tracking-wider mt-1 md:mt-2">Action</p>
                   </div>
                </div>
              </div>

              {/* 2. Navigation Cards */}
              <div className="px-6 md:px-0 -mt-2 md:mt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Applications Card */}
                <Link 
                  href="/account/applications" 
                  className="group bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 active:scale-[0.98] transition-all relative overflow-hidden flex flex-col justify-between h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    {/* Badge */}
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold tracking-wide">2 Updates</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-900 text-base md:text-lg group-hover:text-blue-700 transition-colors">My Applications</h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Track Loans & Insurance status</p>
                    
                    <div className="mt-4 flex items-center text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                       View Details <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>

                {/* Support Enquiries Card */}
                <Link 
                  href="/account/enquiries" 
                  className="group bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-orange-200 active:scale-[0.98] transition-all relative overflow-hidden flex flex-col justify-between h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[10px] font-bold tracking-wide">All Solved</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base md:text-lg group-hover:text-orange-700 transition-colors">My Requests</h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Support tickets & queries</p>
                    
                    <div className="mt-4 flex items-center text-xs font-bold text-orange-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                       View History <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </div>

            </div>

            {/* =========================================================
                RIGHT COLUMN: Activity Feed (lg:col-span-5)
               ========================================================= */}
            <div className="lg:col-span-5 px-6 md:px-0 mt-4 lg:mt-0">
              <div className="lg:sticky lg:top-8 bg-white lg:bg-transparent rounded-3xl lg:rounded-none p-6 lg:p-0 shadow-sm lg:shadow-none border border-slate-100 lg:border-none">
                
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Recent Activity</h2>
                   <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">View All History</button>
                </div>
                
                <div className="space-y-4 relative">
                   {/* Vertical Connector Line (Desktop Only visual aid) */}
                   <div className="hidden lg:block absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10"></div>

                   {/* Activity Item 1 */}
                   <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow flex gap-4 relative overflow-hidden group">
                      {/* Status Indicator Line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 group-hover:w-1.5 transition-all"></div>
                      
                      <div className="mt-0.5">
                        <div className="h-9 w-9 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 relative">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start w-full">
                           <p className="text-sm md:text-base font-bold text-slate-800">Home Loan Application</p>
                           <span className="text-[10px] md:text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md">10:30 AM</span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 mt-1.5 leading-relaxed">
                           Your application <span className="font-medium text-slate-700 bg-slate-100 px-1 rounded">#HL-2049</span> is currently under 
                           <span className="font-medium text-amber-600"> Verification</span>.
                        </p>
                      </div>
                   </div>

                   {/* Activity Item 2 */}
                   <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow flex gap-4 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 group-hover:w-1.5 transition-all"></div>
                      
                      <div className="mt-0.5">
                        <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 relative">
                          <FileText className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start w-full">
                           <p className="text-sm md:text-base font-bold text-slate-800">Document Uploaded</p>
                           <span className="text-[10px] md:text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md">Yesterday</span>
                         </div>
                         <p className="text-xs md:text-sm text-slate-500 mt-1.5 leading-relaxed">
                            You successfully uploaded <span className="font-medium text-slate-700">Income Proof</span> for Personal Loan.
                         </p>
                      </div>
                   </div>

                   {/* Activity Item 3 */}
                   <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow flex gap-4 relative overflow-hidden group opacity-75 hover:opacity-100">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 group-hover:w-1.5 transition-all"></div>
                      
                      <div className="mt-0.5">
                        <div className="h-9 w-9 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 relative">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start w-full">
                           <p className="text-sm md:text-base font-bold text-slate-700">Profile Updated</p>
                           <span className="text-[10px] md:text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md">2 days ago</span>
                         </div>
                         <p className="text-xs md:text-sm text-slate-500 mt-1.5 leading-relaxed">
                            Changed contact address in profile settings.
                         </p>
                      </div>
                   </div>

                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </ProtectedUserRoute>
  )
}