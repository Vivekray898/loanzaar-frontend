'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useSignInModal } from '@/context/SignInModalContext' 
import { 
  User, Mail, Phone, MapPin, Camera, Save, RefreshCw, 
  ChevronLeft, Loader2, Check, AlertCircle, ShieldCheck, Lock
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'

interface ProfileForm {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  photo_url: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  phone?: string;
}

export default function ProfileClient() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState<ProfileForm>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    photo_url: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [busy, setBusy] = useState<boolean>(false)
  const [statusMsg, setStatusMsg] = useState<string>('')
  const [msgType, setMsgType] = useState<'success' | 'error' | ''>('')

  const { open: openSignIn } = useSignInModal();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      try { openSignIn(); } catch(e) { router.push('/?modal=login'); }
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user?.id) {
      setForm(prev => ({ ...prev, phone: user.phone || '' }))
      fetchProfile(user.id)
    }
  }, [user])

  // Profile cache helpers (cookie-based)
  // Avoid importing client-only code in SSR — require lazily
  const loadFromCache = (uid: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getProfileCache } = require('@/utils/profileCache');
      return getProfileCache(uid);
    } catch (e) {
      return null;
    }
  }

  const isUuid = (val: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);

  const fetchProfile = async (uid: string) => {
    setBusy(true)
    setStatusMsg('')
    try {
      let result: any = null

      // Check cookie cache first
      try {
        const cached = loadFromCache(uid);
        if (cached) {
          result = cached;
        }
      } catch (e) {
        // ignore
      }

      // If not cached, query server
      if (!result) {
        // Prefer server GET by id (if uuid); otherwise try id-by-phone fallback via server
        if (isUuid(uid)) {
          const res = await fetch(`/api/auth/profile/${encodeURIComponent(uid)}`);
          if (res.ok) {
            const json = await res.json();
            if (json?.success && json.profile) result = json.profile;
            else if (res.status === 404) {
              // not found by id, we'll try phone next
            } else {
              console.error('Error fetching profile by id from server:', json?.error || res.statusText);
            }
          } else {
            const json = await res.json().catch(() => ({}));
            if (res.status !== 404) console.error('Profile GET error (id):', json?.error || res.statusText);
          }
        }

        // Fallback: try phone lookup if we didn't get a result
        if (!result) {
          // We support the server GET endpoint using ?id=<phone> as fallback
          const res = await fetch(`/api/auth/profile/?id=${encodeURIComponent(uid)}`);
          if (res.ok) {
            const json = await res.json();
            if (json?.success && json.profile) result = json.profile;
            else console.error('Error fetching profile by phone from server:', json?.error || res.statusText);
          } else {
            const json = await res.json().catch(() => ({}));
            if (res.status !== 404) console.error('Profile GET error (phone):', json?.error || res.statusText);
          }
        }

        // If we obtained result from server, cache it
        if (result) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { setProfileCache } = require('@/utils/profileCache');
            setProfileCache(result);
          } catch (e) {
            // ignore
          }
        }
      }

      if (result) {
        setForm(prev => ({ ...prev, ...result }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.full_name || form.full_name.trim().length < 2) e.full_name = 'Name is too short'
    // Email is editable; validate basic format if present
    if (form.email && !/^[\w-.+]+@[\w-]+\.[\w-.]+$/.test(form.email)) e.email = 'Invalid email address'
    // Phone is read-only on this page; skip client-side format validation to avoid blocking
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // @ts-ignore
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMsg('')
    if (!validate()) return
    if (!user?.id) return

    setBusy(true)
    try {
      // Build payload
      const payload: any = {
        id: undefined,
        full_name: form.full_name || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        photo_url: form.photo_url || null,
      }

      // If current user id looks like a profile id, include it for an id-based upsert
      if (user?.id && /^[0-9a-fA-F-]{36}$/.test(user.id)) {
        payload.id = user.id
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        setStatusMsg('Update failed. Try again.')
        setMsgType('error')
      } else {
        setStatusMsg('Profile updated successfully')
        setMsgType('success')
        if (json.profile) {
          setForm(prev => ({ ...prev, ...json.profile }))
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { setProfileCache } = require('@/utils/profileCache');
            setProfileCache(json.profile);
          } catch (e) {
            // ignore cache set failures
          }
        }
      }
    } catch (err) {
      setStatusMsg('An unexpected error occurred.')
      setMsgType('error')
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-24 md:pb-12 pt-4 md:pt-10">
      
      {/* Mobile Nav Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full">
           <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-800">Edit Profile</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Breadcrumb / Header Desktop */}
        <div className="hidden md:flex items-center gap-3 mb-8 text-sm text-slate-500">
          <button onClick={() => router.push('/account')} className="hover:text-blue-600 transition-colors">Account</button>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">Personal Info</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =========================================================
              LEFT: Profile Card (Sticky)
             ========================================================= */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative group">
              
              {/* Cover Art */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              </div>

              {/* Content */}
              <div className="px-6 pb-8 text-center relative">
                {/* Avatar */}
                <div className="-mt-12 mb-4 relative inline-block">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-slate-50 overflow-hidden flex items-center justify-center text-4xl">
                    {form.photo_url ? (
                      <img src={form.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>😎</span>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full border-2 border-white shadow-sm hover:bg-blue-600 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-slate-900">{form.full_name || 'User Name'}</h2>
                <p className="text-sm text-slate-500 font-medium mb-6">{form.email}</p>

                {/* Account Status Badge */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Verified Account</p>
                    <p className="text-[10px] text-emerald-600 leading-tight">Your basic profile is active.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT: Form Fields
             ========================================================= */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              
              <div className="p-6 md:p-8 space-y-8">
                
                {/* Header */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personal Details</h3>
                  <p className="text-sm text-slate-500">Manage your name, contact info, and address.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-900 ${errors.full_name ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white'}`}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    {errors.full_name && <p className="text-xs text-red-500 ml-1">{errors.full_name}</p>}
                  </div>

                  {/* Phone (read-only) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors" />
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        readOnly
                        className={`w-full pl-12 pr-12 py-3 bg-slate-100 border rounded-xl outline-none transition-all font-medium text-slate-500 cursor-not-allowed`}
                        placeholder="+91 00000 00000"
                      />
                      <Lock className="absolute right-4 top-3.5 w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 ml-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Phone number cannot be changed here. To update your phone, re-verify with a new number.
                    </p>
                  </div>

                  {/* Email (Editable) */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-10 py-3 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-900 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white'}`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Residential Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none transition-all font-medium text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white resize-none"
                        placeholder="Enter your full address..."
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 md:px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                
                {/* Status Message (Mobile: Top, Desktop: Left) */}
                {statusMsg && (
                  <div className={`w-full sm:w-auto sm:mr-auto flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold animate-in fade-in ${msgType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {msgType === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {statusMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => user?.id && fetchProfile(user.id)}
                  disabled={busy}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-white hover:text-slate-900 transition-all disabled:opacity-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {busy ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}