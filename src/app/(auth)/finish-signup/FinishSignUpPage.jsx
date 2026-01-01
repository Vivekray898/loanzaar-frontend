'use client'

import React, { useEffect } from 'react'
import SignInModal from '@/components/SignInModal'

export default function FinishSignUpPage() {
  useEffect(() => {}, [])
  return (
    <div>
      <SignInModal forceOpen />
      <div className="max-w-xl mx-auto p-6 text-center">
        <p className="text-sm text-slate-500">Email link sign-in has been retired. Please use mobile number (OTP) to sign in.</p>
      </div>
    </div>
  )
}

