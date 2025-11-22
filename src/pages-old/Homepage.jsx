'use client'

import React, { useState } from 'react';
import StructuredData from '../components/StructuredData';
import { generateWebPageSchema } from '../utils/schema';
// import Link from 'next/link'; // Removed for single-file compatibility

// --- ICONS (Replaced Emojis with Lucide Icons for a professional feel) ---
import { 
  Users, 
  Banknote, 
  CheckCircle, 
  Landmark, 
  Home, 
  Car, 
  Briefcase, 
  GraduationCap, 
  Building, 
  Shield, 
  HeartPulse, 
  CarFront, 
  Zap, 
  Eye, 
  Target, 
  Lock, 
  ArrowRight, 
  Check, 
  ChevronDown,
  MoveRight 
} from 'lucide-react';

// --- DATA CONSTANTS (Updated with new Icon components) ---

const stats = [
  { label: 'Active Users', value: '2.5L+', icon: <Users className="w-6 h-6 text-blue-300" /> },
  { label: 'Loan Disbursed', value: '₹500Cr+', icon: <Banknote className="w-6 h-6 text-blue-300" /> },
  { label: 'Success Rate', value: '94%', icon: <CheckCircle className="w-6 h-6 text-blue-300" /> }
];

const loanProducts = [
  {
    id: 'personal-loan',
    title: 'Personal Loan',
    description: 'Instant funds for any purpose',
    icon: <Landmark className="w-6 h-6" />,
    features: ['2-24 hrs approval', 'Up to ₹25 lakh', 'Flexible tenure'],
    link: '/personal-loan',
    featured: true
  },
  {
    id: 'home-loan',
    title: 'Home Loan',
    description: 'Build your dream home',
    icon: <Home className="w-6 h-6" />,
    features: ['Up to ₹1 crore', 'Best rates', '20+ year tenure'],
    link: '/home-loan'
  },
  {
    id: 'car-loan',
    title: 'Car Loan',
    description: 'Drive your dream car',
    icon: <Car className="w-6 h-6" />,
    features: ['90% financing', 'Quick approval', '7-year tenure'],
    link: '/car-loan'
  },
  {
    id: 'business-loan',
    title: 'Business Loan',
    description: 'Grow your business',
    icon: <Briefcase className="w-6 h-6" />,
    features: ['Up to ₹50 lakh', 'Flexible terms', 'Quick disbursal'],
    link: '/business-loan'
  },
  {
    id: 'education-loan',
    title: 'Education Loan',
    description: 'Invest in future',
    icon: <GraduationCap className="w-6 h-6" />,
    features: ['All courses covered', 'Easy eligibility', 'Moratorium period'],
    link: '/education-loan'
  },
  {
    id: 'property-loan',
    title: 'Loan Against Property',
    description: 'Unlock property value',
    icon: <Building className="w-6 h-6" />,
    features: ['Up to ₹1 crore', 'Minimal documentation', 'Quick processing'],
    link: '/loan-against-property'
  }
];

const insuranceProducts = [
  {
    id: 'life-insurance',
    title: 'Life Insurance',
    description: 'Secure your family\'s future',
    icon: <Shield className="w-8 h-8" />,
    link: '/insurance/life'
  },
  {
    id: 'health-insurance',
    title: 'Health Insurance',
    description: 'Comprehensive health protection',
    icon: <HeartPulse className="w-8 h-8" />,
    featured: true,
    link: '/insurance/health'
  },
  {
    id: 'car-insurance',
    title: 'Car Insurance',
    description: 'Complete car protection',
    icon: <CarFront className="w-8 h-8" />,
    link: '/insurance/car'
  }
];

