'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserAuth } from '@/context/UserAuthContext'
import { supabase } from '@/config/supabase'
import { 
  User, Mail, Phone, MapPin, Camera, Save, RefreshCw, 
  ChevronLeft, Loader2, Check, AlertCircle, Shield
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
  const { user, isAuthenticated, loading } = useUserAuth()
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

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (user?.uid) {
      setForm(prev => ({ ...prev, email: user.email || '' }))
      fetchProfile(user.uid)
    }
  }, [user])

  const fetchProfile = async (uid: string) => {
    setBusy(true)
    setStatusMsg('')
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', uid)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      }

      if (data) {
        setForm(prev => ({ ...prev, ...data }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.full_name || form.full_name.trim().length < 2) e.full_name = 'Enter your full name'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.phone && !/^[0-9]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone (digits only)'
    if (form.full_name && form.full_name.length > 100) e.full_name = 'Name is too long'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // @ts-ignore - Dynamic key access for error clearing
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMsg('')
    setMsgType('')
    if (!validate()) return
    if (!user?.uid) {
      router.push('/signin')
      return
    }

    setBusy(true)
    try {
      const payload = {
        user_id: user.uid,
        full_name: form.full_name || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        photo_url: form.photo_url || null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()

      if (error) {
        console.error('Profile update error:', error)
        setStatusMsg('Failed to update profile. Please try again.')
        setMsgType('error')
      } else {
        setStatusMsg('Profile saved successfully!')
        setMsgType('success')
        if (data && data[0]) setForm(prev => ({ ...prev, ...data[0] }))
        setTimeout(() => setStatusMsg(''), 3000)
      }
    } catch (err) {
      console.error(err)
      setStatusMsg('An unexpected error occurred.')
      setMsgType('error')
    } finally {
      setBusy(false)
    }
  }

  const inputClass = (hasError: boolean | string | undefined) => `
    w-full pl-10 pr-4 py-3 bg-white border rounded-xl outline-none transition-all duration-200
    ${hasError 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
      : 'border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
    }
  `

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12 md:pt-8 font-sans">
      
      {/* Mobile Sticky Header */}
      <div className="md:hidden bg-white sticky top-0 z-30 border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
           <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-slate-900">Edit Profile</h1>
        <div className="w-8"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* Desktop Title & Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 mb-8">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* =========================================================
              LEFT COLUMN: Photo & Summary (Sticky on Desktop)
             ========================================================= */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100 lg:sticky lg:top-8 flex flex-col items-center text-center">
              
              <div className="relative mb-4">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-slate-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center ring-1 ring-slate-100">
                   {form.photo_url ? (
                     <img src={form.photo_url} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <span aria-hidden className="text-4xl md:text-5xl">{isAuthenticated ? '😎' : '👤'}</span>
                   )}
                </div>
                <button type="button" className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-blue-700 transition-colors active:scale-95">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-900 truncate w-full">{form.full_name || 'Your Name'}</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">{form.email || 'user@example.com'}</p>

              <div className="w-full bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start gap-3 text-left">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">Account Status</p>
                  <p className="text-xs text-blue-700 leading-relaxed">Your profile is active. Complete KYC to unlock higher loan limits.</p>
                </div>
              </div>

            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: Form Fields
             ========================================================= */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100 space-y-6">
              
              <div className="border-b border-slate-100 pb-4 mb-2 hidden md:block">
                <h3 className="text-lg font-bold text-slate-900">Personal Details</h3>
                <p className="text-sm text-slate-500">Update your contact information and address.</p>
              </div>

              {/* Grid for Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                  <div className="relative">
                     <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                     <input 
                       name="full_name" 
                       value={form.full_name} 
                       onChange={handleChange} 
                       className={inputClass(errors.full_name)}
                       placeholder="John Doe"
                     />
                  </div>
                  {errors.full_name && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Phone</label>
                  <div className="relative">
                     <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                     <input 
                       name="phone" 
                       type="tel"
                       value={form.phone} 
                       onChange={handleChange} 
                       className={inputClass(errors.phone)}
                       placeholder="+91 98765 43210"
                     />
                  </div>
                   {errors.phone && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.phone}</p>}
                </div>
              </div>

              {/* Full Width Fields */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <div className="relative group">
                   <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-hover:text-slate-500" />
                   <input 
                     name="email" 
                     type="email" 
                     value={form.email} 
                     onChange={handleChange} 
                     className={`${inputClass(errors.email)} bg-slate-50 text-slate-500 cursor-not-allowed`}
                     placeholder="john@example.com"
                     disabled
                   />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">Email address cannot be changed for security reasons.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Address</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                   <textarea 
                     name="address" 
                     value={form.address} 
                     onChange={handleChange} 
                     className={`
                        w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 min-h-[100px] resize-none
                        focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 placeholder-slate-400
                     `}
                     placeholder="Enter your full residential address"
                   />
                </div>
              </div>

              {/* Status Messages */}
              {statusMsg && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${msgType === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                   {msgType === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                   <span className="text-sm font-medium">{statusMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                 <button 
                   type="button" 
                   onClick={() => fetchProfile(user?.uid || '')} 
                   disabled={busy}
                   className="order-2 sm:order-1 sm:w-1/3 py-3.5 px-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
                    <span>Reset</span>
                 </button>

                 <button 
                   type="submit" 
                   disabled={busy}
                   className="order-1 sm:order-2 sm:w-2/3 py-3.5 px-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    {busy ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                 </button>
              </div>

            </div>
          </div>

        </form>
      </div>

      {/* Mobile Bottom Nav */}
      <div>
        <BottomNav />
      </div>
    </div>
  )
}