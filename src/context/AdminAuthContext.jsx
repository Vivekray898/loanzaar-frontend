'use client'

import { supabase } from '../config/supabase'

// Admin helpers (no React hook compatibility export)
export async function adminLogin(email, password) {
  // Email/password admin login retired. Open SignIn modal to prompt OTP-based sign-in instead.
  try { const { open } = require('@/context/SignInModalContext').useSignInModal(); if(open) open(); } catch (e) { /* best effort */ }
  return { success: false, error: new Error('Admin email/password login retired. Use phone OTP.') }
}

export async function adminSignup(email, password, fullName, phone, role = 'admin') {
  // Create an admin profile record without using Supabase email/password signup.
  // Admins can then authenticate via the phone OTP flow.
  const profile = {
    full_name: fullName,
    email,
    phone,
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  const { error: insertErr } = await supabase.from('profiles').insert([profile])
  if (insertErr) return { success: false, error: insertErr }
  return { success: true }
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
    const { error } = await supabase.from('profiles').update(updatedData).or(`id.eq.${userId},phone.eq.${userId}`)
    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
