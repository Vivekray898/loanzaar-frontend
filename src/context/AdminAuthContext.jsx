'use client'

import { supabase } from '../config/supabase'

// Admin helpers (no React hook compatibility export)
export async function adminLogin(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function adminSignup(email, password, fullName, phone, role = 'admin') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })
  if (error) return { success: false, error }

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

export async function adminLogout() {
  await supabase.auth.signOut()
}

export async function getAdminToken() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  } catch (e) {
    return null
  }
}

export async function updateAdminProfile(userId, newAdminData) {
  if (!userId) return { success: false, error: 'No user id' }
  try {
    const updatedData = { ...newAdminData, updated_at: new Date().toISOString() }
    const { error } = await supabase.from('profiles').update(updatedData).eq('user_id', userId)
    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
