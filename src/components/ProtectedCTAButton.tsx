'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getAuthGateForCTA } from '@/utils/authGate'
import { openProtectedFlow } from '@/utils/openProtectedFlow'

type Props = {
  label: string
  onContinue: () => void
  className?: string
  // Optional children so pages can render custom text while keeping the gate label stable
  children?: React.ReactNode
}

export default function ProtectedCTAButton({ label, onContinue, className, children }: Props) {
  const pathname = usePathname() || ''
  const { isAuthenticated, loading, checkSession } = useAuth()

  const gate = getAuthGateForCTA(label, pathname)

  const fallbackIntentMap: Record<string, string> = {
    'Apply Now': 'apply_now',
    'Check Score Now': 'credit_score',
    'Find My Card': 'find_card'
  }

  const handleClick = async () => {
    try {
      // If AuthContext is still loading, attempt to restore session first
      if (loading) {
        const restored = await checkSession()
        if (restored) {
          onContinue()
          return
        }
      }

      // Allow continue only when the user is authenticated
      if (isAuthenticated) {
        onContinue()
        return
      }

      // If not authenticated, open protected flow with explicit intent (from gate or fallback mapping)
      const action = gate?.intent ?? fallbackIntentMap[label] ?? 'auth'
      openProtectedFlow({ action, nextRoute: gate?.nextRoute })
    } catch (err) {
      // Fallback: open protected flow if check fails
      const action = gate?.intent ?? fallbackIntentMap[label] ?? 'auth'
      openProtectedFlow({ action, nextRoute: gate?.nextRoute })
    }
  }

  return (
    <button onClick={handleClick} className={className}>
      {children ?? label}
    </button>
  )
}
