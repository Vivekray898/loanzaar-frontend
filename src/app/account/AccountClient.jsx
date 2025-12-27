'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  User, Settings, BookOpen, Shield, ChevronRight, 
  Clock, LogOut, LogIn, Mail, LifeBuoy
} from 'lucide-react'
import { useUserAuth } from '@/context/UserAuthContext'
import SignInSheet from '@/components/SignInSheet'
import BottomNav from '@/components/BottomNav'

export default function AccountMenu() {
  const { user, isAuthenticated, logout } = useUserAuth()
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    if (isAuthenticated) setShowSignIn(false)
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-12 pt-6 md:pt-12">
      
      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

          {/* =========================================================
              LEFT SIDEBAR: Profile & Actions (Sticky)
             ========================================================= */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100 lg:sticky lg:top-8">
              
              {/* Profile Info */}
              <div className="flex flex-row lg:flex-col items-center gap-5 lg:gap-4 lg:text-center">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-16 w-16 lg:h-28 lg:w-28 bg-slate-50 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-3xl lg:text-5xl overflow-hidden ring-1 ring-slate-100">
                     {isAuthenticated && user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                        <span>{isAuthenticated ? '😎' : '👤'}</span>
                     )}
                  </div>
                  {isAuthenticated && (
                    <div className="absolute bottom-1 right-0 lg:bottom-2 lg:right-2 w-4 h-4 lg:w-6 lg:h-6 bg-green-500 border-2 lg:border-4 border-white rounded-full"></div>
                  )}
                </div>
                
                {/* Text Details */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight truncate">
                    {isAuthenticated ? (user?.displayName || user?.name || 'Hello User') : 'Guest User'}
                  </h1>
                  <p className="text-xs lg:text-sm font-medium text-slate-500 mt-0.5 lg:mt-2 truncate flex lg:justify-center items-center gap-1.5">
                    <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
                    {isAuthenticated ? (user?.email || 'member@loanzaar.in') : 'Sign in to access'}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 w-full my-6 hidden lg:block" />

              {/* Desktop Action Button */}
              <div className="mt-0 lg:mt-6 w-full hidden lg:block">
                 {isAuthenticated ? (
                   <button 
                     onClick={logout}
                     className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm border border-red-100 transition-all"
                   >
                     <LogOut className="w-4 h-4" /> Log Out
                   </button>
                 ) : (
                   <button 
                     onClick={() => setShowSignIn(true)}
                     className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all"
                   >
                     <LogIn className="w-4 h-4" /> Sign In
                   </button>
                 )}
              </div>

              {/* Mobile Only Sign In/Out (appears next to name) */}
              <div className="mt-6 lg:hidden">
                {isAuthenticated ? (
                   <button onClick={logout} className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm">Sign Out</button>
                ) : (
                   <button onClick={() => setShowSignIn(true)} className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-200">Sign In Now</button>
                )}
              </div>
            </div>

            {/* Desktop Version Info */}
            <div className="hidden lg:block mt-6 text-center">
               <p className="text-xs text-slate-400 font-medium">v2.4.0 • Loanzaar App</p>
            </div>
          </div>


          {/* =========================================================
              RIGHT CONTENT: Dashboard Grid
             ========================================================= */}
          <div className="lg:col-span-8 xl:col-span-9">
            
            {/* Menu Grid: Two Columns on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Column A: My Account */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">My Account</h2>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden">
                  <MenuLink 
                    href="/account/profile" 
                    icon={User} 
                    color="text-blue-600 bg-blue-50" 
                    title="Personal Details" 
                    subtitle="KYC & Contact Info"
                  />
                  <div className="h-px bg-slate-50 mx-4" />
                  <MenuLink 
                    href="/account/track" 
                    icon={Clock} 
                    color="text-indigo-600 bg-indigo-50" 
                    title="Track Application" 
                    subtitle="Live status updates"
                  />
                  <div className="h-px bg-slate-50 mx-4" />
                  <MenuLink 
                    href="/settings" 
                    icon={Settings} 
                    color="text-slate-600 bg-slate-100" 
                    title="Preferences" 
                    subtitle="App settings & Security"
                  />
                </div>
              </div>

              {/* Column B: Support & Legal */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Support</h2>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden">
                  <MenuLink 
                    href="/learn" 
                    icon={BookOpen} 
                    color="text-orange-600 bg-orange-50" 
                    title="Help Center" 
                    subtitle="Guides & FAQs"
                  />
                  <div className="h-px bg-slate-50 mx-4" />
                  <MenuLink 
                    href="/account/support" 
                    icon={LifeBuoy} 
                    color="text-purple-600 bg-purple-50" 
                    title="Contact Support" 
                    subtitle="Chat with us 24/7"
                  />
                  <div className="h-px bg-slate-50 mx-4" />
                  <MenuLink 
                    href="/privacy-policy" 
                    icon={Shield} 
                    color="text-emerald-600 bg-emerald-50" 
                    title="Legal & Privacy" 
                    subtitle="Terms of service"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile Footer Info */}
        <div className="md:hidden mt-8 text-center pb-4">
          <p className="text-[10px] text-slate-300 font-mono">v2.4.0 • Made with ❤️ in India</p>
        </div>

        <SignInSheet open={showSignIn} onClose={() => setShowSignIn(false)} />
      </div>
    </div>
  )
}

// Optimized Link Component
function MenuLink({ href, icon: Icon, color, title, subtitle }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 p-5 hover:bg-slate-50 active:bg-slate-100 transition-colors group"
    >
      {/* Icon */}
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3 ${color}`}>
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      
      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 text-[15px] group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>
      </div>

      {/* Chevron */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
        <ChevronRight className="w-5 h-5" />
              <BottomNav />
      </div>
    </Link>
  )
}