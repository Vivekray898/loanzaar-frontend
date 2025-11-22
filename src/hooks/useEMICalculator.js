'use client'

import { useMemo, useState } from 'react'
import { calculateEMI, calculateTotalAmount, calculateTotalInterest } from '@/utils/emiCalculations'

export default function useEMICalculator() {
  const [tab, setTab] = useState('home') // home | personal | business
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(6)
  const [tenureUnit, setTenureUnit] = useState('months') // months | years
  const [tenure, setTenure] = useState(5)

  const tenureInMonths = useMemo(() => tenureUnit === 'years' ? tenure * 12 : tenure, [tenure, tenureUnit])

  const emi = useMemo(() => calculateEMI(principal, rate, tenureInMonths), [principal, rate, tenureInMonths])
  const total = useMemo(() => calculateTotalAmount(emi, tenureInMonths), [emi, tenureInMonths])
  const interest = useMemo(() => calculateTotalInterest(emi, tenureInMonths, principal), [emi, tenureInMonths, principal])

  const results = useMemo(() => ({ emi, total, interest }), [emi, total, interest])

  const formValues = { tab, principal, rate, tenure, tenureUnit }
  const setters = { setTab, setPrincipal, setRate, setTenure, setTenureUnit }

  return { formValues, setters, results, tenureInMonths }
}
