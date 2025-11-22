'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Calculator } from 'lucide-react'
import useSticky from '@/hooks/useSticky'

const EMICalculatorModal = dynamic(() => import('@/components/EMICalculatorModal'), { ssr: false })

export default function StickyCalculator() {
  const [open, setOpen] = useState(false)
  const { isVisible } = useSticky({ triggerAfter: 300, bottomOffset: 160 })

  return (
    <>
      {/* Trigger Button */}
      <button
        aria-label="Open EMI calculator"
        onClick={() => setOpen(true)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 transition-all duration-200 shadow-xl text-white flex items-center gap-2 pr-4 pl-3 py-3 rounded-l-lg z-40
        sm:pr-5 sm:pl-4
        sm:flex
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}
        style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
          boxShadow: '-4px 0 15px rgba(37, 99, 235, 0.3)'
        }}
      >
        <span className="shrink-0"><Calculator size={18} /></span>
        <span className="text-sm font-semibold hidden sm:inline">Calculate EMI</span>
      </button>

      {/* Mobile FAB */}
      <button
        aria-label="Open EMI calculator"
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 right-5 h-14 w-14 rounded-full flex items-center justify-center text-white shadow-xl z-40 sm:hidden transition-all duration-200
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
          boxShadow: '0 10px 20px rgba(37, 99, 235, 0.35)'
        }}
      >
        <Calculator size={22} />
      </button>

      {/* Modal */}
      <EMICalculatorModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
