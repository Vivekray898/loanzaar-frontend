'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Pencil } from 'lucide-react'
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
  // - Home loan up to 30 years: https://www.bankbazaar.com/home-loan.html
  // - Personal loan up to 7 years: https://www.bankbazaar.com/personal-loan.html (mentions up to 7 years)
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
    { label: 'Monthly Emi', value: results.emi, color: 'text-slate-800' },
    { label: 'Principal Amount', value: principal, color: 'text-slate-800' },
    { label: 'Interest Payable', value: results.interest, color: 'text-slate-800' },
  ]), [results, principal])

  // Generate page-specific schemas
  const pageSchemas = [
    generateCalculatorSchema(),
    generateWebPageSchema({
      title: 'EMI Calculator - Calculate Loan EMI for Home, Personal & Business Loans',
      description: 'Free online EMI calculator to calculate monthly installments for home loans, personal loans, and business loans. Get instant results with our easy-to-use calculator.',
      url: 'https://www.loanzaar.com/emi-calculator',
      breadcrumbs: [
        { name: 'Home', url: 'https://www.loanzaar.com' },
        { name: 'EMI Calculator', url: 'https://www.loanzaar.com/emi-calculator' }
      ]
    })
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Page-specific schema */}
      <StructuredData schema={pageSchemas} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="text-slate-800 hover:underline">Home</Link>
        <span className="text-slate-400">›</span>
        <span className="text-rose-600 font-medium" aria-current="page">EMI Calculator</span>
      </nav>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-8">EMI Calculator</h1>

      {/* Calculator Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-10 lg:mb-12">
        {/* Left Panel */}
        <div>
          {/* Tabs */}
          <div className="flex gap-6 lg:gap-[30px] border-b border-slate-200 mb-8 lg:mb-10">
            {[
              { id: 'home', label: 'Home', icon: '🏠' },
              { id: 'personal', label: 'Personal', icon: '💰' },
              { id: 'business', label: 'Business', icon: '🏢' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => handleChangeTab(t.id)}
                className={`pb-3 text-base transition-colors ${tab === t.id ? 'text-rose-600 font-semibold border-b-2 border-rose-500' : 'text-slate-500 border-b-2 border-transparent hover:text-slate-700'}`}
              >
                <span className="mr-2">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          <div className="space-y-6 lg:space-y-8">
            {/* Loan Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">Loan Amount</label>
              <div className="flex items-center justify-end gap-3 mb-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700">
                  <span className="font-semibold text-base">₹</span>
                  <input
                    inputMode="numeric"
                    className="w-28 bg-transparent outline-none border-none text-right font-semibold text-rose-700 text-base"
                    value={formatINR(principal)}
                    aria-label="Loan amount"
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setPrincipal(Number(val || 0))
                    }}
                  />
                  <Pencil size={18} className="text-rose-400" />
                </div>
              </div>
              <input type="range" min={10000} max={10000000} step={1000} value={principal} onChange={(e)=>setPrincipal(Number(e.target.value))} className="w-full h-1.5 accent-rose-500" style={{accentColor: '#ef4444'}} />
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">Interest Rate</label>
              <div className="flex items-center justify-end gap-3 mb-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700">
                  <span className="font-semibold text-base">%</span>
                  <input
                    inputMode="decimal"
                    className="w-16 bg-transparent outline-none border-none text-right font-semibold text-rose-700 text-base"
                    value={rate.toFixed(1)}
                    aria-label="Interest rate"
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '')
                      setRate(Number(val || 0))
                    }}
                  />
                  <Pencil size={18} className="text-rose-400" />
                </div>
              </div>
              <input type="range" min={1} max={30} step={0.1} value={rate} onChange={(e)=>setRate(Number(e.target.value))} className="w-full h-1.5 accent-rose-500" style={{accentColor: '#ef4444'}} />
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">Loan Tenure</label>
              <div className="flex items-center justify-end gap-3 mb-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700">
                  <button onClick={()=>handleChangeUnit(tenureUnit==='years'?'months':'years')} className="font-semibold text-rose-600 text-base" aria-label="Toggle tenure unit">{tenureUnit==='years'?'Y':'M'}</button>
                  <input
                    inputMode="numeric"
                    className="w-12 bg-transparent outline-none border-none text-right font-semibold text-rose-700 text-base"
                    value={tenure}
                    aria-label="Loan tenure"
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setTenure(Number(val || 1))
                    }}
                  />
                  <Pencil size={18} className="text-rose-400" />
                </div>
              </div>
              <input type="range" min={1} max={maxForUnit} step={1} value={tenure} onChange={(e)=>setTenure(Number(e.target.value))} className="w-full h-1.5 accent-rose-500" style={{accentColor: '#ef4444'}} />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="self-start">
          {/* Legend */}
          <div className="flex items-center justify-end gap-6 mb-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm"><span className="inline-block w-3 h-3 rounded-full bg-blue-200" /> Interest Amount</div>
            <div className="flex items-center gap-2 text-slate-500 text-sm"><span className="inline-block w-3 h-3 rounded-full bg-blue-500" /> Principal Amount</div>
          </div>
          <div className="max-w-[420px] mx-auto">
            <EMIDonutChart principal={principal} interest={results.interest} size={360} />
          </div>
          <div className="mt-8 space-y-3">
            {breakdown.map((b) => (
              <div key={b.label} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-b-0">
                <span className="text-slate-500 text-base">{b.label}</span>
                <span className="text-lg font-semibold text-slate-900">{formatINRCurrency(b.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-slate-900 text-white flex items-center justify-between">
            <span className="font-semibold text-base">Total Amount payable</span>
            <span className="text-xl font-bold">{formatINRCurrency(results.total)}</span>
          </div>
          <Link href="/apply-loan" className="mt-6 inline-flex w-full justify-center py-3.5 rounded-lg text-white font-semibold bg-rose-500 hover:bg-rose-600 transition-colors text-base">Apply Now</Link>
        </div>
      </section>

      {/* Extended educational content */}
      <section className="max-w-3xl space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">What's a Loan EMI, Anyway?</h2>
        <p className="text-slate-600 leading-7">Ever wondered what "Loan EMI" actually means? It stands for <strong>Equated Monthly Installment</strong>, which is the fixed amount you pay back to the bank each month after you take out a loan.</p>

        <p className="text-slate-600 leading-7">This monthly payment isn't just a random number; it's a neat package that bundles two things:</p>
        <ul className="list-disc ml-6 text-slate-600 space-y-1">
          <li>A piece of the original amount you borrowed (<strong>the Principal</strong>).</li>
          <li>The <strong>Interest</strong> the bank charges for lending you the money.</li>
        </ul>

        <p className="text-slate-600 leading-7">Staying on top of your EMIs is one of the best things you can do for your financial health. It helps you build a strong CIBIL score (which makes getting future loans easier) and, just as importantly, helps you dodge annoying late fees.</p>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6">How is an EMI Even Calculated?</h3>
        <p className="text-slate-600 leading-7">So, how do banks figure out that exact monthly number? There's a standard math formula they use:</p>
        <div className="text-rose-600 font-semibold bg-rose-50 p-4 rounded">EMI = P x R x (1+R)^N / [(1+R)^N - 1]</div>

        <ul className="list-disc ml-6 text-slate-600 space-y-1">
          <li><strong>P</strong> is the Principal (the total amount you borrowed).</li>
          <li><strong>R</strong> is your monthly interest rate. (This is your annual rate divided by 12. So, 10.5% a year is 0.875% a month — or 0.00875 as a decimal.)</li>
          <li><strong>N</strong> is the number of months you'll be paying (your loan tenure).</li>
        </ul>

        <p className="text-slate-600 leading-7">For example, if you borrow <strong>₹10,00,000</strong> at an annual interest of <strong>10.5%</strong> for <strong>10 years</strong> (which is <strong>120 months</strong>), your EMI would be approximately <strong>₹13,493 per month</strong> (as shown by our calculator).</p>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6">Calculators for Every Kind of Loan</h3>
        <p className="text-slate-600 leading-7">We know that not all loans are the same. You'll have different needs when you're buying a house versus a car. That's why we have simple tools to help you plan for different life goals:</p>
        <ul className="list-disc ml-6 text-slate-600 space-y-1">
          <li><strong>Home Loan EMI Calculator:</strong> Find out what your monthly payment will be on that new home. Just plug in the loan amount, interest rate, and how long you want to pay it for.</li>
          <li><strong>Personal Loan EMI Calculator:</strong> A super simple tool to see what your monthly payments will look like for a personal loan, based on the amount and time you choose.</li>
          <li><strong>Business Loan EMI Calculator:</strong> Designed to help entrepreneurs figure out what they can comfortably afford to borrow and pay back for their business.</li>
        </ul>

        <p className="text-slate-600 leading-7">And it's not just these! With the easy-to-use Loanzaar calculators, you can plan for all kinds of other loans, including Car Loans, Education Loans, Loans Against Property, Gold Loans, and more. It’s all about helping you plan your finances.</p>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6">What Makes Your EMI Go Up or Down?</h3>
        <p className="text-slate-600 leading-7">Your final EMI amount isn't set in stone; it depends on a few key factors:</p>
        <ul className="list-disc ml-6 text-slate-600 space-y-1">
          <li><strong>Loan Amount:</strong> The more you borrow, the higher your EMI will be.</li>
          <li><strong>Interest Rate:</strong> The rate you get will directly impact your payment. A higher rate means a higher EMI.</li>
          <li><strong>Loan Tenure (Time):</strong> You can choose a longer tenure to get a lower monthly EMI, which might feel more manageable. But, with a longer tenure, you'll usually pay more in total interest over the life of the loan.</li>
          <li><strong>Prepayment:</strong> If you make extra payments toward the principal (prepayment), it reduces the principal and can lower future EMIs or shorten the loan tenure, saving interest.</li>
        </ul>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6">How to Use the Loanzaar Loan EMI Calculator</h3>
        <p className="text-slate-600 leading-7">Using our online calculator couldn't be easier. It's just three simple steps:</p>
        <ol className="list-decimal ml-6 text-slate-600 space-y-1">
          <li><strong>Enter Loan Details:</strong> Pop in the total amount you wish to borrow.</li>
          <li><strong>Select the Interest Rate:</strong> Add the interest rate you've been offered (or your best guess).</li>
          <li><strong>Choose Your Loan Tenure:</strong> Decide how many years or months you want to take to repay it.</li>
        </ol>
        <p className="text-slate-600 leading-7">Just click ‘Calculate,’ and you’ll instantly see your monthly EMI. We'll also show you a complete breakdown of how much is principal and how much is interest, so you know exactly where your money is going.</p>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6">Why You'll Find Our EMI Calculator Helpful</h3>
        <ul className="list-disc ml-6 text-slate-600 space-y-1">
          <li><strong>It's Super Easy to Use:</strong> The layout is clean and simple, making it easy to find what you need.</li>
          <li><strong>You Get Accurate Calculations:</strong> We use the standard, proven formula to make sure your numbers are exact.</li>
          <li><strong>It Works for All Kinds of Loans:</strong> We have different calculators tailored for whatever you're planning for.</li>
          <li><strong>You Get Instant Answers:</strong> No waiting, no loading pages. Get your results right away.</li>
        </ul>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6">What are the Benefits of Using It?</h3>
        <p className="text-slate-600 leading-7">Taking a minute to check your EMI before you apply for a loan is a really smart move. It helps you plan your budget, compare loan offers, and avoid surprises.</p>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6">Why Bother Using an EMI Calculator?</h3>
        <p className="text-slate-600 leading-7">Using an EMI calculator before you apply for a loan helps you make an informed decision. It ensures you choose a loan amount that you're truly comfortable with, so you don't have to face money troubles down the road.</p>

        <p className="text-slate-600 leading-7">The Loan EMI calculator on the Loanzaar website is the perfect first step. It helps you compare multiple loans, plan your repayments, and step into your loan journey with confidence.</p>

        <p className="text-slate-600 leading-7">Here at Loanzaar, we offer a wide range of loan products, including Personal Loans, Business Loans, Loans Against Property, Education Loans, and many more. We're here to help you find the best options and deals available for whatever you need. Start by planning your EMI today!</p>
      </section>
    </div>
  )
}
