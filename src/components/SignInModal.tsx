'use client'

import React, { useEffect, useState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { OtpVerifier } from './OtpVerifier';
import { X, Phone, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SignInModalProps {
  open?: boolean;
  onClose?: () => void;
  next?: string | undefined;
  // Force-open the modal without relying on query params (used by some pages)
  forceOpen?: boolean;
  onForceClose?: () => void;
}

export default function SignInModal({ open = false, onClose = () => {}, next, forceOpen = false, onForceClose }: SignInModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useAuth();
  const modalParam = searchParams?.get('modal');
  // effective open state: either the query param is set OR a parent forces it open
  const isOpen = forceOpen ? true : (modalParam === 'login');

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Derive scroll lock and reset behavior
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => {
        setStep('phone');
        setPhone('');
        setError(null);
      }, 300);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // URL state management for modal
  useEffect(() => {
    if (open && !isOpen) {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('modal', 'login');
        router.push(url.pathname + url.search);
        setTimeout(() => {
          try { window.history.replaceState({ ...(window.history.state || {}), modalOpened: true }, ''); } catch (e) {}
        }, 50);
      }
    }
    if (open === false && isOpen) {
      closeModalByUrl();
    }
  }, [open]);

  // Listen for global OTP verified events (e.g., from other tabs/windows or hooks)
  useEffect(() => {
    const onOtpVerified = (e: any) => {
      try {
        const detail = e?.detail || {};
        handleSuccess(detail);
      } catch (err) {}
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('otp-verified', onOtpVerified);
    }

    return () => {
      try { if (typeof window !== 'undefined') window.removeEventListener('otp-verified', onOtpVerified); } catch (e) {}
    };
  }, []);

  const closeModalByUrl = () => {
    if (forceOpen) {
      try { if (typeof onForceClose === 'function') onForceClose(); } catch (e) {}
      return;
    }

    if (typeof window === 'undefined') {
      try { onClose(); } catch (e) {}
      return;
    }
    const state = window.history.state || {};
    if (state && state.modalOpened) {
      window.history.back();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('modal');
      router.replace(url.pathname + url.search);
    }
    try { onClose(); } catch (e) {}
  };


  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const pn = parsePhoneNumberFromString(phone, 'IN');
      if (!pn || !pn.isValid()) {
        setError('Please enter a valid 10-digit mobile number');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setStep('otp');
    }, 600);
  };

  const handleSuccess = (data: { userId?: string; role?: string }) => {
    // Close modal immediately
    if (forceOpen) {
      try { if (typeof onForceClose === 'function') onForceClose(); } catch (e) {}
    } else {
      closeModalByUrl();
    }

    // Small delay to ensure modal close is processed
    setTimeout(async () => {
      try {
        // Call AuthContext's checkSession to restore session from cookie
        await checkSession();

        // Dispatch resume flow event for CTA intent
        try {
          let intent: any = null;
          const raw = sessionStorage.getItem('auth_intent');
          if (raw) {
            try { intent = JSON.parse(raw); } catch (e) {}
            try { sessionStorage.removeItem('auth_intent'); } catch (e) {}
          }

          if (intent) {
            window.dispatchEvent(new CustomEvent('resume-flow', { detail: intent }));
          }
        } catch (e) {}
      } catch (err) {
        console.error('Failed to restore session after OTP:', err);
      }

      // If a specific next route was provided, redirect there
      if (next) {
        window.location.href = next;
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200" 
        onClick={forceOpen ? undefined : closeModalByUrl} 
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg md:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ring-1 ring-white/10">
        
        {/* Close Button */}
        {!forceOpen && (
          <button 
            onClick={closeModalByUrl} 
            className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full text-slate-500 hover:text-slate-800 transition-colors backdrop-blur-md shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Left Panel (Blue Branding - Visible on MD/LG) */}
        <div className="hidden md:flex md:w-5/12 bg-blue-600 relative overflow-hidden flex-col justify-between p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-700 opacity-90" />
          
          {/* Decorative Circles */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl mix-blend-overlay" />
          <div className="absolute top-1/2 -right-12 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-blue-100 text-sm leading-relaxed">Sign in to access your dashboard, track applications, and manage your profile efficiently.</p>
          </div>

          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3 text-sm text-blue-50 font-medium">
              <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm shadow-inner"><ShieldCheck className="w-5 h-5 text-white" /></div>
              <span>Bank-grade 256-bit Security</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-50 font-medium">
              <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm shadow-inner"><ArrowRight className="w-5 h-5 text-white" /></div>
              <span>Fast & Paperless Process</span>
            </div>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 flex flex-col justify-center bg-white min-h-[480px]">
          
          <div className="max-w-sm mx-auto w-full">
            {step === 'phone' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <div className="inline-flex md:hidden items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4 border border-blue-100">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Sign In</h3>
                  <p className="text-slate-500 mt-1">Enter your mobile number to proceed securely.</p>
                </div>

                <form onSubmit={handlePhoneSubmit}>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                    Mobile Number
                  </label>
                  
                  <div className={`flex items-center border rounded-xl overflow-hidden transition-all duration-200 ${error ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10'}`}>
                    <div className="bg-slate-50 px-4 py-3.5 border-r border-slate-200 text-slate-600 font-bold text-sm flex items-center gap-2">
                      <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-5 rounded-sm opacity-90 shadow-sm" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      autoFocus
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                        if (error) setError(null);
                      }}
                      className="w-full px-4 py-3.5 outline-none text-slate-900 font-semibold placeholder:font-normal placeholder:text-slate-400 bg-white"
                      placeholder="99999 00000"
                    />
                  </div>
                  
                  {error && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1.5 animate-in slide-in-from-top-1 ml-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> {error}
                    </p>
                  )}

                  <div className="mt-8">
                    <button 
                      type="submit"
                      disabled={isLoading || phone.length < 10}
                      className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 disabled:shadow-none hover:shadow-blue-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Get OTP <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                    By continuing, you agree to our <a href="#" className="underline hover:text-blue-600 font-medium text-slate-500">Terms of Service</a> & <a href="#" className="underline hover:text-blue-600 font-medium text-slate-500">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <OtpVerifier 
                  mobile={phone} 
                  fullName={''} 
                  onSuccess={(data) => handleSuccess({ userId: data.userId })} 
                  onBack={() => setStep('phone')} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}