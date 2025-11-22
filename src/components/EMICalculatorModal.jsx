'use client'

import { useEffect, useRef } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import useEMICalculator from '@/hooks/useEMICalculator'
import { formatINR, formatINRCurrency } from '@/utils/emiCalculations'

export default function EMICalculatorModal({ open, onClose }) {
  const amountRef = useRef(null)
  const { formValues, setters, results, tenureInMonths } = useEMICalculator()
  const { tab, principal, rate, tenure, tenureUnit } = formValues
  const { setTab, setPrincipal, setRate, setTenure, setTenureUnit } = setters

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    // autofocus
    setTimeout(() => amountRef.current?.focus(), 50)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const LoanLabel = tab === 'home' ? 'Home Loan' : tab === 'personal' ? 'Personal Loan' : 'Business Loan'

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

  const overlay = (
    <div
      aria-hidden
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
    />
  )

  return (
    <div role="dialog" aria-label="EMI Calculator Dialog" aria-modal="true">
      {overlay}
  <div className="fixed right-0 top-0 h-screen w-full sm:w-[450px] max-w-full bg-white shadow-2xl z-50 animate-slideInFromRight overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b bg-white">
          <button onClick={onClose} aria-label="Close calculator" className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
            <ChevronLeft size={22} />
            <span className="font-semibold">EMI Calculator</span>
          </button>
          <button onClick={onClose} aria-label="Close calculator" className="text-slate-500 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-5 px-6 py-4 border-b">
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'personal', label: 'Personal', icon: '💰' },
            { id: 'business', label: 'Business', icon: '🏢' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleChangeTab(t.id)}
              className={`pb-2 text-sm transition-colors ${tab === t.id ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'text-slate-500 border-b-2 border-transparent hover:text-slate-700'}`}
            >
              <span className="mr-2">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="px-6 py-6 space-y-6">
          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Loan Amount</label>
            <div className="relative bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500 text-base">₹</span>
                <input
                  ref={amountRef}
                  inputMode="numeric"
                  className="w-full bg-transparent outline-none border-none text-right text-lg font-semibold text-slate-800"
                  value={formatINR(principal)}
                  aria-label="Loan amount"
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    setPrincipal(Number(val || 0))
                  }}
                />
              </div>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Interest Rate</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={30}
                step={0.1}
                value={rate}
                aria-label="Adjust interest rate"
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="w-24 text-right text-lg font-semibold text-slate-800">{rate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Loan Tenure */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-600">Loan Tenure</label>
              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => handleChangeUnit('years')}
                  className={`px-2 py-1 rounded ${tenureUnit === 'years' ? 'text-slate-800' : 'text-slate-500'}`}
                >Year</button>
                <button
                  onClick={() => handleChangeUnit('months')}
                  className={`px-2 py-1 rounded ${tenureUnit === 'months' ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}
                >Months</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={maxForUnit}
                step={1}
                value={tenure}
                aria-label="Adjust loan tenure"
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="w-24 text-right text-lg font-semibold text-slate-800">
                {tenureUnit === 'years' ? `${tenure} Y` : `${tenure} M`}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="px-6 py-5 bg-slate-50 border-t">
          <div className="space-y-3">
            <ResultRow label="Monthly Emi" color="bg-blue-300" value={formatINRCurrency(results.emi)} />
            <ResultRow label="Principal Amount" color="bg-rose-500" value={formatINRCurrency(principal)} />
            <ResultRow label="Interest Payable" color="bg-blue-500" value={formatINRCurrency(results.interest)} />
          </div>
          <div className="mt-4 pt-4 border-t-2 border-slate-300 flex items-center justify-between">
            <div className="text-slate-600 font-medium">Total Amount payable</div>
            <div className="text-lg font-bold text-slate-900">{formatINRCurrency(results.total)}</div>
          </div>
        </div>

        {/* Actions */}
        <div
          className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-2"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <a
            href="/emi-calculator"
            className="w-full sm:flex-1 py-2.5 rounded-md text-white font-semibold shadow-sm transition-transform active:translate-y-px text-[15px] text-center"
            style={{ background: 'linear-gradient(135deg, #F9A8D4 0%, #F472B6 100%)' }}
            onClick={onClose}
          >
            Explore More
          </a>
          <a
            href={tab === 'home' ? '/home-loan' : tab === 'personal' ? '/personal-loan' : '/business-loan'}
            className="w-full sm:flex-1 py-2.5 rounded-md text-blue-600 font-semibold border border-blue-600 text-center hover:bg-blue-50 transition-colors text-[15px]"
            onClick={onClose}
          >
            {`Explore ${LoanLabel}`}
          </a>
        </div>
      </div>
    </div>
  )
}

function ResultRow({ label, color, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-200 last:border-b-0">
      <div className="flex items-center gap-2 text-slate-700">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
        <span>{label}</span>
      </div>
      <div className="font-semibold text-slate-900">{value}</div>
    </div>
  )
}
