'use client'

import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Meta from '../components/Meta';
import { submitLoanApplication } from '../config/api';
import StructuredData from '../components/StructuredData';
import { generateLoanSchema, generateWebPageSchema } from '../utils/schema';
import { isValidPhoneNumber, formatE164 } from '../utils/phone';

const EducationLoanPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loanAmount, setLoanAmount] = useState(1000000); // Default 10 Lakh
  const [interestRate, setInterestRate] = useState(10);
  const [tenure, setTenure] = useState(120); // Default 10 years in months
  const [emi, setEmi] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cityState: '',
    dobAge: '',
    qualification: '12th',
    courseName: '',
    courseType: 'Undergraduate',
    institutionName: '',
    institutionCountry: 'India',
    courseDuration: '',
    admissionStatus: 'Applied',
    courseCost: '',
    loanAmount: 500000,
    loanPurpose: 'Tuition',
    tenure: '',
    coApplicantName: '',
    relation: 'Father',
    occupation: 'Salaried',
    monthlyIncome: '',
    existingLoans: 'No',
    consent: false
  });

  // --- Scroll and Active Tab Logic ---

  // Scrolls to the relevant section when a tab is clicked
  const handleTabClick = (tabId) => {
    const section = document.getElementById(`${tabId}-section`);
    if (section) {
      const headerOffset = 130; // Combined height of both sticky headers
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      // Set active tab immediately for better UX
      setActiveTab(tabId);
    }
  };

  // Updates the active tab based on scroll position
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');

    const observerOptions = {
      root: null, // observes intersections relative to the viewport
      rootMargin: '-140px 0px -60% 0px', // Adjusts the intersection trigger area
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Sets the active tab to the ID of the intersecting section
          setActiveTab(entry.target.id.replace('-section', ''));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((sec) => observer.observe(sec));

    // Cleanup function to unobserve sections when component unmounts
    return () => sections.forEach((sec) => observer.unobserve(sec));
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- EMI Calculation ---
  useEffect(() => {
    const principal = loanAmount;
    const rate = interestRate / 100 / 12;
    const time = tenure;
    if (principal > 0 && rate > 0 && time > 0) {
        const emiCalc = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
        const total = emiCalc * time;
        const interest = total - principal;

        setEmi(Math.round(emiCalc));
        setTotalAmount(Math.round(total));
        setTotalInterest(Math.round(interest));
    }
  }, [loanAmount, interestRate, tenure]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Please enter a valid 10-digit phone number starting with 6-9');
      return;
    }
    if (!formData.consent) {
      alert('Please agree to be contacted');
      return;
    }
    
    // CAPTCHA check
    if (!captchaToken) {
      alert('Please complete the reCAPTCHA verification by checking the "I\'m not a robot" box');
      return;
    }

    // Prepare loan data for backend
    const loanData = {
      ...formData,
      loanType: 'Education',
      captchaToken: captchaToken,
    };

    // Log the data with captcha token
    console.log('📋 Education Loan Form Data with CAPTCHA:', loanData);

    // Submit to backend
    const result = await submitLoanApplication(loanData);

    if (result.success) {
      console.log('✅ Education loan submitted successfully:', result.data);
      setSubmitted(true);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setFieldErrors({});
    setCurrentStep(currentStep - 1);
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    console.log('✅ reCAPTCHA token received:', token);
  };

  const validateField = (fieldName, value) => {
    switch(fieldName) {
      case 'fullName':
        if (!value || value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s]*$/.test(value)) return 'Full name should contain only letters';
        return '';
      case 'phone':
        if (!value || !/^[6-9]\d{9}$/.test(value)) return 'Phone must be 10 digits starting with 6-9';
        return '';
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'cityState':
        if (!value || value.trim().length < 2) return 'City/State must be at least 2 characters';
        return '';
      case 'dobAge':
        if (!value) return 'Date of birth is required';
        return '';
      case 'qualification':
        if (!value) return 'Please select qualification';
        return '';
      case 'courseName':
        if (!value || value.trim().length < 2) return 'Course name must be at least 2 characters';
        return '';
      case 'courseType':
        if (!value) return 'Please select course type';
        return '';
      case 'institutionName':
        if (!value || value.trim().length < 2) return 'Institution name must be at least 2 characters';
        return '';
      case 'courseDuration':
        if (!value) return 'Please select course duration';
        return '';
      case 'courseCost':
        if (!value) return 'Please select course cost range';
        return '';
      case 'tenure':
        if (!value) return 'Please select tenure';
        return '';
      case 'coApplicantName':
        if (!value || value.trim().length < 2) return 'Co-applicant name must be at least 2 characters';
        return '';
      case 'monthlyIncome':
        if (!value) return 'Please select monthly income range';
        return '';
      default:
        return '';
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 0) {
      const nameErr = validateField('fullName', formData.fullName);
      const phoneErr = validateField('phone', formData.phone);
      const emailErr = validateField('email', formData.email);
      const cityErr = validateField('cityState', formData.cityState);
      const dobErr = validateField('dobAge', formData.dobAge);
      const qualErr = validateField('qualification', formData.qualification);
      
      if (nameErr) { errors.fullName = nameErr; isValid = false; }
      if (phoneErr) { errors.phone = phoneErr; isValid = false; }
      if (emailErr) { errors.email = emailErr; isValid = false; }
      if (cityErr) { errors.cityState = cityErr; isValid = false; }
      if (dobErr) { errors.dobAge = dobErr; isValid = false; }
      if (qualErr) { errors.qualification = qualErr; isValid = false; }
    } else if (step === 1) {
      const courseErr = validateField('courseName', formData.courseName);
      const typeErr = validateField('courseType', formData.courseType);
      const instErr = validateField('institutionName', formData.institutionName);
      const durationErr = validateField('courseDuration', formData.courseDuration);
      const costErr = validateField('courseCost', formData.courseCost);
      const tenureErr = validateField('tenure', formData.tenure);
      
      if (courseErr) { errors.courseName = courseErr; isValid = false; }
      if (typeErr) { errors.courseType = typeErr; isValid = false; }
      if (instErr) { errors.institutionName = instErr; isValid = false; }
      if (durationErr) { errors.courseDuration = durationErr; isValid = false; }
      if (costErr) { errors.courseCost = costErr; isValid = false; }
      if (tenureErr) { errors.tenure = tenureErr; isValid = false; }
    } else if (step === 2) {
      const coAppErr = validateField('coApplicantName', formData.coApplicantName);
      const incomeErr = validateField('monthlyIncome', formData.monthlyIncome);
      
      if (coAppErr) { errors.coApplicantName = coAppErr; isValid = false; }
      if (incomeErr) { errors.monthlyIncome = incomeErr; isValid = false; }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'layout-grid' },
    { id: 'features', label: 'Features', icon: 'star' },
    { id: 'eligibility', label: 'Eligibility', icon: 'check-circle' },
    { id: 'documents', label: 'Documents', icon: 'file-text' },
    { id: 'emi-calculator', label: 'EMI Calculator', icon: 'calculator' },
    { id: 'fees', label: 'Fees & Charges', icon: 'credit-card' },
    { id: 'reviews', label: 'Reviews', icon: 'message-circle' },
    { id: 'faqs', label: 'FAQ\'s', icon: 'help-circle' }
  ];

  const features = [
    { id: 'high-value-loans', icon: 'indian-rupee', title: 'High-Value Loans', description: 'Secure the necessary funding to cover all educational expenses, from tuition to accommodation.' },
    { id: 'attractive-rates', icon: 'trending-down', title: 'Attractive Interest Rates', description: 'Benefit from competitive interest rates that make repayment more manageable.' },
    { id: 'pre-admission', icon: 'clock', title: 'Pre-Admission Sanction', description: 'Get your loan sanctioned even before your admission is confirmed.' },
    { id: 'moratorium', icon: 'pause', title: 'Moratorium Period', description: 'Repayment typically starts after the course is completed, giving students time to find employment.' },
    { id: 'co-borrower', icon: 'users', title: 'Co-borrower Option', description: 'Parents or guardians can act as co-borrowers to improve loan eligibility.' },
    { id: 'tax-benefits', icon: 'receipt', title: 'Tax Benefits', description: 'The interest paid on the loan may be eligible for tax deductions under Section 80E.' },
    { id: 'wide-coverage', icon: 'globe', title: 'Wide Coverage', description: 'Loans are available for various courses and for institutions both in India and abroad.' },
    { id: 'collateral-options', icon: 'shield', title: 'Collateral Options', description: 'Depending on the loan amount, we offer both secured and unsecured loans.' }
  ];

  const eligibilityCriteria = [
    { icon: 'user-check', text: 'Age: Applicants must typically be 18 years or older', highlight: false },
    { icon: 'book-open', text: 'Course/Program Eligibility: The loan is often tied to specific, eligible educational programs and institutions', highlight: false },
    { icon: 'file-check', text: 'Admission Offer: Proof of admission to an eligible institution is required', highlight: true },
    { icon: 'award', text: 'Academic Performance: A good academic record can strengthen your application', highlight: false },
    { icon: 'users', text: 'Co-borrower/Guarantor: A co-borrower (usually a parent or guardian) with a stable income is often required', highlight: true },
    { icon: 'star', text: 'Credit History: The credit score of the co-borrower plays a significant role in the approval process', highlight: true },
    { icon: 'home', text: 'Collateral: For larger loan amounts, collateral in the form of property or other assets may be required', highlight: false }
  ];

  const documents = [
    { category: 'Student-Applicant Documents', icon: 'user', items: ['Proof of identity (Aadhaar, PAN, passport)', 'Proof of admission to the educational institution', 'Academic records and certificates', 'Address proof'] },
    { category: 'Co-applicant/Guarantor Documents', icon: 'users', items: ['Proof of identity and address', 'Income proof', 'Credit history documents', 'Relationship proof with student'] },
    { category: 'Income Proof for Salaried Co-applicant', icon: 'briefcase', items: ['Salary slips for last 3 months', 'Form 16 or Income Tax Returns', 'Bank statements for last 6 months', 'Employment letter'] },
    { category: 'Income Proof for Self-employed Co-applicant', icon: 'building', items: ['Income Tax Returns for last 3 years', 'Profit and Loss account', 'Balance sheet', 'Business registration documents'] }
  ];

  const feesAndCharges = [
    { particular: 'Loan Processing Fees', charges: '0.5% to 2% of Loan Amount' },
    { particular: 'Loan Cancellation', charges: '0' },
    { particular: 'Stamp Duty Charges', charges: 'As per actuals' },
    { particular: 'Legal Fees', charges: 'As per actuals' },
    { particular: 'Penal Charges', charges: 'Usually @ 2% per month (24% p.a.)' },
    { particular: 'EMI / Cheque Bounce', charges: 'Around ₹590 per bounce' }
  ];

  const reviews = [
    {
      rating: 4,
      text: "Loanzaar personnel helped me in getting an education loan from axis bank for my son who wanted to complete his medical studies in UK. I was happy with the deal and rate of interest they helped me in getting from the bank.",
      author: "KETKI SHARMA"
    },
    {
      rating: 4,
      text: "Hdfc rejected my education loan application... I got in touch with Mr. Rohan from Loanzaar, he was successful in getting me the loan, the rate was a little higher than usual but I was okay with it as I was happy that atleast I got the loan.",
      author: "DAKSHA KALE"
    }
  ];

  const faqs = [
    { question: 'What is an education loan?', answer: 'An education loan is a financial product designed to help students pay for post-secondary education and associated expenses like tuition, books, supplies, and living costs.' },
    { question: 'Who is eligible for an education loan?', answer: 'Students who are 18 years or older, have admission to an eligible institution, and have a co-borrower (usually a parent) with stable income and good credit history are typically eligible.' },
    { question: 'What is a moratorium period?', answer: 'The moratorium period is the time after course completion during which loan repayment is paused, allowing students to find employment before starting EMI payments.' },
    { question: 'When does repayment start after the moratorium period?', answer: 'Repayment usually begins 6 months after course completion or after the student secures employment, whichever comes first.' },
    { question: 'Can I prepay my education loan?', answer: 'Yes, most education loans allow prepayment without penalties, though some lenders may charge a small fee for early closure.' },
    { question: 'Is there a tax benefit for education loan repayment?', answer: 'Yes, interest paid on education loans is eligible for tax deduction under Section 80E of the Income Tax Act for up to 8 years.' },
    { question: 'What happens if I miss loan payments?', answer: 'Missing payments can result in penal charges, impact your credit score, and may lead to legal action. Contact your lender immediately if you face payment difficulties.' },
    { question: 'Do I need a co-borrower or guarantor?', answer: 'Yes, most lenders require a co-borrower (usually a parent or guardian) with stable income and good credit history to improve loan eligibility.' },
    { question: 'What is the maximum loan amount I can get?', answer: 'Loan amounts can range from ₹50,000 to ₹1 crore or more, depending on the course, institution, and lender policies.' },
    { question: 'When is the most suitable time to apply for an Education Loan?', answer: 'The best time is after receiving admission confirmation but before the academic session begins, to ensure timely fund disbursement.' }
  ];

  const schemas = [
    generateLoanSchema({
      name: 'Education Loan',
      description: 'Finance your child\'s education with flexible education loans from top lenders. Quick approval, easy documentation, and affordable EMI with tenure up to 15 years.',
      loanType: 'Education Loan',
      interestRate: '8-15',
      tenure: '5-15 years',
      amount: '50,000 - 1,00,00,000'
    }),
    generateWebPageSchema({
      name: 'Education Loan Application - Loanzaar',
      description: 'Finance your child\'s education with flexible education loans from top lenders. Quick approval, easy documentation, and affordable EMI at Loanzaar.',
      url: 'https://loanzaar.in/education-loan',
      breadcrumbs: [
        { name: 'Home', url: 'https://loanzaar.in' },
        { name: 'Education Loan', url: 'https://loanzaar.in/education-loan' }
      ]
    })
  ];

  return (
    <div className="min-h-screen bg-white">
      <StructuredData schema={schemas} />
      <Meta 
        title="Education Loan Application - Loanzaar" 
        description="Finance your child's education with flexible education loans from top lenders. Quick approval, easy documentation, and affordable EMI at Loanzaar."
      />
      {/* Breadcrumb */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 md:px-16">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>&gt;</span>
          <span className="text-red-500 font-medium">Education Loan</span>
        </div>
      </nav>

      {/* Hero Section (Overview) */}
      <section id="overview-section" className="relative bg-gradient-to-br from-purple-50 to-purple-100 py-16 md:py-28 px-6 md:px-16 min-h-[500px] flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">Education Financing</span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Affordable Education Loans for Your <span className="text-red-500">Academic Dreams</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">Get affordable Education Loans from top lenders for your child's brighter future! Secure the funding you need for quality education without the financial burden.</p>            <div className="flex space-x-6 mt-8">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-600">100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                <span className="text-sm text-gray-600">Quick Approval</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm text-gray-600">High Loan Amounts</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="/education-loan-hero.png" alt="Student with graduation cap and books" className="w-full h-auto" onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" font-size="20" fill="%236b7280">Education Hero Image</text></svg>'} />
            <div className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg animate-bounce">
              <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>
            </div>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon === 'layout-grid' ? 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' : tab.icon === 'star' ? 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' : tab.icon === 'check-circle' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : tab.icon === 'file-text' ? 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : tab.icon === 'calculator' ? 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' : tab.icon === 'credit-card' ? 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' : tab.icon === 'message-circle' ? 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' : 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Overview Section */}
      <section id="overview-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">What is an Education Loan?</h2>
          <p className="text-lg text-gray-600 mb-8">
            An education loan is designed to help students pay for post-secondary education and the associated fees, such as tuition, books and supplies, and living expenses.
          </p>
          <div className="bg-purple-50 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Benefits:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="text-purple-500 font-bold">•</span>
                <span><strong>Avail High-Value Loans:</strong> Secure the necessary funding to cover all educational expenses, from tuition to accommodation.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-purple-500 font-bold">•</span>
                <span><strong>Enjoy Attractive Interest Rates:</strong> Benefit from competitive interest rates that make repayment more manageable.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-purple-500 font-bold">•</span>
                <span><strong>Pre-Admission Sanction:</strong> Get your loan sanctioned even before your admission is confirmed, giving you a financial advantage.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Features and Benefits</h2>
          <p className="text-lg text-gray-600">Our education loans come with a range of features designed to support students and their families.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon === 'indian-rupee' ? 'M9 8h6m-5 4h4m-7 6h.01M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : feature.icon === 'trending-down' ? 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' : feature.icon === 'clock' ? 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' : feature.icon === 'pause' ? 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z' : feature.icon === 'users' ? 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' : feature.icon === 'receipt' ? 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' : feature.icon === 'globe' ? 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Eligibility CTA Section */}
      <section className="py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-12 text-white text-center shadow-xl">
          <svg className="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="text-3xl font-bold mb-4">Education Loan Eligibility and Documents</h2>
          <p className="text-lg mb-8">Read on to know the criteria required to apply for our Education Loan.</p>
          <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition">Apply</button>
        </div>
      </section>

      {/* Eligibility Section */}
      <section id="eligibility-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Eligibility Criteria</h2>
          <p className="text-lg text-gray-600 mb-12">Lenders consider several factors to determine eligibility for an education loan:</p>
          <div className="grid md:grid-cols-1 gap-6 max-w-4xl mx-auto">
            {eligibilityCriteria.map((criteria) => (
              <div key={criteria.text} className={`p-6 rounded-lg border ${criteria.highlight ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start space-x-4">
                  <svg className={`w-8 h-8 mt-1 ${criteria.highlight ? 'text-purple-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={criteria.icon === 'user-check' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' : criteria.icon === 'book-open' ? 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' : criteria.icon === 'file-check' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : criteria.icon === 'award' ? 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' : criteria.icon === 'users' ? 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' : criteria.icon === 'star' ? 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' : 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'} /></svg>
                  <p className="text-gray-700">{criteria.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section id="documents-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Required Documents</h2>
          <p className="text-lg text-gray-600 mb-8">You will need to provide various documents for both the student-applicant and the co-borrower/guarantor. This typically includes proof of identity, proof of admission, and income documents.</p>
          <div className="grid md:grid-cols-2 gap-8">
            {documents.map((doc) => (
              <div key={doc.category} className="bg-white p-8 rounded-xl shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={doc.icon === 'user' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' : doc.icon === 'users' ? 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' : doc.icon === 'briefcase' ? 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4' : 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'} /></svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{doc.category}</h3>
                </div>
                <ul className="space-y-2">
                  {doc.items.map((item) => (
                    <li key={item} className="flex items-center space-x-2 text-gray-600">
                      <span className="text-gray-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMI Calculator Section */}
      <section id="emi-calculator-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">EMI Calculator for Education Loan</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto">Our Education Loan EMI (Equated Monthly Installment) calculator helps you estimate your monthly repayment amount to plan your finances effectively.</p>
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount: ₹{loanAmount.toLocaleString()}</label>
                <input type="range" min="50000" max="10000000" step="50000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate: {interestRate}%</label>
                <input type="range" min="8" max="15" step="0.25" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Tenure: {tenure} months</label>
                <input type="range" min="12" max="180" step="6" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full" />
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
            <div className="mt-6 text-left text-sm text-gray-600">
              <p className="font-semibold mb-2">How is Education Loan EMI Calculated?</p>
              <p>The EMI is calculated using the following formula:</p>
              <p className="font-mono bg-white p-2 rounded mt-2">EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]</p>
              <p className="mt-2">P: Principal loan amount, r: Monthly interest rate, n: Loan tenure in months</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fees and Charges Section */}
      <section id="fees-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Fees and Charges</h2>
          <p className="text-lg text-gray-600 mb-12">Fees and charges can vary between lenders. This table provides a general idea of what to expect:</p>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Particulars</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feesAndCharges.map((fee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{fee.particular}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fee.charges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews-section" className="py-20 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          <p className="text-lg text-gray-600 mb-12">See what our customers have to say!</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {reviews.map((review, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <p className="text-sm font-semibold text-purple-600">— {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs-section" className="py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl px-6 py-4 text-left"
                >
                  <span className="text-base font-semibold text-gray-900">{faq.question}</span>
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
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

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-purple-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to secure your future?</h2>
          <p className="text-xl mb-8">Invest in quality education without the financial burden.</p>        </div>
      </section>

      {/* Inquiry Modal */}
    </div>
  );
};

export default EducationLoanPage;

