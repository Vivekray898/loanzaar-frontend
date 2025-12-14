'use client'

import React, { useState, useEffect, useRef, useContext } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { UserAuthContext } from '../context/UserAuthContext';
import { ChevronDown, Menu, X, Phone, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Simplified Navigation Structure
  const navItems = [
    {
      label: 'Explore Products',
      type: 'dropdown',
      children: [
        { label: 'Personal Loan', link: '/personal-loan' },
        { label: 'Business Loan', link: '/business-loan' },
        { label: 'Home Loan', link: '/home-loan' },
        { label: 'Credit Cards', link: '/credit-cards' },
        { label: 'Loan Against Property', link: '/loan-against-property' },
        { label: 'Mutual Funds', link: '/mutual-funds' },
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
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [pathname]);

  const getDashboardLink = () => (user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 focus:outline-none">
              <img
                src="/images/loanzaar--logo.avif"
                alt="Loanzaar"
                className="h-8 md:h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/160x40/f8fafc/0ea5e9?text=Loanzaar&font=sans';
                }}
              />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden min-[1153px]:flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.label} className="relative" ref={(el) => (dropdownRefs.current[item.label] = el)}>
                  {item.type === 'link' ? (
                    <Link href={item.link} className="text-[15px] font-semibold text-slate-700 hover:text-blue-600 transition-colors py-2">
                      {item.label}
                    </Link>
                  ) : (
                    <div
                      onMouseEnter={() => setHoverOpen(item.label)}
                      onMouseLeave={() => setHoverOpen(null)}
                      className="relative py-2"
                    >
                      <button
                        className={`text-[15px] font-semibold transition-colors inline-flex items-center gap-1 ${hoverOpen === item.label ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`}
                        aria-expanded={hoverOpen === item.label}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${hoverOpen === item.label ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {hoverOpen === item.label && (
                        <div className="absolute left-0 top-full mt-1 w-56 rounded-xl bg-white shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
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

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">

            {/* Talk to Expert Button (Desktop) */}
            <a
              href="tel:1800-123-4567"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Talk to Expert
            </a>

            {/* Auth / User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 bg-slate-50 rounded-lg mb-2">
                      <p className="text-sm font-bold text-slate-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                    </div>
                    <Link href={getDashboardLink()} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="hidden md:inline-flex items-center justify-center px-6 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="min-[1153px]:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out transform ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!mobileOpen}>
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <aside className="absolute right-0 top-0 h-full w-full max-w-xs bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <span className="font-bold text-xl text-slate-900">Menu</span>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto py-4 px-4 space-y-6">
            {/* Mobile Nav Links */}
            <nav className="space-y-4">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.type === 'link' ? (
                    <Link href={item.link} className="block text-base font-semibold text-slate-800 py-2">
                      {item.label}
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
                        {item.label}
                      </div>
                      <div className="pl-2 space-y-2">
                        {item.children.map(child => (
                          <Link key={child.label} href={child.link} className="block text-sm font-medium text-slate-600 py-1.5">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Mobile Bottom Actions */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
            <a
              href="tel:1800-123-4567"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-blue-600 text-blue-600 font-bold text-sm bg-white"
            >
              <Phone className="w-4 h-4" />
              Talk to Expert
            </a>

            {!isAuthenticated ? (
              <Link
                href="/signin"
                className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-sm"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-red-50 text-red-600 font-bold text-sm border border-red-100"
              >
                Sign Out
              </button>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}
