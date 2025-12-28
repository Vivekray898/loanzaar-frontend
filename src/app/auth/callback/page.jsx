import React, { Suspense } from 'react'
import AuthCallbackClient from './AuthCallbackClient'

export default function Page() {
  return (
    <Suspense fallback={(
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Processing authentication...</p>
        </div>
      </div>
    )}>
      <AuthCallbackClient />
    </Suspense>
  )
}
