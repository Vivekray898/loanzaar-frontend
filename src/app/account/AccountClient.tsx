'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  User, BookOpen, Shield, Briefcase, ChevronRight,
  Clock, LogOut, LifeBuoy, CheckCircle2, LayoutDashboard
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/config/supabase'
import dynamic from 'next/dynamic'
import BottomNav from '@/components/BottomNav'
// Replace old sheet with the new Modal
import SignInModal from '@/components/SignInModal'

// Dynamically load the Admin view (client-only)
const AdminAccount = dynamic(() => import('./AdminAccountClient'), { ssr: false, loading: () => <div className="p-6">Loading admin view…</div> })

export default function AccountClient() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isAgent, setIsAgent] = useState<boolean | null>(null)
  const [cachedProfile, setCachedProfile] = useState<any>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  // Wait a moment for auth to initialize before showing the modal
  useEffect(() => {
    const timer = setTimeout(() => setIsAuthChecking(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!user?.id) return
    // Updated to use new user profile structure from AuthContext
    setIsAdmin(user.role === 'admin')
    setIsAgent(user.role === 'agent')
  }, [user])

  useEffect(() => {
    // Role is already in user object from AuthContext, no need to fetch separately
    if (!isAuthenticated || !user?.id) {
      setIsAdmin(false)
      setIsAgent(false)
      return
    }
    setIsAdmin(user.role === 'admin')
    setIsAgent(user.role === 'agent')
  }, [isAuthenticated, user])

  // If the user is an admin, render the dedicated admin account page dynamically
  if (isAdmin === true) {
    return <AdminAccount user={user} cachedProfile={cachedProfile} logout={logout} />
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-24 md:pb-12 pt-4 md:pt-8">
      
      {/* FORCED SIGN IN MODAL 
          - forceOpen={true} locks the modal (no close button, no backdrop click)
          - Only shows if NOT authenticated and NOT currently checking auth status
      */}
      {!isAuthChecking && !isAuthenticated && (
        <SignInModal 
          forceOpen={true} 
          onClose={() => {}} // No-op since it's forced
        />
      )}

      <div className={`max-w-5xl mx-auto px-4 sm:px-6 transition-opacity duration-500 ${!isAuthenticated ? 'opacity-30 pointer-events-none blur-sm' : 'opacity-100'}`}>

        {/* 1. Profile Hero Section */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden mb-8 md:mb-10">
           {/* Decorative bg */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

           <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-3xl overflow-hidden">
                    <span className="text-slate-400">👤</span>
                  </div>
                  {isAuthenticated && (
                    <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 border-2 border-white rounded-full" title="Online" />
                  )}
                </div>

                {/* Info */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {isAuthenticated ? (user?.fullName || 'Welcome back') : 'Guest User'}
                  </h1>
                  <p className="text-slate-500 font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
                    {isAuthenticated ? user?.phone : 'Please sign in to access your dashboard'}
                    {isAuthenticated && <CheckCircle2 size={16} className="text-blue-500" />}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                    {isAdmin && <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">Admin</span>}
                    {isAgent && <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold uppercase tracking-wider">Agent</span>}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex shrink-0">
                {isAuthenticated && (
                  <button onClick={logout} className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-sm transition-colors border border-slate-200">
                    Sign Out
                  </button>
                )}
                {/* Sign In Button REMOVED as requested - Modal launches automatically */}
              </div>
           </div>
        </div>

        {/* 2. Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Section: Account Management */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Account</h3>
            <div className="grid gap-3">
              <NavCard href="/account/profile" icon={User} title="Personal Profile" subtitle="Manage details & KYC" color="blue" />
              <NavCard href="/account/track" icon={Clock} title="Track Applications" subtitle="View status updates" color="indigo" />
            </div>
          </div>

          {/* Section: Support & Legal */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Support</h3>
            <div className="grid gap-3">
              <NavCard href="/faqs" icon={BookOpen} title="Help Center" subtitle="FAQs & Guides" color="orange" />
              <NavCard href="/account/support" icon={LifeBuoy} title="Customer Support" subtitle="Get help 24/7" color="rose" />
              <NavCard href="/privacy-policy" icon={Shield} title="Legal & Privacy" subtitle="Terms & Conditions" color="emerald" />
            </div>
          </div>

          {/* Section: Workspaces (Conditional) */}
          {(isAdmin || isAgent) && (
            <div className="space-y-4 md:col-span-2 lg:col-span-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Workspace</h3>
              <div className="grid gap-3">
                {isAgent && (
                  <NavCard href="/agent" icon={Briefcase} title="Agent Portal" subtitle="Manage assignments" color="pink" />
                )}
                {isAdmin && (
                  <NavCard href="/admin" icon={LayoutDashboard} title="Admin Dashboard" subtitle="System controls" color="purple" />
                )}
              </div>
            </div>
          )}

        </div>

        {/* 3. Footer / App Info */}
        <div className="mt-16 text-center border-t border-slate-200 pt-8 mb-8">
          <p className="text-xs font-semibold text-slate-400">Loanzaar App v2.4.0</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="text-[10px] text-slate-400 hover:text-slate-600">Terms of Service</Link>
            <Link href="/privacy" className="text-[10px] text-slate-400 hover:text-slate-600">Privacy Policy</Link>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}

function NavCard({ href, icon: Icon, title, subtitle, color }) {
  // Map colors to tailwind classes for hover effects
  const colors = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    slate: 'bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white',
    orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
    rose: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
  }

  const activeColor = colors[color] || colors.slate

  return (
    <Link href={href} className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 active:scale-[0.99]">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${activeColor}`}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all">
        <ChevronRight size={18} />
      </div>
    </Link>
  )
}