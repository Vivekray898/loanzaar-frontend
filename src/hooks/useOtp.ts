import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/context/ToastContext';

interface UseOtpProps {
  mobile: string;
}

export const useOtp = ({ mobile }: UseOtpProps) => {
  const toast = useToast();
  const [otp, setOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const expiryRef = useRef<number | null>(null);
  // Track whether the most recent OTP request used the server flow (so verify chooses server path)
  const serverModeRef = useRef(false);

  // Timer logic for resend cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Request OTP (Mock or Server)
  const requestOtp = async () => {
    // Defensive: prevent duplicate sends if an OTP is active or cooldown is running
    if (cooldown > 0) {
      setError('Please wait before requesting another OTP.');
      return;
    }
    if (expiryRef.current && Date.now() < expiryRef.current) {
      setError('OTP already sent. Please check console or wait to resend.');
      setCooldown(prev => (prev > 0 ? prev : 30));
      return;
    }

    setLoading(true);
    setError(null);

      // Server-based OTP: call backend to generate, store, and send OTP. We always use server-side flow.
    try {
      const leadUserId = typeof window !== 'undefined' ? localStorage.getItem('lead_user_id') : null;
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, profileId: leadUserId || undefined })
      });
      const data = await res.json();
      // backend logs OTP to server console for testing; treat as success
      setCooldown(30);
      expiryRef.current = Date.now() + 2 * 60 * 1000;

      // Mark that we used the server-based flow so verify uses server verification regardless of env flag
      serverModeRef.current = true;

      // If server returned debug OTP (dev-only), show it in a toast for convenience
      if (data?.debugOtp) {
        console.info('🔐 [DEV DEBUG OTP] (from server):', data.debugOtp);
        toast.success(`OTP (dev): ${data.debugOtp}`);
      } else {
        toast.success('OTP requested. Check server console (test mode).');
      }

      return;
    } catch (err: any) {
      setError('Failed to request OTP');
      return;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (Mock or Server)
  const verifyOtp = async (fullName?: string) => {
    setLoading(true);
    setError(null);

    // Server-based verify + create user flow
    if (process.env.NEXT_PUBLIC_USE_SERVER_OTP === 'true' || serverModeRef.current) {
      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, otp: enteredOtp, fullName })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          // Handle specific server-side responses gracefully
          const code = data?.code || null;
          // Treat expired/invalid OTPs as invalid_or_expired for friendly UX (server sends 400 for these cases)
          if (res.status === 401 || (res.status === 400 && (code === 'EXPIRED_OTP' || code === 'INVALID_OTP'))) {
            setError('OTP invalid or expired. Please request a new OTP.');
            return { success: false, error: 'invalid_or_expired' };
          }
          setError(data.error || 'Verification failed');
          return { success: false, error: data.error || 'Verification failed', code };
        }

        // On success, clear client-side state
        setEnteredOtp('');
        expiryRef.current = null;
        setOtp(null);
        // Reset server mode (one-time usage) — future flows will detect new requests
        serverModeRef.current = false;

        toast.success('OTP verified!');

        // Broadcast a global event so callers can react (AuthContext/SignInModal will restore session)
        try { window.dispatchEvent(new CustomEvent('otp-verified', { detail: { userId: data.userId, role: data.role } })); } catch (e) {}

        return { success: true, userId: data.userId, role: data.role };
      } catch (err: any) {
        setError(err.message || 'OTP verification failed');
        return { success: false, error: err.message || 'OTP verification failed' };
      } finally {
        setLoading(false);
      }
    }

    // Local/mock verification
    try {
      if (!otp) throw new Error('No OTP requested');
      if (enteredOtp.length !== 6) throw new Error('Enter 6-digit OTP');
      if (expiryRef.current && Date.now() > expiryRef.current) throw new Error('OTP expired');
      if (enteredOtp !== otp) throw new Error('Invalid OTP');

      // On success, clear OTP state (prevent reuse)
      setOtp(null);
      expiryRef.current = null;
      setEnteredOtp('');

      toast.success('OTP verified!');

      // Create/fetch profile on server so we have a persistent user id (profiles.id)
      try {
        const res = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, fullName })
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          return { success: true, userId: data.userId, role: data.role || 'user' };
        }
        // If server call failed, still return success to keep UX smooth, but no userId
        return { success: true, role: 'user' };
      } catch (createErr) {
        console.warn('Failed to create/fetch profile after OTP verify', createErr);
        return { success: true, role: 'user' };
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
      return { success: false, error: err.message || 'OTP verification failed' };
    } finally {
      setLoading(false);
    }
  };

  return { enteredOtp, setEnteredOtp, error, loading, cooldown, requestOtp, verifyOtp };
};