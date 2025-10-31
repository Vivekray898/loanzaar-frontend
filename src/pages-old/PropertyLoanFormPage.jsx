'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';

const LoanAgainstPropertyPage = () => {
  // State for tabs, EMI calculator, and FAQs
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(2500000); // Default 25 Lakh
  const [interestRate, setInterestRate] = useState(9.5);
  const [tenure, setTenure] = useState(180); // Default 15 years in months
  const [emi, setEmi] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);

  // --- Scroll and Active Tab Logic ---
  const handleTabClick = (tabId) => {
    const section = document.getElementById(`${tabId}-section`);
    if (section) {
      const headerOffset = 130; // Height of breadcrumb + sticky tab navigation
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveTab(tabId);
    }
  };

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
      root: null,
      rootMargin: '-140px 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id.replace('-section', ''));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((sec) => observer.observe(sec));

    return () => sections.forEach((sec) => observer.unobserve(sec));
  }, []);

  // --- EMI Calculation ---
  useEffect(() => {
    if (loanAmount > 0 && interestRate > 0 && tenure > 0) {
      const principal = loanAmount;
      const rate = interestRate / 100 / 12;
      const time = tenure;
      const emiCalc = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
      const total = emiCalc * time;
      const interest = total - principal;
      setEmi(Math.round(emiCalc));
      setTotalAmount(Math.round(total));
      setTotalInterest(Math.round(interest));
    }
  }, [loanAmount, interestRate, tenure]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'documents', label: 'Documents' },
    { id: 'emi-calculator', label: 'EMI Calculator' },
    { id: 'fees', label: 'Fees & Charges' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faqs', label: 'FAQs' }
  ];

  const features = [
    { title: 'Flexible Loan Eligibility', description: 'We offer a wide range of eligibility criteria to suit various profiles.' },
    { title: 'High Loan Value', description: 'Get loans from ₹10 Lakh to ₹5 Crore, based on your property\'s value.' },
    { title: 'Versatile Collateral', description: 'Use your commercial, residential, or industrial property to secure the loan.' },
    { title: 'Multipurpose Use', description: 'Fund your business expansion, education, weddings, or any other personal need.' },
    { title: 'Longer Tenure', description: 'Repayment periods can extend from 5 to 20 years, allowing for smaller, manageable EMIs.' },
    { title: 'Improve Credit Score', description: 'Timely repayment of a LAP can positively impact your credit history.' }
  ];
  
  const eligibilityCriteria = [
      'Nationality: Must be a citizen of India.',
      'Occupation and Income: A stable source of income is required to prove financial stability and repayment capacity.',
      'Credit History: A strong credit score is a key factor in determining your eligibility.',
      "Market Value of Property: The loan amount is directly linked to the current market value of your property.",
      "Property Title: The property's title must be clear and not mortgaged with another institution."
  ];

  const documents = [
    'Proof of Identity / Residence (Aadhaar, Passport, Voter ID, etc.)',
    'Proof of Income (Salary Slips, ITR, Bank Statements)',
    'Property-related documents (Title Deed, Sale Agreement, etc.)',
    'Proof of Business (for self-employed applicants)',
    'Bank account statement for the last 6 months.'
  ];

  const fees = [
    { particular: 'Loan Processing Fees', charges: '0.25% to 2% of Loan Amount' },
    { particular: 'Loan Cancellation', charges: 'Nil - 5% (according to Bank/NBFC)' },
    { particular: 'Stamp Duty Charges', charges: 'As per the Value of the Property and State Tax' },
    { particular: 'Legal Fees', charges: 'As per actual' },
    { particular: 'Penal Charges', charges: 'Usually 2% per month on the overdue amount' },
    { particular: 'EMI / Cheque Bounce', charges: 'Approx ₹500/-' },
    { particular: 'Foreclosure Charges', charges: 'Nil to 4% (according to Bank/NBFC)' }
  ];

  const reviews = [
    { rating: 4, text: "Loanzaar helped me find the appropriate lender... Within a span of 20 days my loan against property got approved and disbursed.", author: "DHWANI DAVE" },
    { rating: 4, text: "I read a blog of debt consolidation posted by Loanzaar... Loanzaar personnel were so helpful about providing me the right path and knowledge about it and helped me to shift all my loans at one place.", author: "MANN DESAI" },
    { rating: 4, text: "My documents were collected from home and the process was completed on time. A big thanks to Loanzaar.", author: "PRERANA SONI" },
    { rating: 4, text: "It was a smooth process and they regularly updated me with the developments. Even they sanctioned my loan in a proper time frame. Surely recommended.", author: "ADITI GANGWAL" }
  ];

  const faqs = [
    { question: 'What can I use a Loan Against Property for?', answer: 'A Loan Against Property (LAP) is very versatile. You can use the funds for business expansion, your child\'s education, wedding expenses, medical emergencies, or any other major personal or business-related financial requirement.' },
    { question: 'How much loan can I get against my property?', answer: 'The loan amount depends on the market value of your property. Lenders typically offer a loan-to-value (LTV) ratio of up to 70-80%, meaning you can get a loan for that percentage of your property\'s assessed value.' },
    { question: 'What are the interest rates for LAP?', answer: 'Interest rates for LAP are generally lower than unsecured loans (like personal loans) because the property serves as collateral. The exact rate depends on your credit score, income, and the lender\'s policies.' },
    { question: 'How do I apply for a LAP?', answer: 'The process involves submitting an application form along with the required documents (identity, income, and property proofs). The lender will then verify the documents and perform a valuation of your property before sanctioning the loan.' },
    { question: 'Can I still use my property if it\'s mortgaged for LAP?', answer: 'Yes, absolutely. You retain ownership and can continue to live in or use your property as usual. You only transfer the property title deed to the lender as security for the loan duration.' },
    { question: 'What is a Loan Against Property Overdraft (LAP OD)?', answer: 'A LAP OD is a facility where you get a sanctioned credit limit based on your property value. You can withdraw funds as needed from this limit and pay interest only on the amount utilized, not the entire sanctioned limit.' },
    { question: 'Can I do a Balance Transfer in LAP?', answer: 'Yes, you can transfer your existing Loan Against Property from one lender to another, typically to take advantage of a lower interest rate or better loan terms. This is known as a balance transfer.' },
    { question: 'Can I take a Top-up in LAP?', answer: 'Yes, if you have been repaying your existing LAP on time, many lenders offer a top-up loan, which is an additional amount over and above your current outstanding loan.' },
    { question: 'How is the value of the property calculated?', answer: 'Lenders appoint an independent, certified valuer to assess the property. They consider factors like location, size, condition of the property, and current market trends to determine its fair market value.' },
    { question: 'What types of properties are accepted by lenders?', answer: 'Most lenders accept self-occupied or rented residential properties (like a house or apartment), commercial properties (like an office or shop), and industrial properties.' },
    { question: 'What is the difference between a Home Loan and a Loan against Property (LAP)?', answer: 'A Home Loan is used exclusively to purchase or construct a new property. A Loan Against Property is taken by mortgaging an existing property you already own, and the funds can be used for any purpose.' },
    { question: 'Can I prepay/foreclose my Loan Against Property in advance?', answer: 'Yes, you can prepay your LAP. However, some lenders may charge a prepayment or foreclosure penalty. It\'s important to check the terms and conditions in your loan agreement.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Meta 
        title="Property Loan - Secure Financing Against Your Asset | Loanzaar" 
        description="Get a loan against your property with flexible terms and competitive rates. Quick approval and easy documentation on Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Loan Against Property</span>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-6 md:px-16 flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Turn Your Property into Capital with <span className="text-red-500">Ease!</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Get the best Loan Against Property deals at a lower interest rate. Unlock the value of your property for your business or personal needs.</p>
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg transition">Apply Now</button>
          </div>
          <div className="relative">
            <img src="/loan-against-property-hero.png" alt="House with keys and coins" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">Property Loan</text></svg>'} />
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <nav className="sticky top-16 bg-white border-b-2 border-gray-100 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="flex overflow-x-auto space-x-2 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${activeTab === tab.id ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

        <section id="overview-section" className="py-20 px-6 md:px-16 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Overview & Features</h2>
                <div className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed space-y-6">
                    <p>A Loan Against Property (LAP) is a secured loan that allows you to leverage your property as collateral. This typically results in lower interest rates and higher loan amounts compared to unsecured loans, giving you the financial flexibility you need.</p>
                </div>
            </div>
        </section>

        <section id="features-section" className="py-20 px-6 md:px-16 bg-gray-50">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features & Benefits</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature) => (
                    <div key={feature.title} className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>

        <section id="eligibility-section" className="py-20 px-6 md:px-16 bg-white">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Eligibility Criteria</h2>
                 <div className="grid md:grid-cols-1 gap-6">
                    {eligibilityCriteria.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-6 rounded-lg flex items-start space-x-4">
                            <p className="text-gray-700">{item}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="documents-section" className="py-20 px-6 md:px-16 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Required Documents</h2>
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <ul className="list-disc pl-6 text-lg text-gray-700 space-y-3">
                        {documents.map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>

        <section id="emi-calculator-section" className="py-20 px-6 md:px-16 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Loan Against Property EMI Calculator</h2>
                <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto">Our EMI calculator helps you understand the financial implications of your loan by estimating your monthly payments. The Equated Monthly Installment (EMI) is calculated using the formula: <strong>EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]</strong>, where P is the principal, r is the monthly interest rate, and n is the tenure in months.</p>
                <div className="bg-gray-50 p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Loan Amount: ₹{loanAmount.toLocaleString()}</label>
                            <input type="range" min="1000000" max="50000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Interest Rate: {interestRate}%</label>
                            <input type="range" min="8" max="15" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Loan Tenure: {tenure} months ({Math.round(tenure/12)} years)</label>
                            <input type="range" min="60" max="240" step="12" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full" />
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-500">₹{emi.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Monthly EMI</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-500">₹{totalAmount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Total Amount</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-500">₹{totalInterest.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Total Interest</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="fees-section" className="py-20 px-6 md:px-16 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Fees and Charges</h2>
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Particulars</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Charges</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {fees.map((fee, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 text-sm text-gray-900">{fee.particular}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{fee.charges}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-6 text-sm text-gray-600 text-center">Other potential charges include fees for documentation, verification, and duplicate statements.</p>
            </div>
        </section>

        <section id="reviews-section" className="py-20 px-6 md:px-16 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-12">Customer Reviews</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {reviews.map((review, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-xl text-left">
                            <div className="flex items-center mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                            <p className="text-sm font-semibold text-gray-900">— {review.author}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="faqs-section" className="py-20 px-6 md:px-16 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="rounded-2xl border border-gray-200 bg-white">
                            <button
                                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                className="flex w-full items-center justify-between gap-4 rounded-2xl px-6 py-4 text-left"
                            >
                                <span className="text-base font-semibold text-gray-900">{faq.question}</span>
                                <svg className={`h-5 w-5 text-gray-500 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {activeFaq === index && (
                                <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>

      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to unlock your property's potential?</h2>
          <p className="text-xl mb-8">Apply for Your Loan Against Property Today!</p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">Apply for Your Loan Against Property Today!</button>
        </div>
      </section>
    </div>
  );
};

export default LoanAgainstPropertyPage;

