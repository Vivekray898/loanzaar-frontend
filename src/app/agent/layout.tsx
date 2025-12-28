'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/config/supabase'
import { LayoutDashboard, FileText, LogOut, UserCircle } from 'lucide-react'
import Link from 'next/link'

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Auth Guard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/signin')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      if (profile?.role !== 'agent') {
        router.push('/')
      }
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const navLinks = [
    { href: '/agent', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agent/applications', label: 'Applications', icon: FileText },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center gap-2">
        <div className="h-8 w-8 bg-blue-500 rounded-full"></div>
        <p className="text-slate-400 text-sm font-medium">Loading Agent Portal...</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* --- DESKTOP SIDEBAR (Visible ONLY on Large Screens) --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 border-r border-slate-800">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-900">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">A</div>
           <h1 className="text-lg font-bold text-white tracking-wide">Agent Portal</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
          {navLinks.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <link.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-800 p-4 bg-slate-900">
          <div className="bg-slate-800 rounded-xl p-3 mb-3 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                <UserCircle size={20} />
             </div>
             <div className="overflow-hidden">
                <p className="text-xs text-slate-400 truncate">Logged in as Agent</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-all text-sm font-medium"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Simple Top Bar for Mobile Branding */}
        <div className="lg:hidden h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-center px-4">
           <span className="font-bold text-slate-800 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">A</div>
              Agent Portal
           </span>
        </div>

        {/* Content Area with extra bottom padding for mobile nav */}
        <div className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* --- BOTTOM NAVIGATION (Visible on Mobile/Tablet) --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center px-2 py-3 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
        <button 
          onClick={async () => { await supabase.auth.signOut(); router.push('/signin'); }}
          className="flex flex-col items-center gap-1 p-2 text-red-400 rounded-lg"
        >
          <LogOut size={24} />
          <span className="text-[10px] font-medium">Exit</span>
        </button>
      </nav>

    </div>
  )
}