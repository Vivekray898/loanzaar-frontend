'use client'

import React, { useEffect } from 'react'
import SignInModal from '@/components/SignInModal'

export default function ForgotPasswordPage() {
  // Password reset via email has been removed. Use OTP sign-in.
  useEffect(() => {}, [])
  return (
    <div>
      <SignInModal forceOpen />
      <div className="max-w-xl mx-auto p-6 text-center">
        <p className="text-sm text-slate-500">Password reset via email is no longer supported. Please sign in using your mobile number (OTP).</p>
      </div>
    </div>
  )
}