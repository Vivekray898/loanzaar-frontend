'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { 
  FileText, HelpCircle, ChevronRight, Activity, Clock, 
  CheckCircle2, AlertCircle, ArrowLeft, MoreHorizontal, Filter
} from 'lucide-react'
import ProtectedUserRoute from '@/components/ProtectedUserRoute'

export default function TrackPage() {
  const router = useRouter()

  return (
    <ProtectedUserRoute>
      <div className="min-h-screen bg-slate-50/50 font-sans pb-24 md:pb-12 pt-4 md:pt-10">
      
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full">
             <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-800">Track Activity</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          {/* Desktop Breadcrumb */}
          <div className="hidden md:flex items-center gap-3 mb-8 text-sm text-slate-500">
            <button onClick={() => router.push('/account')} className="hover:text-blue-600 transition-colors">Account</button>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">Track Application</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* =========================================================
                LEFT COLUMN: Dashboard & Metrics (lg:col-span-8)
               ========================================================= */}
            <div className="lg:col-span-8 space-y-6">

              {/* 1. Hero Status Card */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">System Live</span>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Activity Monitor</h1>
                      <p className="text-slate-500 mt-1">Real-time updates on your applications and requests.</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                       <Link 
                         href="/account/applications"
                         className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                       >
                         <FileText className="w-4 h-4" /> View Apps
                       </Link>
                       <Link 
                         href="/account/enquiries"
                         className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                       >
                         <HelpCircle className="w-4 h-4" /> Support
                       </Link>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <MetricCard label="Active" value="2" color="emerald" icon={Activity} />
                    <MetricCard label="Pending" value="1" color="amber" icon={Clock} />
                    <MetricCard label="Action" value="0" color="rose" icon={AlertCircle} />
                  </div>
                </div>
              </div>

              {/* 2. Recent Timeline (Mobile: Vertical Stack, Desktop: Clean List) */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-lg">Recent History</h3>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-0">
                  {/* Timeline Item 1 */}
                  <TimelineItem 
                    title="Home Loan Application"
                    id="#HL-2049"
                    status="Verification"
                    time="10:30 AM"
                    icon={Clock}
                    color="amber"
                    isLast={false}
                  />
                  {/* Timeline Item 2 */}
                  <TimelineItem 
                    title="Document Uploaded"
                    id="Income Proof"
                    status="Received"
                    time="Yesterday"
                    icon={FileText}
                    color="blue"
                    isLast={false}
                  />
                  {/* Timeline Item 3 */}
                  <TimelineItem 
                    title="Profile Updated"
                    id="Address Change"
                    status="Completed"
                    time="2 days ago"
                    icon={CheckCircle2}
                    color="slate"
                    isLast={true}
                  />
                </div>
                
                <div className="p-4 border-t border-slate-50 text-center">
                  <button className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                    Load More History <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>

            {/* =========================================================
                RIGHT COLUMN: Quick Links / Ads (lg:col-span-4)
               ========================================================= */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quick Actions Card */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link href="/loans/personal-loan" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-slate-900">New Loan</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </Link>
                  <Link href="/account/support" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-slate-900">Help Center</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </Link>
                </div>
              </div>

              {/* Agent Tip / Promo */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Did you know?</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    Completing your profile verification increases your loan approval chances by 40%.
                  </p>
                  <Link href="/account/profile" className="text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-lg inline-block hover:bg-slate-100 transition-colors">
                    Verify Profile
                  </Link>
                </div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
              </div>

            </div>

          </div>
        </div>
        <BottomNav />
      </div>
    </ProtectedUserRoute>
  )
}

// --- SUB-COMPONENTS ---

function MetricCard({ label, value, color, icon: Icon }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  }
  
  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]`}>
      <div className="mb-2 opacity-80">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-2xl md:text-3xl font-bold block leading-none mb-1">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
    </div>
  )
}

function TimelineItem({ title, id, status, time, icon: Icon, color, isLast }) {
  const colorMap = {
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="relative pl-6 md:pl-8 pr-6 py-6 group hover:bg-slate-50 transition-colors">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[34px] md:left-[42px] top-12 bottom-0 w-0.5 bg-slate-100 group-hover:bg-slate-200 transition-colors"></div>
      )}
      
      <div className="flex gap-4 md:gap-5">
        {/* Icon Node */}
        <div className={`relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full ${colorMap[color]} flex items-center justify-center shrink-0 shadow-sm border-2 border-white`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
            <h4 className="font-bold text-slate-900 text-sm md:text-base">{title}</h4>
            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{time}</span>
          </div>
          
          <p className="text-sm text-slate-600 mb-2">
            <span className="font-medium text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs mr-1.5">{id}</span>
            Status is <span className={`font-semibold ${color === 'amber' ? 'text-amber-600' : 'text-slate-700'}`}>{status}</span>.
          </p>
        </div>
        
        {/* Desktop Arrow */}
        <div className="hidden sm:flex items-center text-slate-300">
           <MoreHorizontal className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}