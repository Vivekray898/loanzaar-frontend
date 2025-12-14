'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Subscribing email:', newsletterEmail);
    setNewsletterEmail('');
    alert('Thank you for subscribing!');
  };

  return (
    <footer className="bg-slate-900 text-white font-sans">
      {/* Top Bar: Trust Indicators & App Download */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>RBI Approved Partners</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>100% Paperless</span>
              </div>
            </div>

            {/* App Download */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:block">Download App</span>
              <div className="flex gap-2">
                <a href="#" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" className="h-6" />
                </a>
                <a href="#" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg" alt="App Store" className="h-6" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Loanzaar</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                India's most trusted financial marketplace. We help you compare and choose the best financial products tailored to your needs.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-slate-400 text-sm">
                <MapPin className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <span>123, Financial District, Gachibowli, Hyderabad, Telangana - 500032</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Phone className="w-5 h-5 text-brand-500 shrink-0" />
                <span>1800-123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="w-5 h-5 text-brand-500 shrink-0" />
                <span>support@loanzaar.in</span>
              </div>
            </div>
          </div>

          {/* Column 2: Company Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', link: '/about-us' },
                { label: 'Careers', link: '/careers', badge: 'Hiring' },
                { label: 'Partner with Us', link: '/partner' },
                { label: 'Blog', link: '/blog' },
                { label: 'Contact Us', link: '/contact-us' },
                { label: 'Privacy Policy', link: '/privacy-policy' },
                { label: 'Terms of Use', link: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.link} className="text-slate-400 hover:text-brand-400 text-sm flex items-center gap-2 group transition-colors">
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-brand-500 transition-colors" />
                    {item.label}
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-brand-900 text-brand-300 px-1.5 py-0.5 rounded ml-1 border border-brand-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Products */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Products</h4>
            <ul className="space-y-3">
              {[
                { label: 'Personal Loan', link: '/personal-loan' },
                { label: 'Home Loan', link: '/home-loan' },
                { label: 'Business Loan', link: '/business-loan' },
                { label: 'Credit Cards', link: '/credit-cards' },
                { label: 'Loan Against Property', link: '/loan-against-property' },
                { label: 'Mutual Funds', link: '/mutual-funds' },
                { label: 'Fixed Deposits', link: '/fixed-deposits' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.link} className="text-slate-400 hover:text-brand-400 text-sm flex items-center gap-2 group transition-colors">
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-brand-500 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-4">Subscribe to our newsletter for the latest financial tips and offers.</p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-3 mb-8">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                required
              />
              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-lg shadow-brand-900/20"
              >
                Subscribe
              </button>
            </form>

            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all duration-300">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Loanzaar Financial Services Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-300 cursor-pointer">CIN: U65999TG2024PTC123456</span>
              <span className="hover:text-slate-300 cursor-pointer">ARN: 123456</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
