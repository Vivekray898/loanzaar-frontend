// Utility functions for EMI calculations and formatting

export function calculateEMI(principal, annualRate, tenureMonths) {
  const P = Number(principal) || 0
  const R = (Number(annualRate) || 0) / 12 / 100
  const N = Math.max(1, Math.floor(Number(tenureMonths) || 0))

  if (R === 0) return P / N
  const pow = Math.pow(1 + R, N)
  const emi = (P * R * pow) / (pow - 1)
  return emi
}

export function calculateTotalAmount(emi, tenureMonths) {
  return emi * Math.max(0, Number(tenureMonths) || 0)
}

export function calculateTotalInterest(emi, tenureMonths, principal) {
  return calculateTotalAmount(emi, tenureMonths) - (Number(principal) || 0)
}

export function formatINR(value) {
  try {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
      Math.round(Number(value) || 0)
    )
  } catch {
    // Fallback formatting
    return String(Math.round(Number(value) || 0))
  }
}

export function formatINRCurrency(value) {
  return `₹${formatINR(value)}`
}

export function parseIndianNumber(input) {
  if (typeof input === 'number') return input
  if (!input) return 0
  const cleaned = String(input).replace(/[^0-9.]/g, '')
  return Number(cleaned || 0)
}
