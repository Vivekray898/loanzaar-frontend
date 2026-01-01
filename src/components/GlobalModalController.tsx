'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SignInModal from '@/components/SignInModal'

export default function GlobalModalController() {
  const searchParams = useSearchParams()
  const modal = searchParams?.get('modal')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (modal === 'login') setOpen(true)
    else setOpen(false)
  }, [modal])

  if (!open) return null

  return (
    <SignInModal
      forceOpen
      onForceClose={() => {
        try {
          const url = new URL(window.location.href)
          url.searchParams.delete('modal')
          url.searchParams.delete('intent')
          url.searchParams.delete('next_route')
          window.history.replaceState({}, '', url.pathname + url.search)
        } catch (e) {
          // fall back quietly
        }
      }}
    />
  )
}
