"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/config/supabase'
import { useSignInModal } from '@/context/SignInModalContext'

export default function AuthCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { open: openSignIn } = useSignInModal()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Supabase v2: Automatically detects code in URL and exchanges for a session
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          // If no session yet, try explicitly exchanging code from URL
          const hash = window.location.hash || ''
          const hasCode = hash.includes('access_token') || hash.includes('code')

          if (hasCode) {
            // Supabase client will handle parsing hash on refresh
            const { error: setSessionError } = await supabase.auth.setSessionFromUrl({
              url: window.location.href
            })
            if (setSessionError) throw setSessionError
          } else {
            throw error
          }
        }

        // Re-check session after potential setSessionFromUrl
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        const session = sessionData?.session
        if (!session) {
          setStatus('No active session found. Redirecting to sign in...')
          setTimeout(() => { try { openSignIn(); } catch(e) { router.replace('/?modal=login'); } }, 1200)
          return
        }

        // Optional: route by role or by presence of profile information
        const isAdmin = session.user?.app_metadata?.role === 'admin'
        const next = searchParams.get('next')

        setStatus('Login successful. Redirecting...')
        if (next) {
          router.replace(next)
        } else if (isAdmin) {
          router.replace('/admin')
        } else {
          router.replace('/account')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('Authentication failed. Redirecting to sign in...')
        setTimeout(() => { try { openSignIn(); } catch(e) { router.replace('/?modal=login'); } }, 1500)
      }
    }

    processCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium">{status}</p>
        <p className="text-sm text-slate-600 mt-2">You can close this tab if it doesn’t redirect.</p>
      </div>
    </div>
  )
}
