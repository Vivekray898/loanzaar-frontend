'use client'

import React, { useEffect } from 'react'
import SignInModal from '@/components/SignInModal'

export default function SignInPage() {
  // Render the phone+OTP SignInModal (force-open when visiting /signin)
  useEffect(() => {
    // No-op; client-side modal opens based on URL param `?modal=login` or we force-open it
  }, [])

  return (
    <div>
      <SignInModal forceOpen />
    </div>
  )
}