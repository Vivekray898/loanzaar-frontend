'use client'

import React, { useEffect } from 'react'
import SignInModal from '@/components/SignInModal'

export default function SignUpPage() {
  useEffect(() => {}, [])
  return (
    <div>
      <SignInModal forceOpen />
      <div className="max-w-xl mx-auto p-6 text-center">
        <p className="text-sm text-slate-500">Sign-up with email/password has been retired. Please sign in using your mobile number (OTP).</p>
      </div>
    </div>
  )
}