'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  User, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';

function UserDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUserAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'My Applications', path: '/dashboard/applications' },
    { icon: PlusCircle, label: 'Apply for Loan', path: '/dashboard/apply-loan' },
    { icon: PlusCircle, label: 'Apply for Insurance', path: '/dashboard/apply-insurance' },
    { icon: User, label: 'My Profile', path: '/dashboard/profile' },
    { icon: MessageSquare, label: 'Contact Support', path: '/dashboard/support' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <span className="text-xl font-bold text-slate-800">LoanZaar</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-6 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            {/* Logo */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="text-xl font-bold text-slate-800">LoanZaar</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="px-4 py-6 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="px-4 py-6 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>

            {/* Welcome Message */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-slate-800">
                Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Here's what's happening with your loans today
              </p>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-slate-100 transition">
                <Bell className="w-6 h-6 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                  <p className="text-xs text-slate-600">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default UserDashboardLayout;
