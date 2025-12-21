'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  User, 
  Settings, 
  BookOpen, 
  Shield, 
  LogOut, 
  LogIn, 
  ChevronRight,
  Sparkles,
  Clock
} from 'lucide-react'
import { useUserAuth } from '../context/UserAuthContext'
import SignInSheet from '../components/SignInSheet'

export default function AccountMenu() {
  const { isAuthenticated, logout } = useUserAuth()
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    if (isAuthenticated) setShowSignIn(false)
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      
      {/* 1. Profile Header */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-3xl shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
          {/* Avatar Placeholder */}
          <div className="h-16 w-16 bg-slate-100 rounded-full border-2 border-white shadow-md flex items-center justify-center text-2xl relative overflow-hidden">
             <span className="z-10">👤</span>
             {/* Decorative shine */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Account</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <p className="text-sm text-slate-500 font-medium">{isAuthenticated ? 'Logged In' : 'Guest User'}</p>
            </div>
          </div>
          </div>

          <div className="ml-4">
            {isAuthenticated ? (
              <button
                onClick={() => logout()}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm border border-red-100"
              >
                Log Out
              </button>
            ) : (
              <button
                onClick={() => setShowSignIn(true)}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm border border-blue-100"
              >
                Log In
              </button>
            )}
          </div>
        </div>

        {/* Pro/Upgrade Banner (Optional Visual Polish) */}
        <div className="mt-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white flex items-center justify-between shadow-lg shadow-slate-200">
          <div className="flex gap-3 items-center">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <p className="text-sm font-bold">Loanzaar Pro</p>
              <p className="text-[10px] text-slate-300">Unlock premium reports</p>
            </div>
          </div>
          <button className="text-xs font-bold bg-white text-slate-900 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
            View
          </button>
        </div>
      </div>

      {/* 2. Menu Sections */}
      <div className="px-6 mt-6 space-y-6">
        
        {/* Section: General */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">General</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
            <MenuLink 
              href="/profile" 
              icon={User} 
              color="text-blue-600 bg-blue-50" 
              title="Profile Information" 
              subtitle="Personal details & KYC"
            />
            
            <div className="h-px bg-slate-50 mx-4"></div> {/* Divider */}
            
            <MenuLink 
              href="/settings" 
              icon={Settings} 
              color="text-slate-600 bg-slate-100" 
              title="Settings" 
              subtitle="Notifications, Password, Theme"
            />
            
            <div className="h-px bg-slate-50 mx-4"></div>

            <MenuLink 
              href="/track" 
              icon={Clock} 
              color="text-indigo-600 bg-indigo-50" 
              title="Track Application" 
              subtitle="Check loan application status"
            />
          </div>
        </div>

        {/* Section: Resources */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Resources</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
            <MenuLink 
              href="/learn" 
              icon={BookOpen} 
              color="text-orange-600 bg-orange-50" 
              title="Learn & Guides" 
              subtitle="Financial literacy hub"
            />

            <div className="h-px bg-slate-50 mx-4"></div>

            <MenuLink 
              href="/legal" 
              icon={Shield} 
              color="text-emerald-600 bg-emerald-50" 
              title="Legal & Privacy" 
              subtitle="Terms, Policies & Disclosures"
            />
          </div>
        </div>

          {/* Note: Login/Logout moved to header */}


        <SignInSheet open={showSignIn} onClose={() => setShowSignIn(false)} />
      </div>

      {/* Footer Info */}
      <div className="mt-10 text-center">
        <p className="text-[10px] text-slate-300 font-mono">v2.4.0 (Build 2024)</p>
      </div>

    </div>
  )
}

// Reusable Menu Item Component to keep JSX clean
function MenuLink({ href, icon: Icon, color, title, subtitle }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors group"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
    </Link>
  )
}