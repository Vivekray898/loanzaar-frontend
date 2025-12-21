"use client"

import React from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Users, 
  HelpCircle, 
  ChevronRight,
  Activity,
  Clock 
} from 'lucide-react'
import ProtectedUserRoute from '../components/ProtectedUserRoute'

export default function TrackPage() {
  return (
    <ProtectedUserRoute>
      <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* 1. App Header with Summary Stats */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-3xl shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Track</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Monitor your financial journey
            </p>
          </div>
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
             <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="flex gap-4">
           <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-bold text-slate-900">3</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active</p>
           </div>
           <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-bold text-slate-900">1</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending</p>
           </div>
           <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-bold text-slate-900">0</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Action</p>
           </div>
        </div>
      </div>

      {/* 2. Main Tracking Grid */}
      <div className="px-6 -mt-4 space-y-4">
        
        {/* Applications Card */}
        <Link 
          href="/dashboard/applications" 
          className="group block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-base">My Applications</h3>
              <p className="text-xs text-slate-500 mt-1">Loans & Insurance status</p>
            </div>
            <div className="flex flex-col items-end gap-1">
               <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                 2 Active
               </span>
               <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </Link>

        {/* Leads Card */}
        <Link 
          href="/dashboard/leads" 
          className="group block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-base">Leads</h3>
              <p className="text-xs text-slate-500 mt-1">Manage client prospects</p>
            </div>
             <div className="flex flex-col items-end gap-1">
               <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                 0 New
               </span>
               <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </Link>

        {/* Enquiries Card */}
        <Link 
          href="/dashboard/enquiries" 
          className="group block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-base">Enquiries</h3>
              <p className="text-xs text-slate-500 mt-1">Support tickets & questions</p>
            </div>
            <div className="flex flex-col items-end gap-1">
               <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                 All Solved
               </span>
               <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Recent Activity Widget (App Pattern) */}
      <div className="mt-8 px-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Update</h2>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-3">
           <div className="mt-1">
             <Clock className="w-4 h-4 text-slate-400" />
           </div>
           <div>
             <p className="text-sm font-semibold text-slate-800">Home Loan Application</p>
             <p className="text-xs text-slate-500 mt-1">Your application #HL-2049 has moved to 'Verification' stage.</p>
             <p className="text-[10px] text-slate-400 mt-2">Today, 10:30 AM</p>
           </div>
        </div>
      </div>

      </div>
    </ProtectedUserRoute>
  )
}