'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Facebook, Twitter, Linkedin, Instagram, 
  Mail, Phone, MapPin, ChevronDown, Send, ShieldCheck
} from 'lucide-react';
import Container from './Container'

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  
  // State for mobile accordion sections
  const [openSections, setOpenSections] = useState({
    products: false,
    company: false,
    contact: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setNewsletterEmail('');
    // In a real app, you would handle the submission logic here
    alert('Thank you for subscribing!');
  };

  // Reusable Accordion Section Component
  const FooterAccordion = ({ title, id, children }) => {
    const isOpen = openSections[id];
    
    return (
      <div className="border-b border-slate-800 md:border-none last:border-none">
        <button 
          onClick={() => toggleSection(id)}
          className="w-full py-4 flex items-center justify-between text-left md:py-0 md:mb-6 md:cursor-default group"
        >
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">
            {title}
          </h4>
          <ChevronDown 
            className={`w-5 h-5 text-slate-500 transition-transform duration-300 md:hidden ${isOpen ? 'rotate-180 text-blue-500' : ''}`} 
          />
        </button>
        
        <div className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:pb-0'}
        `}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <footer className="bg-slate-950 text-slate-300 font-sans text-sm pb-14 md:pb-0">
      
      {/* 1. Top Bar: Trust Indicators Only */}
      <div className="bg-slate-900 border-b border-slate-800">
        <Container className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-800">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                RBI Approved
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-800">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                256-bit Secure
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-800">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                100% Digital
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Trusted by 1M+ Users
            </div>

          </div>
        </Container>
      </div>

      {/* 2. Main Footer Content */}
      <div>
        <Container className="py-8 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-10">

          {/* Brand & Newsletter */}
          <div className="mb-8 md:mb-0 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Loanzaar</h3>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                India's most trusted financial marketplace. Compare & apply for loans, cards, and insurance in minutes.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12"
                required
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors"
                aria-label="Subscribe"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Accordion Columns */}
          <FooterAccordion title="Products" id="products">
            <ul className="space-y-3">
              {['Personal Loan', 'Home Loan', 'Business Loan', 'Credit Cards', 'Loan Against Property', 'Mutual Funds', 'Fixed Deposits'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(/ /g, '-')}`} className="block text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          <FooterAccordion title="Company" id="company">
            <ul className="space-y-3">
              {[
                { label: 'About Us', link: '/about-us' },
                { label: 'Careers', link: '/careers', badge: 'Hiring' },
                { label: 'Partner with Us', link: '/partner' },
                { label: 'Blog', link: '/blog' },
                { label: 'Privacy Policy', link: '/privacy-policy' },
                { label: 'Terms of Use', link: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.link} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all">
                    {item.label}
                    {item.badge && (
                      <span className="text-[9px] font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          <FooterAccordion title="Contact" id="contact">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-slate-400 text-xs leading-relaxed">
                  123, Financial District, Gachibowli,<br />Hyderabad, Telangana - 500032
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="tel:18001234567" className="text-slate-400 hover:text-white transition-colors">1800-123-4567</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="mailto:support@loanzaar.in" className="text-slate-400 hover:text-white transition-colors">support@loanzaar.in</a>
              </li>
            </ul>
          </FooterAccordion>

          </div>
        </Container>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-slate-900 bg-slate-950">
        <Container className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p className="text-center md:text-left">
              &copy; {new Date().getFullYear()} Loanzaar Financial Services Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span>CIN: U65999TG2024PTC</span>
              <span>ARN: 123456</span>
            </div>
          </div>
        </Container>
      </div>

    </footer>
  );
}