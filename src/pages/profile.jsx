'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserAuth } from '../context/UserAuthContext'
import { supabase } from '../config/supabase'
import { 
  User, Mail, Phone, MapPin, Camera, Save, RefreshCw, 
  ChevronLeft, Loader2, Check, AlertCircle 
} from 'lucide-react'

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useUserAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    photo_url: ''
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [msgType, setMsgType] = useState('') // 'success' or 'error'

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (user?.uid) {
      // Initialize with Auth email, but let profile data override if exists
      setForm(prev => ({ ...prev, email: user.email || '' }))
      fetchProfile(user.uid)
    }
  }, [user])

  const fetchProfile = async (uid) => {
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

  const validate = () => {
    const e = {}
    if (!form.full_name || form.full_name.trim().length < 2) e.full_name = 'Enter your full name'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.phone && !/^[0-9]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone (digits only)'
    if (form.full_name && form.full_name.length > 100) e.full_name = 'Name is too long'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
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
        .upsert(payload, { onConflict: 'user_id' }) // Ensure upsert uses correct conflict target
        .select()

      if (error) {
        console.error('Profile update error:', error)
        setStatusMsg('Failed to update profile. Please try again.')
        setMsgType('error')
      } else {
        setStatusMsg('Profile saved successfully!')
        setMsgType('success')
        if (data && data[0]) setForm(prev => ({ ...prev, ...data[0] }))
        
        // Auto-clear success message after 3 seconds
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

  // Helper for input classes
  const inputClass = (hasError) => `
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
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-6">
      
      {/* 1. Header (Mobile Friendly) */}
      <div className="bg-white sticky top-0 z-30 border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
           <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-bold text-slate-900">Edit Profile</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        
        {/* 2. Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
               {form.photo_url ? (
                 <img src={form.photo_url} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-10 h-10 text-slate-400" />
               )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500 font-medium">{form.email || 'user@example.com'}</p>
        </div>

        {/* 3. Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
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
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
            <div className="relative">
               <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
               <input 
                 name="email" 
                 type="email" 
                 value={form.email} 
                 onChange={handleChange} 
                 className={inputClass(errors.email)}
                 placeholder="john@example.com"
                 disabled // Often email shouldn't be editable directly here without verification logic
               />
            </div>
             {errors.email && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Phone</label>
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

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Address</label>
            <div className="relative">
               <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
               <textarea 
                 name="address" 
                 value={form.address} 
                 onChange={handleChange} 
                 className={`
                    w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 min-h-[80px] resize-none
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 placeholder-slate-400
                 `}
                 placeholder="Enter your full address"
               />
            </div>
          </div>

          {/* Hidden/Advanced field for photo URL */}
           <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Avatar URL</label>
            <input 
              name="photo_url" 
              value={form.photo_url} 
              onChange={handleChange} 
              className={inputClass(false)}
              placeholder="https://..."
            />
          </div>

          {/* Feedback Message */}
          {statusMsg && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${msgType === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
               {msgType === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
               <span className="text-sm font-medium">{statusMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex gap-4">
             <button 
               type="button" 
               onClick={() => fetchProfile(user?.uid)} 
               disabled={busy}
               className="flex-1 py-3.5 px-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
                <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
                <span>Reset</span>
             </button>

             <button 
               type="submit" 
               disabled={busy}
               className="flex-[2] py-3.5 px-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
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

        </form>
      </div>
    </div>
  )
}