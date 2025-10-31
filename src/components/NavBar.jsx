'use client'

import React, { useState, useEffect, useRef, useContext } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { UserAuthContext } from '../context/UserAuthContext';

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedSubDropdown, setExpandedSubDropdown] = useState(null);
  const [mobileNavHistory, setMobileNavHistory] = useState([]);

  const dropdownRefs = useRef({});
  const userMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Get authentication state from context (with fallback for public routes)
  const authContext = useContext(UserAuthContext);
  const user = authContext?.user ?? null;
  const isAuthenticated = !!user; // User is authenticated if user object exists
  const logout = authContext?.logout ?? (() => router.push('/signin'));
  
  // Debug authentication state
  React.useEffect(() => {
    console.log('🔐 NavBar Auth State:', {
      isAuthenticated,
      userName: user?.name,
      userEmail: user?.email,
      userRole: user?.role,
      hasContext: !!authContext,
      contextUser: authContext?.user
    });
  }, [isAuthenticated, user, authContext]);

  const handleLogout = () => {
    logout(); // Use context logout which handles cleanup and redirect
    setShowUserMenu(false);
  };

  const navItems = [
    { label: 'About Us', link: '/about-us', type: 'link' },
    {
      label: 'Loans',
      link: '/loans',
      type: 'dropdown',
      children: [
        { label: 'Personal Loan', link: '/personal-loan' },
        { label: 'Home Loan', link: '/home-loan' },
        { label: 'Business Loan', link: '/business-loan' },
        {
          label: 'Car Loan',
          link: '/car-loan',
          type: 'sub-dropdown', // This will now open on hover on desktop
          children: [
            { label: 'New Car Loan', link: '/car-loan/new-car-loan' },
            { label: 'Used Car Loan', link: '/car-loan/used-car-loan' },
            { label: 'Car Refinance', link: '/car-loan/car-refinance' },
          ],
        },
        { label: 'Loan Against Property', link: '/loan-against-property' },
        { label: 'Machinery Loan', link: '/machinery-loan' },
        { label: 'Education Loan', link: '/education-loan' },
        { label: 'Gold Loan', link: '/gold-loan' },
        { label: 'Solar Loan', link: '/solar-loan' },
      ],
    },
    /* DSA nav temporarily disabled - uncomment when needed
    {
      label: 'DSA',
      link: '/dsa',
      type: 'dropdown',
      children: [
        { label: 'Partner Signup', link: '/dsa/signup' },
        { label: 'Partner Dashboard', link: '/dsa/dashboard' },
      ],
    },
    */
    { label: 'Credit Cards', link: '/credit-cards', type: 'link' },
    {
      label: 'Insurance',
      link: '/insurance',
      type: 'dropdown',
      children: [
        { label: 'All Insurance', link: '/insurance/all-insurance' },
        { label: 'Life Insurance', link: '/insurance/life-insurance' },
        { label: 'Health Insurance', link: '/insurance/health-insurance' },
        { label: 'General Insurance', link: '/insurance/general-insurance' },
      ],
    },
   /* { label: 'Become a Partner', link: '/become-partner', type: 'link' }, */
    {
      label: 'Check Cibil Score',
      link: '/check-cibil-score',
      type: 'link',
      badge: { text: 'NEW' },
    },
    { label: 'Blogs', link: '/blogs', type: 'link' },
    { label: 'Contact Us', link: '/contact-us', type: 'link' },
  ];

  // Effect to handle clicks outside of active elements
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

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileOpen) {
      closeMobileMenu();
    }
  }, [pathname]);

  const getDashboardLink = () => (user?.role === 'admin' ? '/admin/dashboard' : '/user-dashboard');

  // --- Mobile Navigation Logic ---
  const closeMobileMenu = () => {
    setMobileOpen(false);
    // Delay resetting history to allow for slide-out animation
    setTimeout(() => setMobileNavHistory([]), 300);
  };

  const currentMobileMenu = mobileNavHistory.length > 0 ? mobileNavHistory[mobileNavHistory.length - 1] : { children: navItems };
  const currentMobileTitle = mobileNavHistory.length > 0 ? mobileNavHistory[mobileNavHistory.length - 1].label : 'Loanzaar';

  const handleMobileNavForward = (item) => setMobileNavHistory([...mobileNavHistory, item]);
  const handleMobileNavBack = () => setMobileNavHistory(mobileNavHistory.slice(0, -1));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 focus:outline-none">
              <img
                src="/images/loanzaar--logo.avif"
                alt="Loanzaar - much more than money"
                className="h-[30px] min-[1153px]:h-[45px] w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/160x40/f8fafc/dc2626?text=Loanzaar&font=sans';
                }}
              />
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden min-[1153px]:flex items-center space-x-6">
            {navItems.map((item) => (
              <div key={item.label} className="relative" ref={(el) => (dropdownRefs.current[item.label] = el)}>
                {item.type === 'link' ? (
                  <Link href={item.link} className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge && <span className="ml-1 inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{item.badge.text}</span>}
                  </Link>
                ) : (
                  <>
                    <button
                      className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors inline-flex items-center gap-2"
                      aria-expanded={hoverOpen === item.label}
                      onClick={() => setHoverOpen(hoverOpen === item.label ? null : item.label)}
                    >
                      <span>{item.label}</span>
                      <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {/* Dropdown */}
                    {hoverOpen === item.label && (
                      <div className="absolute left-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-slate-100 p-2 z-10">
                        {item.children.map((c) => (
                          <div
                            key={c.label}
                            className="relative"
                            onMouseEnter={() => c.type === 'sub-dropdown' && setExpandedSubDropdown(c.label)}
                            onMouseLeave={() => c.type === 'sub-dropdown' && setExpandedSubDropdown(null)}
                          >
                            {c.type === 'sub-dropdown' ? (
                              <>
                                <Link
                                  href={c.link}
                                  onClick={() => setHoverOpen(null)}
                                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors"
                                >
                                  <span>{c.label}</span>
                                  <svg className="h-4 w-4 text-slate-500 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </Link>
                                {expandedSubDropdown === c.label && (
                                  <div className="absolute left-full top-0 w-48 rounded-lg bg-white shadow-lg border border-slate-100 p-2 z-20 -mt-1">
                                    {c.children.map((subItem) => (
                                      <Link
                                        key={subItem.label}
                                        href={subItem.link}
                                        onClick={() => {
                                          setHoverOpen(null);
                                          setExpandedSubDropdown(null);
                                        }}
                                        className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                                      >
                                        {subItem.label}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                            <Link href={c.link} onClick={() => setHoverOpen(null)} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors">
                                {c.label}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Right side: Auth + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden min-[1153px]:flex items-center gap-2 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-semibold">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                  <svg className={`w-4 h-4 text-slate-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-slate-100 p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-500">{user?.email || ''}</p>
                      {user?.role === 'admin' && <span className="inline-block mt-1 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">Admin</span>}
                    </div>
                    <Link href={getDashboardLink()} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      <span>{user?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signin" className="hidden min-[1153px]:inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700">Sign in</Link>
            )}

            <button onClick={() => setMobileOpen(true)} className="min-[1153px]:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      <div className={`fixed inset-0 z-50 transition-transform transform ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!mobileOpen}>
        <div className="absolute inset-0 bg-black/40" onClick={closeMobileMenu} />
        <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            {mobileNavHistory.length > 0 ? (
              <button onClick={handleMobileNavBack} className="flex items-center gap-2 p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-lg">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-lg font-bold text-slate-800">{currentMobileTitle}</span>
              </button>
            ) : (
              <Link href="/" className="flex items-center gap-3">
                <img src="/images/loanzaar--logo.avif" alt="Loanzaar" className="h-[30px] min-[1153px]:h-[45px] w-auto object-contain" />
              </Link>
            )}
            <button onClick={closeMobileMenu} className="p-2 rounded-md text-slate-600 hover:bg-slate-100">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav className="flex-grow">
            <ul className="space-y-2">
              {currentMobileMenu.children.map((item) => (
                <li key={item.label}>
                  {item.type === 'link' || !item.children ? (
                    <Link
                      href={item.link}
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between w-full rounded-lg px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span>{item.label}</span>
                       {item.badge && <span className="ml-2 inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{item.badge.text}</span>}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleMobileNavForward(item)}
                      className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span>{item.label}</span>
                      <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 border-t border-slate-100 pt-4">
            {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white font-semibold text-lg">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-500">{user?.email || ''}</p>
                      {user?.role === 'admin' && <span className="inline-block mt-1 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">Admin</span>}
                    </div>
                  </div>
                  <Link href={getDashboardLink()} onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="font-medium">{user?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <Link href="/signin" className="block w-full text-center rounded-lg px-4 py-3 font-semibold text-red-600 hover:bg-red-50 transition-colors" onClick={closeMobileMenu}>Sign in</Link>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}
