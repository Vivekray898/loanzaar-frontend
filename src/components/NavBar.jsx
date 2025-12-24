'use client'

import React, { useState, useEffect, useRef, useContext } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { UserAuthContext } from '../context/UserAuthContext';
import { ChevronDown, Phone, LogOut, LayoutDashboard, User, Search } from 'lucide-react';

export default function NavBar() {
  const [hoverOpen, setHoverOpen] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dropdownRefs = useRef({});
  const userMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const authContext = useContext(UserAuthContext);
  const user = authContext?.user ?? null;
  const isAuthenticated = !!user;
  const logout = authContext?.logout ?? (() => router.push('/signin'));

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const navItems = [
    {
      label: 'Explore Products',
      type: 'dropdown',
      children: [
        { label: 'Personal Loan', link: '/loans/personal-loan' },
        { label: 'Business Loan', link: '/loans/business-loan' },
        { label: 'Home Loan', link: '/loans/home-loan' },
        { label: 'Car Loan', link: '/loans/car-loan' },
        { label: 'Machinery Loan', link: '/loans/machinery-loan' },
        { label: 'Credit Cards', link: '/loans/credit-cards' },
        { label: 'Loan Against Property', link: '/loans/loan-against-property' },
        { label: 'Mutual Funds', link: '/loans/mutual-funds' },
      ]
    },
    {
      label: 'Insurance',
      type: 'dropdown',
      children: [
        { label: 'Life Insurance', link: '/insurance/life-insurance' },
        { label: 'Health Insurance', link: '/insurance/health-insurance' },
        { label: 'General Insurance', link: '/insurance/general-insurance' },
        { label: 'All Insurance', link: '/insurance/all-insurance' },
      ]
    },
    {
      label: 'Learn & Resources',
      type: 'dropdown',
      children: [
        { label: 'Blogs', link: '/blogs' },
        { label: 'Credit Score Guide', link: '/credit-score-guide' },
        { label: 'EMI Calculator', link: '/calculators' },
        { label: 'Financial Glossary', link: '/glossary' },
      ]
    },
    { label: 'Contact Us', link: '/contact-us', type: 'link' },
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (hoverOpen && dropdownRefs.current[hoverOpen] && !dropdownRefs.current[hoverOpen].contains(event.target)) {
        setHoverOpen(null);
      }
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [hoverOpen, showUserMenu]);

  useEffect(() => {
    setHoverOpen(null)
    setShowUserMenu(false)
  }, [pathname]);

  const getDashboardLink = () => (user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-lg border-b border-slate-200/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* 1. Logo Section */}
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 focus:outline-none active:scale-95 transition-transform">
              <img
                src="/images/loanzaar--logo.avif"
                alt="Loanzaar"
                className="h-7 md:h-9 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/160x40/f8fafc/0ea5e9?text=Loanzaar&font=sans';
                }}
              />
            </Link>

            {/* 2. Desktop Navigation (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.label} className="relative" ref={(el) => (dropdownRefs.current[item.label] = el)}>
                  {item.type === 'link' ? (
                    <Link href={item.link} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors py-2">
                      {item.label}
                    </Link>
                  ) : (
                    <div
                      onMouseEnter={() => setHoverOpen(item.label)}
                      onMouseLeave={() => setHoverOpen(null)}
                      className="relative py-2"
                    >
                      <button
                        className={`text-sm font-semibold transition-colors inline-flex items-center gap-1 ${hoverOpen === item.label ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                        aria-expanded={hoverOpen === item.label}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${hoverOpen === item.label ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Glassmorphic Dropdown */}
                      {hoverOpen === item.label && (
                        <div className="absolute left-0 top-full mt-1 w-60 rounded-xl bg-white/95 backdrop-blur-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.link}
                              className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* 3. Right Side Actions */}
          <div className="flex items-center gap-3">

            {/* Mobile: Call Button (High Value Action) */}
            <a 
              href="tel:1800-123-4567"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 active:scale-90 transition-transform"
              aria-label="Call Expert"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* Desktop: Talk to Expert Button */}
            <a
              href="tel:1800-123-4567"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Talk to Expert</span>
            </a>

            {/* Desktop: User Menu (Mobile uses Bottom Nav 'Account' tab) */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus:outline-none active:scale-95"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200 shadow-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 bg-slate-50 rounded-xl mb-2">
                        <p className="text-sm font-bold text-slate-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                      </div>
                      <Link href={getDashboardLink()} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/signin"
                  className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
            
            {/* Mobile: If Logged Out, show simple 'Sign In' link (Optional, or rely on BottomNav) */}
            {/* Keeping it clean: We only show the Phone icon on mobile right. 
                Login is handled by the bottom 'Account' tab. */}

          </div>
        </div>
      </div>
    </header>
  );
}