'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Shield,
  MessageSquare,
  Users,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { admin, firebaseUser, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout('manual');
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Loan Applications',
      path: '/admin/loans',
      icon: FileText
    },
    {
      name: 'Insurance Applications',
      path: '/admin/insurance',
      icon: Shield
    },
    {
      name: 'Contact Messages',
      path: '/admin/messages',
      icon: MessageSquare
    },
    {
      name: 'Users Management',
      path: '/admin/users',
      icon: Users
    },
    {
      name: 'Create Application',
      path: '/admin/create',
      icon: PlusCircle
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out shadow-2xl`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center font-bold text-lg">
                LZ
              </div>
              <div>
                <h1 className="font-bold text-lg">LoanZaar</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/50'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                } ${!isSidebarOpen && 'justify-center'}`}
                title={!isSidebarOpen ? item.name : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200 ${
              !isSidebarOpen && 'justify-center'
            }`}
            title={!isSidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center font-bold text-lg">
              LZ
            </div>
            <div>
              <h1 className="font-bold text-lg">LoanZaar</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-md z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </button>

              {/* Page Title */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {menuItems.find((item) => isActive(item.path))?.name || 'Admin Panel'}
                </h2>
                <p className="text-sm text-slate-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700">
                  {admin?.fullName || 'Admin'}
                </p>
                <p className="text-xs text-slate-500">
                  {firebaseUser?.email || admin?.email || 'admin@loanzaar.in'}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold">
                {(admin?.fullName || firebaseUser?.email || 'A')[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
