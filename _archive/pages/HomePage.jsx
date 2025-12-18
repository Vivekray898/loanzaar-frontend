import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Meta from '../components/Meta';

// --- DATA CONSTANTS ---

const stats = [
  { label: 'Active Users', value: '2.5L+', icon: '👥' },
  { label: 'Loan Disbursed', value: '₹500Cr+', icon: '💵' },
  { label: 'Success Rate', value: '94%', icon: '✓' }
];

const loanProducts = [
  {
    id: 'personal-loan',
    title: 'Personal Loan',
    description: 'Instant funds for any purpose',
    icon: '💰',
    features: ['2-24 hrs approval', 'Up to ₹25 lakh', 'Flexible tenure'],
    link: '/personal-loan',
    featured: true
  },
  {
    id: 'home-loan',
    title: 'Home Loan',
    description: 'Build your dream home',
    icon: '🏠',
    features: ['Up to ₹1 crore', 'Best rates', '20+ year tenure'],
    link: '/home-loan'
  },
  {
    id: 'car-loan',
    title: 'Car Loan',
    description: 'Drive your dream car',
    icon: '🚗',
    features: ['90% financing', 'Quick approval', '7-year tenure'],
    link: '/car-loan'
  },
  {
    id: 'business-loan',
    title: 'Business Loan',
    description: 'Grow your business',
    icon: '💼',
    features: ['Up to ₹50 lakh', 'Flexible terms', 'Quick disbursal'],
    link: '/business-loan'
  },
  {
    id: 'education-loan',
    title: 'Education Loan',
    description: 'Invest in future',
    icon: '🎓',
    features: ['All courses covered', 'Easy eligibility', 'Moratorium period'],
    link: '/education-loan'
  },
  {
    id: 'property-loan',
    title: 'Loan Against Property',
    description: 'Unlock property value',
    icon: '🏢',
    features: ['Up to ₹1 crore', 'Minimal documentation', 'Quick processing'],
    link: '/loan-against-property'
  }
];

const insuranceProducts = [
  {
    id: 'life-insurance',
    title: 'Life Insurance',
    description: 'Secure your family\'s future',
    icon: '🛡️',
    link: '/insurance/life'
  },
  {
    id: 'health-insurance',
    title: 'Health Insurance',
    description: 'Comprehensive health protection',
    icon: '⚕️',
    featured: true,
    link: '/insurance/health'
  },
  {
    id: 'car-insurance',
    title: 'Car Insurance',
    description: 'Complete car protection',
    icon: '🚙',
    link: '/insurance/car'
  }
];

const features = [
  {
    title: 'Lightning Fast Approval',
    description: 'Get approval in as little as 2 hours with our streamlined process',
    icon: '⚡'
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden charges. Know exactly what you\'ll pay before applying',
    icon: '👁️'
  },
  {
    title: 'Expert Guidance',
    description: 'Our financial experts are here to help you choose the best option',
    icon: '🎯'
  },
  {
    title: 'Secure & Safe',
    description: 'Bank-level security for all your personal and financial data',
    icon: '🔒'
  }
];

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Small Business Owner',
    text: 'Got my business loan approved in just 48 hours. The process was incredibly smooth!',
    rating: 5
  },
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    text: 'The best platform for comparing loan offers. Saved me ₹2 lakhs in interest!',
    rating: 5
  },
  {
    name: 'Amit Patel',
    role: 'Entrepreneur',
    text: 'Transparent, fast, and reliable. I recommend Loanzaar to all my friends.',
    rating: 5
  }
];

const faqItems = [
  {
    question: 'How long does the approval process take?',
    answer: 'Most applications receive conditional approval within 2-24 hours depending on the loan type. Once documents are verified, disbursals happen within 48-72 hours.'
  },
  {
    question: 'Will my credit score be affected?',
    answer: 'No, our credit score check is a soft inquiry and does not impact your credit profile. It only counts as a soft inquiry with your consent.'
  },
  {
    question: 'What documents do I need?',
    answer: 'You\'ll need your ID proof, address proof, last 3-6 months of bank statements, and income documents. Our specialists will guide you through the process.'
  },
  {
    question: 'Can I apply for multiple loans?',
    answer: 'Yes! You can apply for and track multiple loan applications simultaneously. Our dashboard helps you manage all applications in one place.'
  },
  {
    question: 'Is there a prepayment penalty?',
    answer: 'It depends on the lender. We provide all terms clearly before you apply, so you know exactly what you\'re signing up for.'
  }
];

// --- COMPONENTS ---

const ArrowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M5 12h13" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const LoanProductCard = ({ product }) => (
  <div className={`group relative rounded-2xl border transition-all duration-300 ${
    product.featured
      ? 'border-blue-400 bg-linear-to-br from-blue-50 to-white shadow-lg hover:shadow-2xl hover:-translate-y-2 scale-105'
      : 'border-gray-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1'
  } p-6 overflow-hidden`}>
    {product.featured && (
      <div className="absolute top-0 right-0 bg-linear-to-l from-blue-500 to-blue-600 text-white px-4 py-2 rounded-bl-2xl text-xs font-bold uppercase tracking-wider">
        Popular
      </div>
    )}
    
    <div className="relative z-10">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{product.icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{product.description}</p>
      
      <div className="space-y-2 mb-6">
        {product.features?.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
            <CheckIcon />
            <span>{feature}</span>
          </div>
        ))}
      </div>
      
      <Link href={product.link} className={`inline-flex items-center gap-2 font-semibold transition-all duration-300 ${
        product.featured
          ? 'text-blue-600 hover:text-blue-700 hover:gap-3'
          : 'text-gray-700 hover:text-blue-600 hover:gap-3'
      }`}>
        Check Eligibility
        <ArrowIcon />
      </Link>
    </div>
  </div>
);

