"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/config/supabase';
import { LayoutDashboard, Users, FileText, MessageSquare, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/');
      }
      setIsLoading(false);
    };

    checkUser();
  }, [router]);

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/applications', label: 'Apps', icon: FileText },
    { href: '/admin/contacts', label: 'Contacts', icon: MessageSquare },
    { href: '/admin/users', label: 'Users', icon: Users },
  ];

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;

  return (
    // pb-20 adds padding at bottom on mobile so content isn't hidden behind the sticky nav
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0">
      
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 border-r border-slate-800">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-wide">LoanZaar Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push('/signin'); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
          >
            <LogOut size={20} /> 
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION (Hidden on Desktop) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center px-2 py-3 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 w-full min-w-0">
        {/* Simple Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-center sticky top-0 z-40 px-4 shadow-sm">
          <h1 className="text-lg font-bold text-slate-800">Admin Dashboard</h1>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}