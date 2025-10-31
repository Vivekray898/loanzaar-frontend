'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  FileText,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  DollarSign,
  CreditCard,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useUserAuth();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      label: 'Overview',
      icon: TrendingUp,
      link: '/user-dashboard',
      exact: true
    },
    {
      label: 'My Applications',
      icon: FileText,
      submenu: [
        { label: 'Loans', link: '/dashboard/my-loans' },
        { label: 'Insurance', link: '/dashboard/my-insurance' },
      ]
    },
    {
      label: 'Apply New',
      icon: DollarSign,
      submenu: [
        { label: 'Apply for Loan', link: '/dashboard/apply-loan' },
        { label: 'Apply for Insurance', link: '/dashboard/apply-insurance' },
      ]
    },
    {
      label: 'My Cards',
      icon: CreditCard,
      link: '/dashboard/my-cards'
    },
    {
      label: 'Support & Help',
      icon: MessageSquare,
      link: '/user-dashboard?tab=support'
    },
    {
      label: 'Security',
      icon: Shield,
      link: '/dashboard/security'
    },
    {
      label: 'Settings',
      icon: Settings,
      link: '/dashboard/settings'
    },
    {
      label: 'Help & FAQ',
      icon: HelpCircle,
      link: '/dashboard/help'
    }
  ];

  const isActive = (link, exact = false) => {
    if (exact) {
      return pathname === link || pathname === '/dashboard';
    }
    return pathname.startsWith(link);
  };

  const toggleSubmenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  return (
    <>
  {/* Mobile Header */}
  <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
        <h2 className="text-lg font-bold">LoanZaar</h2>
        <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle sidebar">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 md:hidden ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white border-r shadow-lg transform transition-transform duration-300 z-50
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex md:flex-col md:w-64 md:shadow-none`}
        aria-label="Sidebar navigation"
      >
        {/* Logo area */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">LoanZaar</h2>
          <p className="text-sm text-gray-500">Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(index)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${
                      expandedMenu === index
                        ? 'bg-sky-50 text-sky-600'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${expandedMenu === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedMenu === index && (
                    <div className="ml-6 mt-1 space-y-1 border-l border-slate-200">
                      {item.submenu.map((subitem, subindex) => (
                        <Link
                          key={subindex}
                          href={subitem.link}
                          className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                            isActive(subitem.link)
                              ? 'bg-sky-50 text-sky-600 font-medium'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current mr-3" />
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.link}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive(item.link, item.exact)
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