const InsuranceCard = ({ product }) => (
  <div className={`group rounded-2xl border transition-all duration-300 ${
    product.featured
      ? 'border-emerald-400 bg-linear-to-br from-emerald-50 to-white shadow-lg hover:shadow-2xl'
      : 'border-gray-200 bg-white shadow-sm hover:shadow-lg'
  } p-6 text-center`}>
    <div className="text-5xl mb-4 mx-auto inline-block group-hover:scale-110 transition-transform duration-300">{product.icon}</div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{product.title}</h3>
    <p className="text-gray-600 text-sm mb-6">{product.description}</p>
    <Link href={product.link} className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
      Learn More
      <ArrowIcon />
    </Link>
  </div>
);

const FeatureCard = ({ feature }) => (
  <div className="group rounded-2xl border border-gray-200 bg-white p-8 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
    <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
  </div>
);

const TestimonialCard = ({ testimonial }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow duration-300">
    <div className="flex gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <span key={i} className="text-yellow-400 text-lg">★</span>
      ))}
    </div>
    <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
        {testimonial.name.charAt(0)}
      </div>
      <div>
        <p className="font-bold text-gray-900">{testimonial.name}</p>
        <p className="text-sm text-gray-600">{testimonial.role}</p>
      </div>
    </div>
  </div>
);

const FAQItem = ({ item, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden hover:border-blue-300 transition-colors">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50 transition-colors"
    >
      <span className="font-semibold text-gray-900">{item.question}</span>
      <svg
        className={`w-6 h-6 text-blue-600 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </button>
    {isOpen && (
      <div className="px-6 pb-6 text-gray-600 border-t border-gray-100">
        {item.answer}
      </div>
    )}
  </div>
);

// --- MAIN COMPONENT ---

const HomePage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <Meta
        title="Loanzaar - Compare Loan Offers & Get Instant Approval | India's #1 Loan Platform"
        description="Fast loan approval in 2-24 hours. Compare personal loans, home loans, car loans & more from 120+ lenders. Get your best loan offer instantly!"
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 text-white pt-20 pb-32 px-4">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <div className="space-y-8">
                <div className="inline-block">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 text-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    Trusted by 2.5L+ Indians
                  </span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Smart Loans for Your Every Need
                </h1>

                <p className="text-xl text-blue-100 max-w-lg leading-relaxed">
                  Get instant approval on personal loans, home loans, and more. Compare offers from 120+ lenders and choose what's best for you.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/personal-loan" className="inline-flex items-center justify-center rounded-full bg-white text-blue-600 px-8 py-4 font-bold hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-2xl">
                    Get Loan Now
                    <ArrowIcon />
                  </Link>
                  <Link href="/check-cibil-score" className="inline-flex items-center justify-center rounded-full border-2 border-white text-white px-8 py-4 font-bold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                    Check Credit Score
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  {stats.map((stat) => (
                    <div key={stat.label} className="space-y-2">
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-blue-100 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative hidden lg:block">
                <div className="relative w-full aspect-square rounded-3xl bg-linear-to-br from-blue-400 to-blue-700 overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">
                    💳
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-blue-900/50 to-transparent flex flex-col justify-end p-8 text-white">
                    <p className="text-lg font-semibold mb-2">Fast & Secure</p>
                    <p className="text-sm text-blue-100">Bank-grade encryption for all transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Loanzaar?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the future of lending with our cutting-edge platform</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <FeatureCard key={idx} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Loan Products Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Loan Products</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the perfect loan for your financial goals</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loanProducts.map((product) => (
                <LoanProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Insurance Products Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Insurance Products</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Protect what matters most</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {insuranceProducts.map((product) => (
                <InsuranceCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Get approved in 4 simple steps</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Apply', desc: 'Fill simple form in 2 mins' },
                { step: '2', title: 'Verify', desc: 'We verify your documents' },
                { step: '3', title: 'Approve', desc: 'Get instant approval' },
                { step: '4', title: 'Disburse', desc: 'Receive funds quickly' }
              ].map((item, idx) => (
                <div key={idx} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                  {idx < 3 && <div className="hidden md:block absolute top-8 -right-3 text-3xl text-blue-300">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-xl text-gray-600">Join thousands of satisfied customers</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <TestimonialCard key={idx} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">Everything you need to know</p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <FAQItem
                  key={idx}
                  item={item}
                  isOpen={openFaq === idx}
                  onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold">Ready to Get Your Loan?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join over 2.5 lakhs Indians who've found their perfect financial solution with Loanzaar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/personal-loan" className="inline-flex items-center justify-center rounded-full bg-white text-blue-600 px-8 py-4 font-bold hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                Get Started Now
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border-2 border-white text-white px-8 py-4 font-bold hover:bg-white/10 transition-all duration-300">
                Contact Support
              </Link>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-12 px-4 bg-gray-900 text-gray-400 text-center border-t border-gray-800">
          <p>© 2024 Loanzaar. All rights reserved. | <Link href="/privacy" className="text-white hover:text-blue-400">Privacy Policy</Link> | <Link href="/terms" className="text-white hover:text-blue-400">Terms of Service</Link></p>
        </section>
      </div>
    </>
  );
};

export default HomePage;
