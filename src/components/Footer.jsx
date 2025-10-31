'use client'

import React, { useState } from 'react';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle scroll for back-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load Tawk.to chat widget
  React.useEffect(() => {
    // Initialize Tawk global variables
    if (typeof window !== 'undefined') {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      // Create and inject Tawk.to script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/68f14ad8c0f37d1953b3e87f/1j7n8oob7';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.body.appendChild(script);

      return () => {
        // Cleanup on unmount (optional)
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', newsletterEmail);
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Quick Links Banner */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5 lg:px-15 lg:py-5">
          <div className="text-center mb-3">
            <button className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider flex items-center justify-center mx-auto hover:text-slate-300 transition-colors">
              MOST SEARCHED LINKS
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
              <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 pb-2 min-w-max justify-center">
              {[
                { text: "DSA Partner", url: "/dsa-partner" },
                { text: "Direct Selling Agent", url: "/direct-selling-agent" },
                { text: "Credit Cards", url: "/credit-cards" },
                { text: "Car Refinance", url: "/car-loan/car-refinance" },
                { text: "DSA Loan", url: "/dsa-loan" },
                { text: "Check CIBIL Score", url: "/check-cibil-score" },
                { text: "DSA Loan Agent", url: "/dsa-loan-agent" },
                { text: "Personal EMI Calculator", url: "/personal-emi-calculator" },
                { text: "Become Loan DSA", url: "/become-loan-dsa" }
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap inline-block hover:bg-slate-800"
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-slate-900 py-10 sm:py-15 md:py-20 lg:py-20 px-4 sm:px-6 md:px-10 lg:px-15">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Loanzaar</h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  Your Trusted Partner in Financial Solutions
                </p>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Loanzaar connects you with the best loan options tailored to your needs. From personal loans to business financing, we make your financial journey seamless.
                </p>
                <div className="flex items-center space-x-5 mb-6">
                  <div className="flex items-center text-emerald-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    100% Secure
                  </div>
                  <div className="flex items-center text-emerald-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    RBI Approved
                  </div>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mb-6">
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Subscribe
                  </button>
                </form>
              </div>

              {/* App Download */}
              <div className="flex gap-3">
                <a href="/download/android" className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors duration-300">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4482-.9993-.9993s.4482-.9993.9993-.9993.9993.4482.9993.9993-.4482.9993-.9993.9993zm-11.046 0c-.5511 0-.9993-.4482-.9993-.9993s.4482-.9993.9993-.9993.9993.4482.9993.9993-.4482.9993-.9993.9993zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5.066 14.014H6.934c-.552 0-1-.448-1-1V8.986c0-.552.448-1 1-1h10.132c.552 0 1 .448 1 1v6.028c0 .552-.448 1-1 1z"/>
                  </svg>
                  Google Play
                </a>
                <a href="/download/ios" className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors duration-300">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Company */}
                <div>
                  <h4 className="text-base font-bold text-white mb-5 uppercase tracking-wide">Company</h4>
                    <ul className="space-y-3">
                    {[
                      { text: "About Us", url: "/about-us" },
                      { text: "News", url: "/news" },
                      { text: "Grow With Us", url: "/grow-with-us", badge: "Hiring" },
                      { text: "Become a Partner", url: "/become-partner" },
                      { text: "Contact Us", url: "/contact-us" },
                      { text: "Privacy Policy", url: "/privacy-policy" },
                      { text: "Data Storage Policy", url: "/data-storage-policy" },
                      { text: "Terms of Service", url: "/terms-of-service" },
                      { text: "Lending Partners", url: "/lending-partners" },
                      { text: "Grievance Redressal", url: "/grievance-redressal" }
                    ].map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.url}
                          className="flex items-center text-sm text-slate-400 hover:text-blue-400 transition-all duration-300 group"
                        >
                          <svg className="w-3.5 h-3.5 mr-2 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {link.text}
                          {link.badge && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-emerald-500 text-white rounded-full">
                              {link.badge}
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Knowledge Center */}
                <div>
                  <h4 className="text-base font-bold text-white mb-5 uppercase tracking-wide">Knowledge Center</h4>
                    <ul className="space-y-3">
                    {[
                      { text: "Blogs", url: "/blogs" },
                      { text: "Check CIBIL Score", url: "/check-cibil-score", badge: "NEW" },
                      { text: "Videos", url: "/videos" },
                      { text: "Product Info", url: "/product-info" },
                      { text: "Tutorials", url: "/tutorials" },
                      { text: "Financial Guides", url: "/financial-guides", badge: "New" },
                      { text: "EMI Calculators", url: "/calculators" }
                    ].map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.url}
                          className="flex items-center text-sm text-slate-400 hover:text-blue-400 transition-all duration-300 group"
                        >
                          <svg className="w-3.5 h-3.5 mr-2 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {link.text}
                          {link.badge && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded-full">
                              {link.badge}
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Loans */}
                <div>
                  <h4 className="text-base font-bold text-white mb-5 uppercase tracking-wide">Loans</h4>
                  <ul className="space-y-3">
                    {[
                      { text: "Home Loan", url: "/home-loan" },
                      { text: "Personal Loan", url: "/personal-loan" },
                      { text: "Business Loan", url: "/business-loan" },
                      { text: "Car Loan", url: "/car-loan" },
                      { text: "Car Refinance", url: "/car-loan/car-refinance" },
                      { text: "Used Car Loan", url: "/car-loan/used-car-loan" },
                      { text: "Loan Against Property", url: "/loan-against-property" },
                      { text: "Machinery Loan", url: "/machinery-loan" },
                      { text: "Education Loan", url: "/education-loan" },
                      { text: "Gold Loan", url: "/gold-loan" },
                      { text: "Solar Loan", url: "/solar-loan" }
                    ].map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.url}
                          className="flex items-center text-sm text-slate-400 hover:text-blue-400 transition-all duration-300 group"
                        >
                          <svg className="w-3.5 h-3.5 mr-2 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Insurance & DSA */}
                <div>
                  <div className="mb-8">
                    <h4 className="text-base font-bold text-white mb-5 uppercase tracking-wide">Insurance</h4>
                    <ul className="space-y-3">
                      {[
                        { text: "All Insurance", url: "/insurance/all-insurance" },
                        { text: "Life Insurance", url: "/insurance/life-insurance" },
                        { text: "Health Insurance", url: "/insurance/health-insurance" },
                        { text: "General Insurance", url: "/insurance/general-insurance" }
                      ].map((link, index) => (
                        <li key={index}>
                          <a
                            href={link.url}
                            className="flex items-center text-sm text-slate-400 hover:text-blue-400 transition-all duration-300 group"
                          >
                            <svg className="w-3.5 h-3.5 mr-2 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {link.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-5 uppercase tracking-wide">DSA</h4>
                    <ul className="space-y-3">
                      {[
                        { text: "Personal Loan DSA", url: "/personal-loan-dsa" },
                        { text: "Home Loan DSA", url: "/home-loan-dsa" },
                        { text: "Business Loan DSA", url: "/business-loan-dsa" },
                        { text: "Loan Against Property DSA", url: "/loan-against-property-dsa" },
                        { text: "Credit Card DSA", url: "/credit-card-dsa" }
                      ].map((link, index) => (
                        <li key={index}>
                          <a
                            href={link.url}
                            className="flex items-center text-sm text-slate-400 hover:text-blue-400 transition-all duration-300 group"
                          >
                            <svg className="w-3.5 h-3.5 mr-2 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {link.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-15">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center text-slate-400 text-sm">
              <svg className="w-5 h-5 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              SSL Secured
            </div>
            <div className="flex items-center text-slate-400 text-sm">
              <svg className="w-5 h-5 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified Business
            </div>
            <div className="flex items-center text-slate-400 text-sm">
              <svg className="w-5 h-5 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              24/7 Support
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-950 border-t border-slate-700 py-6 sm:py-8 md:py-8 px-4 sm:px-6 md:px-10 lg:px-15">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center text-sm text-slate-500">
              <span>©2025 Loanzaar — All Rights Reserved</span>
              <span className="hidden sm:block mx-4 text-slate-600">|</span>
              <span className="sm:hidden my-2 text-slate-600">—</span>
              <span>Toll-free Number — <a href="tel:1800-266-7576" className="text-blue-400 hover:text-blue-300 transition-colors">1800-266-7576</a></span>
            </div>
            <div className="flex items-center space-x-4">
              {[
                { platform: 'whatsapp', url: 'https://wa.me/1234567890', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' },
                { platform: 'twitter', url: 'https://twitter.com/loanzaar', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
                { platform: 'facebook', url: 'https://facebook.com/loanzaar', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { platform: 'linkedin', url: 'https://linkedin.com/company/loanzaar', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                { platform: 'instagram', url: 'https://instagram.com/loanzaar', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.645.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                { platform: 'youtube', url: 'https://youtube.com/@loanzaar', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                { platform: 'email', url: 'mailto:support@loanzaar.com', icon: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.98L12 9.545l9.384-5.724h.98c.904 0 1.636.732 1.636 1.636z' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  aria-label={social.platform}
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all duration-300 hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          // Adjusted position and z-index for better alignment with Tawk.to widget
          className="fixed bottom-24 right-8 md:bottom-12 md:right-24 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:-translate-y-1"
          aria-label="Back to top"
          title="Back to top"
          style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 2147483647 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </footer>
  );
}
