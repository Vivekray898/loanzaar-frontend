import React from 'react'
import ApplyHubClient from './ApplyHubClient';

export const metadata = {
  title: "Apply Online for Loans & Insurance | Instant Approval | Loanzaar",
  description: "Apply for Personal Loan, Home Loan, Business Loan, and Insurance online. Compare interest rates, check eligibility, and get instant approval with Loanzaar."
}

export default function ApplyHubPage() {
  return (
    <React.Suspense fallback={<div />}>
      <ApplyHubClient />
    </React.Suspense>
  )
}