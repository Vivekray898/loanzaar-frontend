'use client'

import React from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart2, 
  Settings, 
  LogOut, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react'

interface AdminAccountClientProps {
  user: any;
  cachedProfile: any;
  logout: () => void;
}

export default function AdminAccountClient({ user, cachedProfile, logout }: AdminAccountClientProps) {
  const displayName = cachedProfile?.full_name || user?.displayName || user?.email?.split('@')[0] || 'Admin';
  const role = cachedProfile?.role || 'Administrator';

  // Mock data for the dashboard visuals - replace these with real props later
  const stats = [
    { label: 'Total Users', value: '1,248', trend: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Apps', value: '42', trend: '-5%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Revenue', value: '₹4.2L', trend: '+8%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-32 md:pb-12 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-2xl shadow-lg shadow-slate-200">
                👑
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome back, {displayName}</h1>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
                  {role}
                </span>
                <span className="text-slate-400">•</span>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div>
             <button 
                onClick={logout} 
                className="group flex items-center gap-2 px-5 py-2.5 bg-white text-rose-600 rounded-xl border border-rose-100 hover:border-rose-200 hover:bg-rose-50 hover:shadow-sm transition-all text-sm font-semibold"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Sign Out
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                <span className={`text-xs font-semibold ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                  {stat.trend} <span className="text-slate-400 font-normal">from last month</span>
                </span>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Quick Access</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionCard 
                href="/admin" 
                icon={<LayoutDashboard />} 
                title="Overview" 
                description="System health & main metrics" 
                color="text-indigo-600"
                bg="bg-indigo-50"
              />
              <ActionCard 
                href="/admin/users" 
                icon={<Users />} 
                title="User Management" 
                description="View profiles & permissions" 
                color="text-blue-600"
                bg="bg-blue-50"
              />
              <ActionCard 
                href="/admin/applications" 
                icon={<FileText />} 
                title="Applications" 
                description="Review pending submissions" 
                color="text-violet-600"
                bg="bg-violet-50"
                badge="12 New"
              />
              <ActionCard 
                href="/admin/stats" 
                icon={<BarChart2 />} 
                title="Analytics" 
                description="Export reports & data" 
                color="text-pink-600"
                bg="bg-pink-50"
              />
              <ActionCard 
                href="/admin/settings" 
                icon={<Settings />} 
                title="Configuration" 
                description="System settings & API keys" 
                color="text-slate-600"
                bg="bg-slate-100"
              />
            </div>
          </div>

          {/* Right Column: Recent Activity / Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h2>
              <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1 min-w-[8px] h-2 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                    <div>
                      <p className="text-sm text-slate-800 font-medium">New Application Received</p>
                      <p className="text-xs text-slate-500">John Doe submitted a home loan request.</p>
                      <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-4 items-start">
                  <div className="mt-1 min-w-[8px] h-2 rounded-full bg-amber-500 ring-4 ring-amber-50"></div>
                  <div>
                    <p className="text-sm text-slate-800 font-medium">System Alert</p>
                    <p className="text-xs text-slate-500">Database backup completed successfully.</p>
                    <p className="text-[10px] text-slate-400 mt-1">5 hours ago</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                 <Link href="/admin/logs" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
                    View All Logs <ChevronRight className="w-4 h-4" />
                 </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <BottomNav />
    </div>
  )
}

function ActionCard({ href, icon, title, description, color, bg, badge }: any) {
  return (
    <Link href={href} className="group relative block p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
      {badge && (
        <span className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center transition-transform group-hover:scale-110 duration-200`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  )
}