// components/OtpVerifier.tsx
import React, { useEffect, useRef } from 'react';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import { useOtp } from '@/hooks/useOtp';

interface OtpVerifierProps {
  mobile: string;
  fullName: string;
  context?: 'registration' | 'login';
  onSuccess: (data: { userId: string; role?: string }) => void;
  onBack?: () => void;
}

export const OtpVerifier: React.FC<OtpVerifierProps> = ({ 
  mobile, 
  fullName,
  context = 'login',
  onSuccess, 
  onBack 
}) => {
  const {
    enteredOtp,
    setEnteredOtp,
    error,
    loading,
    cooldown,
    requestOtp,
    verifyOtp
  } = useOtp({ mobile, context });

  // Auto-send on mount (guard against double mounts e.g., React Strict Mode)
  const autoSentRef = useRef(false);
  useEffect(() => {
    if (autoSentRef.current) return;
    autoSentRef.current = true;
    requestOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async () => {
    // Use verify flow (server or mock) from useOtp
    const result = await verifyOtp(fullName);

    if (!result?.success) return;

    // If server returns a userId, pass it along with role to onSuccess
    if (result.userId) {
      try {
        localStorage.setItem('lead_user_id', result.userId);
        // Notify app that a lead login occured
        try { window.dispatchEvent(new CustomEvent('lead-login', { detail: { userId: result.userId, role: result.role } })); } catch (e) { /* ignore */ }
      } catch (e) {
        console.warn('Could not persist lead_user_id to localStorage');
      }
      onSuccess({ userId: result.userId, role: result.role });
    } else {
      // No user creation - just signal success
      onSuccess({ userId: '', role: result.role || 'user' });
    }
  };

  return (
    <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-4">
        <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-teal-100">
          <Shield className="w-7 h-7" />
        </div>
        <h4 className="text-xl font-bold text-slate-900">Verify Mobile</h4>
        <p className="text-sm text-slate-500">OTP sent to +91 {mobile}</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
          Enter 4-Digit OTP
        </label>
        <input
          value={enteredOtp}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
            setEnteredOtp(val);
          }}
          placeholder="1234"
          maxLength={4}
          className="w-full p-3.5 text-center tracking-widest text-2xl bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-bold"
          autoFocus
          inputMode="numeric"
        />
        {error && <p className="text-xs text-red-600 mt-2 text-center font-medium">{error}</p>}
        {/* Dev Hint */}
        <p className="text-[10px] text-slate-400 mt-2 text-center">(Check console for Mock OTP)</p>
      </div>

      <div className="flex gap-3 pt-2">
        {onBack && (
          <button onClick={onBack} className="px-5 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleVerify}
          disabled={enteredOtp.length !== 4 || loading}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Proceed'}
        </button>
      </div>

      <div className="text-center mt-1">
        <button 
          onClick={requestOtp} 
          disabled={cooldown > 0 || loading}
          className="text-xs text-slate-600 hover:underline inline-flex items-center gap-2 disabled:opacity-50 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Send / Resend OTP'}
        </button>
      </div>
    </div>
  );
};