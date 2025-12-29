'use client'

import React, { useEffect, useState } from 'react';
import { FileText, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserAuth } from '@/context/UserAuthContext';
import { getIdToken } from '@/services/supabaseAuthService';

export default function AdminDashboardClient() {
  const router = useRouter();
  const { user, role, loading, isAuthenticated } = useUserAuth();
  const [stats, setStats] = useState({ applications: 0, contacts: 0, users: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Guard: redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/signin');
      } else if (role !== 'admin') {
        router.replace('/');
      }
    }
  }, [loading, isAuthenticated, role, router]);

  // Fetch stats only when we're confirmed admin
  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const token = await getIdToken();
        const res = await fetch('/api/admin/stats', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          if (json?.success) setStats(json.data);
        }
      } catch (e) {
        console.error('Failed to load admin stats', e);
      } finally {
        if (mounted) setStatsLoading(false);
      }
    }

    if (!loading && isAuthenticated && role === 'admin') {
      fetchStats();
    }

    return () => { mounted = false }
  }, [loading, isAuthenticated, role]);

  if (loading || statsLoading) return <div className="h-48 flex items-center justify-center">Loading...</div>;

  const cards = [
    { label: 'Total Applications', value: stats.applications, icon: FileText, color: 'bg-blue-500', shadow: 'shadow-blue-200' },
    { label: 'Registered Users', value: stats.users, icon: Users, color: 'bg-purple-500', shadow: 'shadow-purple-200' },
    { label: 'Contact Messages', value: stats.contacts, icon: MessageSquare, color: 'bg-orange-500', shadow: 'shadow-orange-200' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Overview</h2>
          <p className="text-slate-500 text-sm md:text-base mt-1">Key metrics and system health.</p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded-md self-start md:self-auto">
          Last updated: Just now
        </span>
      </div>

      {/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cards.map((card) => (
          <div 
            key={card.label} 
            className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className={`p-3 md:p-4 rounded-xl ${card.color} text-white shadow-lg ${card.shadow}`}>
              <card.icon size={24} className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs md:text-sm font-semibold uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-10 rounded-3xl relative overflow-hidden shadow-2xl shadow-slate-900/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            SYSTEM NORMAL
          </div>
          <h3 className="text-xl md:text-3xl font-bold mb-3">Welcome back, Administrator</h3>
          <p className="text-slate-400 text-sm md:text-lg leading-relaxed">
            You have <span className="text-white font-semibold">{stats.applications} active applications</span> pending review. 
            Check the Applications tab for details.
          </p>
        </div>
        
        {/* Decorative Icon - Positioned to not block text on mobile */}
        <TrendingUp className="absolute -right-6 -bottom-8 text-slate-800 w-48 h-48 md:w-80 md:h-80 opacity-20 pointer-events-none rotate-12" />
      </div>
    </div>
  );
}