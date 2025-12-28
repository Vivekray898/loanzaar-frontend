'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Pencil, Home, Briefcase, User, Info, CheckCircle2, TrendingUp, Calculator, CalendarClock } from 'lucide-react'
import useEMICalculator from '@/hooks/useEMICalculator'
import EMIDonutChart from '@/components/EMIDonutChart'
import StructuredData from '@/components/StructuredData'
import { formatINR, formatINRCurrency } from '@/utils/emiCalculations'
import { generateCalculatorSchema, generateWebPageSchema } from '@/utils/schema'

export default function Client() {
  const { formValues, setters, results } = useEMICalculator()
  const { tab, principal, rate, tenure, tenureUnit } = formValues
  const { setTab, setPrincipal, setRate, setTenure, setTenureUnit } = setters

  // Max tenure by product type (India, typical lender limits)
  // Sources (retrieved Oct 31, 2025):
  // Sources (retrieved Oct 31, 2025):
  // - Home loan up to 30 years: https://www.bankbazaar.com/home-loan.html
  // - Personal loan up to 7 years: https://www.bankbazaar.com/personal-loan.html
  // - Business loan typically up to 5 years (unsecured): https://www.bankbazaar.com/business-loan.html
  const tenureLimits = {
    home: { years: 30, months: 360 },
    personal: { years: 7, months: 84 },
    business: { years: 5, months: 60 },
  }
  const currentMax = tenureLimits[tab] || tenureLimits.home
  const maxForUnit = tenureUnit === 'years' ? currentMax.years : currentMax.months

  const handleChangeTab = (nextTab) => {
    const limits = tenureLimits[nextTab]
    const nextMax = tenureUnit === 'years' ? limits.years : limits.months
    if (tenure > nextMax) setTenure(nextMax)
    setTab(nextTab)
  }

  const handleChangeUnit = (unit) => {
    if (unit === tenureUnit) return
    const toYears = unit === 'years'
    const converted = toYears ? Math.max(1, Math.round(tenure / 12)) : Math.max(1, Math.round(tenure * 12))
    const limits = tenureLimits[tab]
    const maxVal = toYears ? limits.years : limits.months
    const clamped = Math.min(converted, maxVal)
    setTenureUnit(unit)
    setTenure(clamped)
  }

  const breakdown = useMemo(() => ([
    { label: 'Monthly EMI', value: results.emi, color: 'text-rose-500' },
    { label: 'Principal Amount', value: principal, color: 'text-emerald-500' },
    { label: 'Total Interest', value: results.interest, color: 'text-blue-400' },
  ]), [results, principal])

  // Generate page-specific schemas
  const pageSchemas = [
    generateCalculatorSchema(),
    // Build breadcrumbs as any to satisfy TS inference from JS helper
    generateWebPageSchema({
      title: 'EMI Calculator - Calculate Loan EMI for Home, Personal & Business Loans',
      description: 'Free online EMI calculator to calculate monthly installments for home loans, personal loans, and business loans. Get instant results with our easy-to-use calculator.',
      url: 'https://www.loanzaar.com/emi-calculator',
      breadcrumbs: ([
        { name: 'Home', url: 'https://www.loanzaar.com' },
        { name: 'EMI Calculator', url: 'https://www.loanzaar.com/emi-calculator' }
      ] as unknown) as any
    })
  ]

  const tabs = [
    { id: 'home', label: 'Home Loan', icon: Home },
    { id: 'personal', label: 'Personal Loan', icon: User },
    { id: 'business', label: 'Business Loan', icon: Briefcase },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <StructuredData schema={pageSchemas} />

      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-rose-600 transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-rose-600 font-medium" aria-current="page">EMI Calculator</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">EMI Calculator</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Plan your finances with precision. Calculate EMIs for Home, Personal, or Business loans instantly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Tab Switcher */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex overflow-x-auto shadow-sm no-scrollbar">
              {tabs.map((t) => {
                const Icon = t.icon
                const isActive = tab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => handleChangeTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 whitespace-nowrap ${
                      isActive 
                        ? 'bg-rose-500 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    {t.label}
                  </button>
                )
              })}
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-8">
              
              {/* Loan Amount Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 font-semibold">Loan Amount</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold">₹</span>
                    <input
                      inputMode="numeric"
                      className="w-36 sm:w-44 text-right pr-3 pl-8 py-2 bg-rose-50/50 border border-rose-100 rounded-lg text-rose-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      value={formatINR(principal)}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '')
                        setPrincipal(Number(val || 0))
                      }}
                    />
                  </div>
                </div>
                <input 
                  type="range" 
                  min={10000} 
                  max={10000000} 
                  step={1000} 
                  value={principal} 
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-600 transition-all"
                />
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>₹10K</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              {/* Interest Rate Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 font-semibold">Interest Rate (% p.a)</label>
                  <div className="relative group">
                    <input
                      inputMode="decimal"
                      className="w-24 text-right pr-8 py-2 bg-rose-50/50 border border-rose-100 rounded-lg text-rose-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      value={rate}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '')
                        setRate(Number(val || 0))
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold">%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={30} 
                  step={0.1} 
                  value={rate} 
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-600 transition-all"
                />
                 <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>1%</span>
                  <span>30%</span>
                </div>
              </div>

              {/* Tenure Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 font-semibold">Loan Tenure</label>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      <button 
                        onClick={() => handleChangeUnit('years')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${tenureUnit === 'years' ? 'bg-white shadow text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Yr
                      </button>
                      <button 
                        onClick={() => handleChangeUnit('months')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${tenureUnit === 'months' ? 'bg-white shadow text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Mo
                      </button>
                    </div>
                    <input
                      inputMode="numeric"
                      className="w-20 text-right pr-3 py-2 bg-rose-50/50 border border-rose-100 rounded-lg text-rose-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      value={tenure}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '')
                        setTenure(Number(val || 1))
                      }}
                    />
                  </div>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={maxForUnit} 
                  step={1} 
                  value={tenure} 
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-600 transition-all"
                />
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>1 {tenureUnit === 'years' ? 'Yr' : 'Mo'}</span>
                  <span>{maxForUnit} {tenureUnit === 'years' ? 'Yrs' : 'Mos'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Results & Chart */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl ring-1 ring-slate-900/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-slate-400 font-medium">Monthly Payment</h3>
                <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full font-medium tracking-wide">ESTIMATED EMI</span>
              </div>
              
              <div className="mb-10">
                <div className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
                  {formatINRCurrency(results.emi)}
                </div>
                <p className="text-slate-400 text-sm">per month</p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-8 mb-8">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0">
                  <EMIDonutChart principal={principal} interest={results.interest} size={224} />
                  {/* Legend Overlay on Chart Center (Optional visual flair) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Breakdown</span>
                  </div>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      <span className="text-slate-300 text-sm">Principal</span>
                    </div>
                    <span className="font-semibold">{formatINRCurrency(principal)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                      <span className="text-slate-300 text-sm">Interest</span>
                    </div>
                    <span className="font-semibold">{formatINRCurrency(results.interest)}</span>
                  </div>
                  <div className="border-t border-white/10 my-2"></div>
                  <div className="flex justify-between items-center px-3">
                    <span className="text-slate-400 text-sm font-medium">Total Amount</span>
                    <span className="text-xl font-bold">{formatINRCurrency(results.total)}</span>
                  </div>
                </div>
              </div>

              <Link 
                href="/apply-loan" 
                className="w-full block text-center bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-rose-500/25 active:scale-[0.98]"
              >
                Apply for Loan Now
              </Link>
            </div>
          </div>

        </div>

        {/* EDUCATIONAL CONTENT */}
        <div className="mt-16 lg:mt-24 border-t border-slate-200 pt-12 lg:pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Content Left */}
            <div className="md:col-span-8 space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                    <Calculator size={24} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">What is a Loan EMI?</h2>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                  <p>
                    EMI stands for <strong>Equated Monthly Installment</strong>. It is the fixed amount you pay back to the bank each month until your loan is fully repaid. Think of it as a subscription fee for borrowed money, combined with a portion of the repayment.
                  </p>
                  <p>
                    Every EMI consists of two parts:
                  </p>
                  <ul className="list-none pl-0 space-y-3 mt-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-emerald-500 mt-1 shrink-0" />
                      <span><strong>Principal Repayment:</strong> A portion of the actual money you borrowed.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-blue-500 mt-1 shrink-0" />
                      <span><strong>Interest Component:</strong> The cost charged by the bank for lending you the money.</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">Factors That Impact Your EMI</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: 'Loan Amount', desc: 'Higher loan amount = Higher EMI', icon: TrendingUp, color: 'text-rose-500 bg-rose-50' },
                    { title: 'Interest Rate', desc: 'Higher rate = Higher EMI', icon: Info, color: 'text-blue-500 bg-blue-50' },
                    { title: 'Loan Tenure', desc: 'Longer tenure = Lower EMI (but higher total interest)', icon: CalendarClock, color: 'text-emerald-500 bg-emerald-50' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                        <item.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                 <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">How to use Loanzaar Calculator</h3>
                 <div className="bg-slate-50 rounded-2xl p-6 sm:p-8">
                    <ol className="relative border-l border-slate-200 ml-3 space-y-8">
                      <li className="pl-8 relative">
                        <span className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white border-2 border-rose-500 flex items-center justify-center font-bold text-rose-600 text-sm">1</span>
                        <h4 className="font-bold text-slate-900 text-lg">Enter Amount</h4>
                        <p className="text-slate-600 mt-1">Input the total amount you wish to borrow.</p>
                      </li>
                      <li className="pl-8 relative">
                        <span className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white border-2 border-rose-500 flex items-center justify-center font-bold text-rose-600 text-sm">2</span>
                        <h4 className="font-bold text-slate-900 text-lg">Set Interest Rate</h4>
                        <p className="text-slate-600 mt-1">Adjust the slider to the interest rate offered by your bank.</p>
                      </li>
                      <li className="pl-8 relative">
                         <span className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white border-2 border-rose-500 flex items-center justify-center font-bold text-rose-600 text-sm">3</span>
                        <h4 className="font-bold text-slate-900 text-lg">Choose Tenure</h4>
                        <p className="text-slate-600 mt-1">Select how many years or months you need to repay.</p>
                      </li>
                    </ol>
                 </div>
              </section>
            </div>

            {/* Sidebar Right (Sticky Info) */}
            <div className="md:col-span-4 space-y-8">
              <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
                <h3 className="font-bold text-rose-900 mb-3">Formula Used</h3>
                <div className="font-mono text-sm bg-white p-3 rounded-lg border border-rose-200 text-slate-700 mb-3">
                  E = P x R x (1+R)^N / [(1+R)^N-1]
                </div>
                <ul className="text-sm space-y-2 text-rose-800/80">
                  <li><strong>P:</strong> Principal Loan Amount</li>
                  <li><strong>R:</strong> Monthly Interest Rate</li>
                  <li><strong>N:</strong> Tenure in Months</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Why check EMI beforehand?</h3>
                <ul className="space-y-4">
                  {[
                    "Plan your monthly budget effectively",
                    "Compare different loan offers",
                    "Choose the right tenure for you",
                    "Avoid financial strain later"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}