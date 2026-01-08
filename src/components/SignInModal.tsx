'use client'

import React, { useEffect, useState, useRef } from 'react';
import { X, Phone, ArrowRight, Loader2, Edit2, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { validateIndianMobile } from '@/utils/phoneValidation';

// --- Types ---
interface SignInModalProps {
  open?: boolean;
  onClose?: () => void;
  next?: string | undefined;
  forceOpen?: boolean;
  onForceClose?: () => void;
}

export default function SignInModal({ open = false, onClose = () => {}, next, forceOpen = false, onForceClose }: SignInModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useAuth();
  const modalParam = searchParams?.get('modal');
  const isOpen = forceOpen ? true : (modalParam === 'login');

  // --- State ---
  const [showOtp, setShowOtp] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP State (4 Digits)
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Effects (Scroll lock, URL management) ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset';
      // Reset state on close
      setTimeout(() => {
        setShowOtp(false);
        setPhone('');
        setOtp(['', '', '', '']);
        setError(null);
      }, 300);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (open && !isOpen) {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('modal', 'login');
        router.push(url.pathname + url.search);
      }
    }
    if (open === false && isOpen) {
      closeModalByUrl();
    }
  }, [open]);

  // Focus first OTP input when shown
  useEffect(() => {
    if (showOtp && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [showOtp]);

  const closeModalByUrl = () => {
    if (forceOpen) {
      if (typeof onForceClose === 'function') onForceClose();
      return;
    }
    if (typeof window === 'undefined') {
      try { onClose(); } catch (e) {}
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('modal');
    router.replace(url.pathname + url.search);
    try { onClose(); } catch (e) {}
  };

  // --- Handlers ---

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate phone number using utility
      const validation = validateIndianMobile(phone);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid phone number');
        setIsLoading(false);
        return;
      }

      // Call the actual API to send OTP
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: validation.cleaned, context: 'login' })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      console.log('OTP sent successfully to', validation.cleaned);
      setIsLoading(false);
      setShowOtp(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call Backend to Verify OTP
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phone, otp: enteredOtp, context: 'login' })
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP. Please try again.');
      }

      // Success Handler
      handleSuccess();

    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    
    // Allow typing only 1 digit
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 3 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to prev input on Backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleEditPhone = () => {
    setShowOtp(false);
    setOtp(['', '', '', '']);
    setError(null);
  };

  const handleSuccess = () => {
    if (forceOpen) {
      if (typeof onForceClose === 'function') onForceClose();
    } else {
      closeModalByUrl();
    }

    setTimeout(async () => {
      try {
        await checkSession();
        // Resume flow logic
        const raw = sessionStorage.getItem('auth_intent');
        if (raw) {
          const intent = JSON.parse(raw);
          window.dispatchEvent(new CustomEvent('resume-flow', { detail: intent }));
          sessionStorage.removeItem('auth_intent');
        }
      } catch (err) {
        console.error('Session restore failed', err);
      }
      if (next) window.location.href = next;
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={forceOpen ? undefined : closeModalByUrl} 
      />

      <div className="relative w-full max-w-lg md:max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ring-1 ring-white/10">
        
        {/* Close Button */}
        {!forceOpen && (
          <button onClick={closeModalByUrl} className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full text-slate-500 hover:text-slate-800 transition-colors backdrop-blur-md shadow-sm">
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Left Panel (Marketing) - Kept Clean */}
        <div className="hidden md:flex md:w-5/12 bg-slate-900 relative overflow-hidden flex-col justify-between p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-90" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 mt-10">
            <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
              Securely access your dashboard, track loans, and manage your financial profile.
            </p>
          </div>

          <div className="relative z-10 space-y-4 mb-10">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10"><ShieldCheck className="w-4 h-4 text-emerald-400" /></div>
              <span>Bank-grade Security</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10"><ArrowRight className="w-4 h-4 text-emerald-400" /></div>
              <span>One-Click Verification</span>
            </div>
          </div>
        </div>

        {/* Right Panel (Red Design Form) */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 bg-white min-h-[500px] flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            
            {/* Header */}
            <div className="mb-10 text-center md:text-left">
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In To Your Account</h3>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if(showOtp) handleVerifyOtp(); else handleGetOtp(e); }}>
              
              {/* Phone Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-3">
                  {/* Country Code Box */}
                  <div className="w-16 h-12 flex items-center justify-center border border-slate-300 rounded-lg bg-white text-slate-700 font-medium">
                    +91
                  </div>
                  
                  {/* Number Input */}
                  <div className="flex-1 relative">
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      disabled={showOtp}
                      value={phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(digits);
                        if (error) setError(null);
                      }}
                      className={`w-full h-12 px-4 border rounded-lg outline-none font-medium transition-colors ${
                        showOtp 
                          ? 'bg-slate-100 border-slate-200 text-slate-500' // Disabled Look
                          : 'bg-white border-slate-300 text-slate-900 focus:border-slate-800'
                      }`}
                      placeholder="Enter mobile number"
                    />
                    {showOtp && (
                      <button 
                        type="button" 
                        onClick={handleEditPhone}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* OTP Section */}
              {showOtp && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex gap-4 mb-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpInputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 sm:w-14 sm:h-14 border border-slate-300 rounded-lg text-center text-xl font-bold text-slate-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    ))}
                  </div>
                  
                  <div className="mb-8">
                    <button 
                      type="button"
                      onClick={handleGetOtp}
                      className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                    >
                      Resend otp
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
                  {error}
                </p>
              )}

              {/* Action Button */}
              <button 
                type="submit"
                disabled={isLoading || phone.length < 10}
                className="w-full h-12 bg-red-500 hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  showOtp ? 'Login with OTP' : 'Get OTP'
                )}
              </button>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
}