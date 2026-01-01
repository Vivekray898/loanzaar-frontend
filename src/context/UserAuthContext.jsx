'use client'

import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../config/supabase'
import { useSignInModal } from '@/context/SignInModalContext'

/**
 * Single auth provider that exposes:
 * - user (minimal object or null)
 * - role: 'guest' | 'user' | 'admin'
 * - loading
 * - isAuthenticated
 * - login / logout helpers
 */
export const UserAuthContext = createContext(null)

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext)
  if (!ctx) {
    // If called outside of UserAuthProvider, return a safe fallback to avoid runtime crashes.
    // This mirrors prior behavior (treat as unauthenticated) and logs a warning for visibility.
    console.warn('useUserAuth called outside UserAuthProvider. Returning fallback unauthenticated context.');
    return {
      user: null,
      role: 'guest',
      loading: false,
      isAuthenticated: false,
      login: async () => {},
      logout: async () => {},
    }
  }
  return ctx
}

export const UserAuthProvider = ({ children }) => {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [role, setRole] = useState('guest') // 'guest' | 'user' | 'admin'
  const [loading, setLoading] = useState(true)

  // Guard against duplicate profile queries per login
  const lastCheckedUid = useRef(null)
  const subscriptionRef = useRef(null)
  let mounted = true

  useEffect(() => {
    mounted = true
    setLoading(true)

    const setProfileFromLeadId = async (leadId) => {
      if (!leadId) return // guard against accidental calls
      try {
        // Use server endpoint to avoid client anon requests hitting RLS / unauthorized errors
        const res = await fetch(`/api/auth/profile/${encodeURIComponent(leadId)}`, { method: 'GET' })
        const json = await res.json()
        if (!res.ok || !json?.success) {
          console.error('Failed to fetch profile for lead id', leadId, json?.error || json)
          setUser(null)
          setRole('guest')
          setLoading(false)
          return
        }

        const data = json.data
        setUser({ uid: data.id, email: data.email, displayName: data.full_name, photoURL: data.photo_url })
        setRole(data.role || 'user')
        setLoading(false)
      } catch (err) {
        console.error('Unexpected error fetching profile for lead id', err)
        setUser(null)
        setRole('guest')
        setLoading(false)
      }
    }

    const handleAuthChange = async (event, session) => {
      if (!mounted) return

      const supaUser = session?.user ?? null

      if (!supaUser) {
        // No Supabase session — check for local lead login
        lastCheckedUid.current = null
        const leadId = (typeof window !== 'undefined') ? localStorage.getItem('lead_user_id') : null
        if (leadId) {
          await setProfileFromLeadId(leadId)
          setLoading(false)
          return
        }

        setUser(null)
        setRole('guest')
        setLoading(false)
        return
      }

      // If we've already handled this uid, skip redundant profile query
      if (lastCheckedUid.current === supaUser.id) {
        setUser(prev => prev ?? { uid: supaUser.id, email: supaUser.email })
        setLoading(false)
        return
      }

      lastCheckedUid.current = supaUser.id

      // Minimal user object
      setUser({
        uid: supaUser.id,
        email: supaUser.email,
        displayName: supaUser.user_metadata?.full_name ?? null,
        photoURL: supaUser.user_metadata?.avatar_url ?? null
      })

      // Query profile once to determine role and create if missing
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${supaUser.id},phone.eq.${supaUser.id}`)
          .single()

        console.debug('UserAuthProvider: profile fetch', { uid: supaUser.id, data, error })

        // If profile missing, create a minimal profile using available metadata
        if (error && error.code === 'PGRST116') {
          const newProfile = {
            // NOTE: No longer setting `user_id` here. We'll rely on `phone` or let this be a minimal profile record.
            full_name: supaUser.user_metadata?.full_name || (supaUser.email ? supaUser.email.split('@')[0] : null),
            email: supaUser.email || null,
            phone: supaUser.user_metadata?.phone || null,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          try {
            const { data: created, error: createErr } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .single()

            if (createErr) {
              console.error('UserAuthProvider: failed to create profile', createErr)
              setRole('user')
            } else {
              setRole(created.role || 'user')
              setUser(prev => ({ ...prev, full_name: created.full_name, phone: created.phone }))
            }
          } catch (createEx) {
            console.error('UserAuthProvider: profile creation exception', createEx)
            setRole('user')
          }
        } else if (error && error.code !== 'PGRST116') {
          throw error
        } else if (data) {
          setRole(data.role === 'admin' ? 'admin' : 'user')
          setUser(prev => ({ ...prev, full_name: data.full_name ?? prev?.displayName ?? null, phone: data.phone ?? null }))
        } else {
          // Fallback
          console.warn('UserAuthProvider: profile lookup returned no data for uid', supaUser.id)
          setRole('user')
        }
      } catch (e) {
        // Default to 'user' on error
        setRole('user')
        console.error('UserAuthProvider: role/profile lookup failed', e)
      } finally {
        setLoading(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)
    subscriptionRef.current = subscription

    // Initialize immediately
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        handleAuthChange('init', data.session)

        // Also check for local lead login on startup
        if (!data.session) {
          const leadId = (typeof window !== 'undefined') ? localStorage.getItem('lead_user_id') : null
          if (leadId) {
            await setProfileFromLeadId(leadId)
          }
        }
      } catch (e) {
        setLoading(false)
        console.error('UserAuthProvider: getSession failed', e)
      }
    })()

    // Listen for lead-login events (dispatched after OTP flows)
    const leadHandler = async (e) => {
      const leadId = e?.detail?.userId || (typeof window !== 'undefined' ? localStorage.getItem('lead_user_id') : null)
      if (leadId) {
        await setProfileFromLeadId(leadId)
      }
    }
    if (typeof window !== 'undefined') window.addEventListener('lead-login', leadHandler)

    return () => {
      mounted = false
      if (subscriptionRef.current?.unsubscribe) subscriptionRef.current.unsubscribe()
      if (typeof window !== 'undefined') window.removeEventListener('lead-login', leadHandler)
    }
  }, [])

  const login = async (credentials) => {
    // Email/password login has been retired. Open the centralized SignIn modal to prompt OTP sign-in.
    try { openSignIn(); } catch (e) { /* ignore - best effort */ }
    return { success: false, error: new Error('Email/password login retired. Please use phone OTP.') }
  }

  const { open: openSignIn } = useSignInModal();

  const logout = async () => {
    lastCheckedUid.current = null
    setUser(null)
    setRole('guest')
    try {
      // Clear local lead id as well
      try { localStorage.removeItem('lead_user_id') } catch (e) { /* ignore */ }
      await supabase.auth.signOut()
      // Clear middleware cookie
      try {
        document.cookie = 'userToken=; Path=/; Max-Age=0; Secure; SameSite=None';
      } catch (e) {
        console.warn('UserAuthProvider: could not clear userToken cookie', e)
      }
      // Open centralized Sign In modal instead of redirect
      try { openSignIn(); } catch (e) { router.push('/?modal=login'); }
    } catch (e) {
      console.error('UserAuthProvider: signOut failed', e)
    }
  }

  const value = {
    user,
    role, // 'guest' | 'user' | 'admin'
    loading,
    isAuthenticated: !!user,
    login,
    logout
  }

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  )
}

