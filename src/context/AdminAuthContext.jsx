'use client'

import { useUserAuth } from './UserAuthContext'
import { supabase } from '../config/supabase'

/**
 * Thin admin helper that consumes the shared UserAuthContext.
 * It does NOT register auth listeners. Role/user are read from UserAuthContext.
 */
export function useAdminAuth() {
  const { user, role } = useUserAuth()

  const isAdmin = role === 'admin'

  const login = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signup = async (email, password, fullName, phone, role = 'admin') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) return { success: false, error }

    // insert profile
    const profile = {
      user_id: data?.user?.id,
      full_name: fullName,
      email,
      phone,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    const { error: insertErr } = await supabase.from('profiles').insert([profile])
    if (insertErr) return { success: false, error: insertErr }
    return { success: true, uid: data.user.id }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const getAdminToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch (e) {
      return null
    }
  }

  const updateAdminProfile = async (newAdminData) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    try {
      const updatedData = { ...newAdminData, updated_at: new Date().toISOString() }
      const { error } = await supabase.from('profiles').update(updatedData).eq('user_id', user.uid)
      if (error) throw error
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  return {
    isAdmin,
    user,
    role,
    login,
    signup,
    logout,
    getAdminToken,
    updateAdminProfile
  }
}
