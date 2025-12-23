'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  User, Settings, BookOpen, Shield, ChevronRight, 
  Sparkles, Clock, LogOut, LogIn
} from 'lucide-react'
import { useUserAuth } from '../context/UserAuthContext'
import SignInSheet from '../components/SignInSheet'

export default function AccountMenu() {
  const { user, isAuthenticated, logout } = useUserAuth()
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    if (isAuthenticated) setShowSignIn(false)
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-4 md:pb-10">
      
      {/* 1. Profile Header - Clean & Focused */}
      <div className="bg-white pt-8 pb-6 px-6 rounded-b-[2rem] shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar with Status Ring */}
            <div className="relative">
              <div className="h-14 w-14 bg-slate-100 rounded-full border-2 border-white shadow-md flex items-center justify-center text-2xl overflow-hidden">
                 {isAuthenticated && user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                    <span>{isAuthenticated ? '😎' : '👤'}</span>
                 )}
              </div>
              {isAuthenticated && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {isAuthenticated ? (user?.displayName || user?.name || 'Hello User') : 'Welcome!'}
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {isAuthenticated ? (user?.email || 'Member') : 'Sign in to access account'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button (Login/Logout) moved below for better thumb reach */}
        <div className="mt-6">
           {isAuthenticated ? (
             <button 
               onClick={logout}
               className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100 active:scale-[0.98] transition-transform"
             >
               <LogOut className="w-4 h-4" /> Log Out
             </button>
           ) : (
             <button 
               onClick={() => setShowSignIn(true)}
               className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 active:scale-[0.98] transition-transform"
             >
               <LogIn className="w-4 h-4" /> Sign In / Register
             </button>
           )}
        </div>
      </div>

      {/* 2. Menu Sections */}
      <div className="px-5 mt-6 space-y-6">
        
        {/* Pro Banner (If logged in) */}
        {isAuthenticated && (
          <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
                  <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Loanzaar Pro</h4>
                  <p className="text-[10px] text-slate-400">Unlock premium reports</p>
                </div>
              </div>
              <button className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                Upgrade
              </button>
            </div>
          </div>
        )}

        {/* Section: My Account */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">My Account</h2>
          <div className="bg-white rounded-2xl border border-slate-100/50 shadow-sm overflow-hidden divide-y divide-slate-50">
            <MenuLink 
              href="/profile" 
              icon={User} 
              color="text-blue-600 bg-blue-50" 
              title="Profile" 
              subtitle="Personal details & KYC"
            />
            <MenuLink 
              href="/track" 
              icon={Clock} 
              color="text-indigo-600 bg-indigo-50" 
              title="Track Application" 
              subtitle="Live status updates"
            />
            <MenuLink 
              href="/settings" 
              icon={Settings} 
              color="text-slate-600 bg-slate-100" 
              title="Settings" 
              subtitle="Preferences & Security"
            />
          </div>
        </div>

        {/* Section: Support */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Support</h2>
          <div className="bg-white rounded-2xl border border-slate-100/50 shadow-sm overflow-hidden divide-y divide-slate-50">
            <MenuLink 
              href="/learn" 
              icon={BookOpen} 
              color="text-orange-600 bg-orange-50" 
              title="Help Center" 
              subtitle="Guides & FAQs"
            />
            <MenuLink 
              href="/legal" 
              icon={Shield} 
              color="text-emerald-600 bg-emerald-50" 
              title="Legal & Privacy" 
              subtitle="Terms of service"
            />
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="mt-12 mb-6 text-center">
        <p className="text-[10px] text-slate-300 font-mono">v2.4.0 • Made with ❤️ in India</p>
      </div>

      <SignInSheet open={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  )
}

// Optimized Reusable Component
function MenuLink({ href, icon: Icon, color, title, subtitle }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors group relative"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 text-[15px] truncate">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
      </div>

      {/* Chevron */}
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
    </Link>
  )
}