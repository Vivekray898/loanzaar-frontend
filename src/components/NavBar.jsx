'use client'

import React, { useState, useEffect, useRef, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserAuthContext } from '../context/UserAuthContext';
import { 
  ChevronDown, Phone, LogOut, LayoutDashboard, User, 
  Menu, X, ChevronRight, ShieldCheck, CreditCard 
} from 'lucide-react';
import Container from './Container';

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(null); 
  const [mobileExpanded, setMobileExpanded] = useState(null); 
  const [showUserMenu, setShowUserMenu] = useState(false); 

  const dropdownRefs = useRef({});
  const userMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  
  const authContext = useContext(UserAuthContext);
  const user = authContext?.user ?? null;
  const isAuthenticated = !!user;
  const logout = authContext?.logout ?? (() => router.push('/signin'));

  const navItems = [
    {
      label: 'Loans',
      type: 'dropdown',
      icon: CreditCard,
      children: [
        { label: 'Personal Loan', link: '/loans/personal-loan' },
        { label: 'Business Loan', link: '/loans/business-loan' },
        { label: 'Home Loan', link: '/loans/home-loan' },
        { label: 'Car Loan', link: '/loans/car-loan' },
        { label: 'Credit Cards', link: '/loans/credit-cards' },
      ]
    },
    {
      label: 'Insurance',
      type: 'dropdown',
      icon: ShieldCheck,
      children: [
        { label: 'Life Insurance', link: '/insurance/life-insurance' },
        { label: 'Health Insurance', link: '/insurance/health-insurance' },
        { label: 'General Insurance', link: '/insurance/general-insurance' },
      ]
    },
    {
      label: 'Resources',
      type: 'dropdown',
      children: [
        { label: 'Blogs', link: '/blogs' },
        { label: 'Credit Score', link: '/credit-score-guide' },
        { label: 'Calculators', link: '/calculators' },
      ]
    },
    { label: 'Contact', link: '/contact-us', type: 'link' },
  ];

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setHoverOpen(null);
    setShowUserMenu(false);
    setMobileExpanded(null);
    document.body.style.overflow = 'unset'; // Ensure scroll is unlocked
  }, [pathname]);

  // Handle Outside Clicks
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

  // Lock Body Scroll logic with cleanup
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup on unmount
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileAccordion = (label) => {
    setMobileExpanded(mobileExpanded === label ? null : label);
  };

  const getDashboardLink = () => (user?.role === 'admin' ? '/admin/dashboard' : '/account');

  return (
    <>
      {/* 
        HEADER: Z-Index 100 ensures it stays above the mobile menu 
        BG-White ensures content doesn't bleed through
      */}
      <header className="sticky top-0 z-[100] w-full bg-white border-b border-slate-200 shadow-sm">
        <Container>
          <div className="flex items-center justify-between h-16 lg:h-20 bg-white relative z-[101]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 z-[101]">
              <img
                src="/images/loanzaar--logo.avif"
                alt="Loanzaar"
                className="h-8 md:h-9 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/160x40/f8fafc/0ea5e9?text=Loanzaar&font=sans';
                }}
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-8">
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
                      <button className={`text-sm font-semibold transition-colors inline-flex items-center gap-1 ${hoverOpen === item.label ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>
                        <span>{item.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${hoverOpen === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      {hoverOpen === item.label && (
                        <div className="absolute left-0 top-full mt-0 w-64 rounded-xl bg-white shadow-xl border border-slate-100 p-2 z-50">
                          {item.children.map((child) => (
                            <Link key={child.label} href={child.link} className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors">
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

            {/* Right Actions */}
            <div className="flex items-center gap-3 z-[101]">
              <a href="tel:1800-123-4567" className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-700 font-semibold text-xs hover:border-blue-600 hover:text-blue-600 transition-all">
                <Phone className="w-3.5 h-3.5" />
                <span>Support</span>
              </a>

              {/* User Menu (Desktop) */}
              <div className="hidden lg:block">
                {isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 hover:border-blue-300 transition-all">
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[80px]">{user?.name || 'User'}</span>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-60 rounded-2xl bg-white shadow-xl border border-slate-100 p-2 z-50">
                        <Link href={getDashboardLink()} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"><LogOut className="w-4 h-4" /> Sign Out</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/signin" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all">Sign In</Link>
                )}
              </div>

              {/* Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none z-[102]"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* 
          MOBILE MENU OVERLAY
          - z-[99] puts it just below the header (z-[100])
          - fixed inset-0 covers the WHOLE screen
          - pt-20 pushes content down below the header area
      */}
      <div 
        className={`
          lg:hidden fixed inset-0 bg-white z-[99] overflow-y-auto transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'}
        `}
      >
        <div className="pt-20 px-6 pb-24 space-y-6">
          
          {/* Auth Card */}
          {isAuthenticated ? (
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{user?.email}</p>
                </div>
              </div>
              <Link href={getDashboardLink()} className="p-2 bg-white rounded-full shadow-sm text-blue-600">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="bg-blue-50 rounded-2xl p-6 text-center">
              <h3 className="font-bold text-blue-900 mb-2">Welcome to Loanzaar</h3>
              <p className="text-xs text-blue-700 mb-4">Sign in to track applications & get offers.</p>
              <Link href="/signin" className="block w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md">Sign In / Register</Link>
            </div>
          )}

          {/* Links */}
          <div className="space-y-2">
            {navItems.map((item) => (
              <div key={item.label} className="border-b border-slate-100 last:border-0">
                {item.type === 'link' ? (
                  <Link href={item.link} className="flex items-center justify-between py-4 text-slate-800 font-semibold">{item.label}</Link>
                ) : (
                  <div>
                    <button onClick={() => toggleMobileAccordion(item.label)} className="w-full flex items-center justify-between py-4 text-slate-800 font-semibold focus:outline-none">
                      <span className="flex items-center gap-3">{item.label}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${mobileExpanded === item.label ? 'rotate-180 text-blue-600' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileExpanded === item.label ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="pl-4 pb-4 space-y-2">
                        {item.children.map((child) => (
                          <Link key={child.label} href={child.link} className="block py-2.5 px-4 rounded-lg text-sm text-slate-500 hover:text-blue-600 hover:bg-slate-50">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {isAuthenticated && (
             <button onClick={handleLogout} className="w-full py-3 flex items-center justify-center gap-2 text-red-600 font-semibold bg-red-50 rounded-xl mt-4">
                <LogOut className="w-4 h-4" /> Sign Out
             </button>
          )}
        </div>
      </div>
    </>
  );
}