const features = [
  {
    title: 'Lightning Fast Approval',
    description: 'Get approval in as little as 2 hours with our streamlined process',
    icon: <Zap className="w-10 h-10 text-blue-600" />
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden charges. Know exactly what you\'ll pay before applying',
    icon: <Eye className="w-10 h-10 text-blue-600" />
  },
  {
    title: 'Expert Guidance',
    description: 'Our financial experts are here to help you choose the best option',
    icon: <Target className="w-10 h-10 text-blue-600" />
  },
  {
    title: 'Secure & Safe',
    description: 'Bank-level security for all your personal and financial data',
    icon: <Lock className="w-10 h-10 text-blue-600" />
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

// --- COMPONENTS (Refactored for new design) ---

const LoanProductCard = ({ product }) => (
  <div className={`group relative rounded-2xl border transition-all duration-300 ${
    product.featured
      ? 'border-blue-400 bg-blue-50/50 shadow-lg hover:shadow-xl hover:-translate-y-1'
      : 'border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1'
  } p-6 overflow-hidden`}>
    {product.featured && (
      <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-2 rounded-bl-2xl text-xs font-bold uppercase tracking-wider">
        Popular
      </div>
    )}
    
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${
        product.featured ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700'
      }`}>
        {product.icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{product.description}</p>
      
      <div className="space-y-2 mb-6">
        {product.features?.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="w-5 h-5 text-blue-600" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
      
      <a 
        href={product.link} 
        className={`inline-flex items-center gap-2 font-semibold transition-all duration-300 ${
          product.featured
            ? 'text-blue-600 hover:text-blue-700 hover:gap-3'
            : 'text-gray-700 hover:text-blue-600 hover:gap-3'
      }`}>
        Check Eligibility
        <ArrowRight className="w-5 h-5" />
      </a>
    </div>
  </div>
);

const InsuranceCard = ({ product }) => (
  <div className={`group rounded-2xl border transition-all duration-300 ${
    product.featured
      ? 'border-emerald-400 bg-emerald-50/50 shadow-lg hover:shadow-xl'
      : 'border-gray-200 bg-white shadow-sm hover:shadow-lg'
  } p-6 text-center`}>
    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 ${
       product.featured ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-700'
    }`}>
      {product.icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{product.title}</h3>
    <p className="text-gray-600 text-sm mb-6">{product.description}</p>
    <a 
      href={product.link} 
      className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
    >
      Learn More
      <ArrowRight className="w-5 h-5" />
    </a>
  </div>
);

const FeatureCard = ({ feature }) => (
  <div className="group rounded-2xl border border-gray-200 bg-white p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
    <div className="mb-4">{feature.icon}</div>
    <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
  </div>
);

const TestimonialCard = ({ testimonial }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
    <div className="flex gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <span key={i} className="text-yellow-400 text-lg">★</span>
      ))}
    </div>
    <p className="text-gray-700 mb-6 italic flex-grow">"{testimonial.text}"</p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg">
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
      <ChevronDown
        className={`w-6 h-6 text-blue-600 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="px-6 pb-6 text-gray-600 border-t border-gray-100 leading-relaxed">
        {item.answer}
      </div>
    )}
  </div>
);

const HeroGraphic = () => (
  <div className="relative hidden lg:flex items-center justify-center">
    <div className="w-full max-w-md">
      <div className="relative aspect-square w-full">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gray-200 rounded-lg opacity-60 transform rotate-12"></div>
        
        {/* Main card element */}
        <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%]">
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-800">Your Loan Offer</span>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <span className="text-xs text-gray-500">Loan Amount</span>
              <p className="text-2xl font-bold text-gray-900">₹10,00,000</p>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-blue-500"></div>
            </div>
            <button className="w-full text-center rounded-full bg-blue-600 text-white px-5 py-2.5 font-bold text-sm">
              View Details
            </button>
          </div>
        </div>

        {/* Floating secondary card */}
        <div className="absolute bottom-1/4 left-0 w-48 bg-white rounded-lg shadow-xl p-3 border border-gray-100">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Bank-Level Security</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);


// --- MAIN COMPONENT ---

const HomePage = () => {
  const [openFaq, setOpenFaq] = useState(0); // Open the first FAQ by default


  const schema = generateWebPageSchema({
    name: 'Loanzaar - Compare Loan Offers & Get Instant Approval',
    description: 'Fast loan approval in 2-24 hours. Compare personal loans, home loans, car loans & more from 120+ lenders. Get your best loan offer instantly!',
    url: 'https://loanzaar.in',
    breadcrumbs: [
      { name: 'Home', url: 'https://loanzaar.in' }
    ]
  });

  return (
    <>
      <StructuredData schema={schema} />
      {/* Meta component was here, but it's not defined in this file. 
        In a real Next.js app, you'd import and use it like:
        <Meta
          title="Loanzaar - Compare Loan Offers & Get Instant Approval | India's #1 Loan Platform"
          description="Fast loan approval in 2-24 hours. Compare personal loans, home loans, car loans & more from 120+ lenders. Get your best loan offer instantly!"
        />
      */}      <div className="min-h-screen bg-white font-sans">
        
        {/* Hero Section - New Minimal Design */}
        <section className="relative overflow-hidden bg-gray-900 text-white pt-32 pb-32 px-4">
          <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Hero Text Content */}
              <div className="space-y-8">
                <span className="inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-sm font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                  </span>
                  Trusted by 2.5L+ Indians
                </span>

                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Smart Loans for Your Every Need
                </h1>

                <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                  Get instant approval on personal loans, home loans, and more. Compare offers from 120+ lenders and choose what's best for you.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a 
                    href="/personal-loan" 
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-8 py-4 font-bold hover:bg-blue-700 transition-all duration-300 hover:scale-105 transform"
                  >
                    Get Loan Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                  <a 
                    href="/check-cibil-score" 
                    className="inline-flex items-center justify-center rounded-full border-2 border-white/50 text-white px-8 py-4 font-bold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  >
                    Check Credit Score
                  </a>
                </div>
              </div>
              
              {/* Hero Graphic */}
              <HeroGraphic />

            </div>

            {/* Stats below hero content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-24 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  {stat.icon}
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-gray-300 text-sm font-medium">{stat.label}</p>
                </div>
              ))}
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

            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { step: '1', title: 'Apply', desc: 'Fill simple form in 2 mins' },
                { step: '2', title: 'Verify', desc: 'We verify your documents' },
                { step: '3', title: 'Approve', desc: 'Get instant approval' },
                { step: '4', title: 'Disburse', desc: 'Receive funds quickly' }
              ].map((item, idx, arr) => (
                <div key={idx} className="text-center group relative px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 text-2xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 ring-8 ring-blue-50">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                  
                  {idx < arr.length - 1 && (
                    <MoveRight className="hidden md:block absolute top-8 left-1/2 ml-[50%] w-12 h-12 text-gray-300" />
                  )}
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

        {/* CTA Section - New Minimal Design */}
        <section className="py-20 px-4 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold text-gray-900">Ready to Get Your Loan?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join over 2.5 lakhs Indians who've found their perfect financial solution with Loanzaar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/personal-loan" 
                className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-8 py-4 font-bold hover:bg-blue-700 transition-all duration-300 hover:scale-105 transform"
              >
                Get Started Now
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-700 px-8 py-4 font-bold hover:bg-gray-200 transition-all duration-300"
              >
                Contact Support
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-gray-900 text-gray-400 text-center border-t border-gray-800">
          <p>© 2024 Loanzaar. All rights reserved. | <a href="/privacy" className="text-gray-300 hover:text-blue-400">Privacy Policy</a> | <a href="/terms" className="text-gray-300 hover:text-blue-400">Terms of Service</a></p>
        </footer>
      </div>
    </>
  );
};

export default HomePage;

