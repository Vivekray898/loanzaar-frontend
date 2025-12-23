'use client'

import dynamic from 'next/dynamic'

const HomeLoanPage = dynamic(() => import('@/pages/HomeLoanPage'), { ssr: false })

export default function HomeLoan() {
  return <HomeLoanPage />
}
