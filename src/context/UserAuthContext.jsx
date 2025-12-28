'use client'

import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../config/supabase'

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
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider')
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

    const handleAuthChange = async (event, session) => {
      if (!mounted) return

      const supaUser = session?.user ?? null

      if (!supaUser) {
        // Guest state
        lastCheckedUid.current = null
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

      // Query profile once to determine role
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', supaUser.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        const resolved = data?.role === 'admin' ? 'admin' : 'user'
        setRole(resolved)
      } catch (e) {
        // Default to 'user' on error
        setRole('user')
        console.error('UserAuthProvider: role lookup failed', e)
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
      } catch (e) {
        setLoading(false)
        console.error('UserAuthProvider: getSession failed', e)
      }
    })()

    return () => {
      mounted = false
      if (subscriptionRef.current?.unsubscribe) subscriptionRef.current.unsubscribe()
    }
  }, [])

  const login = async (credentials) => {
    // credentials: { email, password } or other supabase signin payload
    return supabase.auth.signInWithPassword(credentials)
  }

  const logout = async () => {
    lastCheckedUid.current = null
    setUser(null)
    setRole('guest')
    try {
      await supabase.auth.signOut()
      router.push('/signin')
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

