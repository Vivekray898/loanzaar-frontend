export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OTP_EXPIRY_MINUTES } from '@/lib/otp/generateOtp';
import { validateIndianMobile, normalizePhoneToE164, normalizePhoneForStorage } from '@/utils/phoneValidation';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const OTP_SIGNING_KEY = process.env.OTP_SIGNING_KEY;
const VERIFY_LIMIT_PER_CHALLENGE = Number(process.env.OTP_VERIFY_LIMIT_PER_CHALLENGE || 5);

// Convert ArrayBuffer to hex string
function bufToHex(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return Array.prototype.map.call(bytes, (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

async function hmacOtp(otp: string) {
  if (!OTP_SIGNING_KEY) throw new Error('OTP_SIGNING_KEY not configured');
  const enc = new TextEncoder();
  const keyData = enc.encode(OTP_SIGNING_KEY);
  const importedKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', importedKey, enc.encode(otp));
  return bufToHex(sigBuf);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mobileRaw = body?.mobile;
    const otp = body?.otp;
    const fullName = body?.fullName;

    // Strict request validation
    if (!mobileRaw || typeof mobileRaw !== 'string' || !otp || typeof otp !== 'string' || !/^\d{4}$/.test(otp)) {
      return NextResponse.json({ success: false, code: 'INVALID_REQUEST' }, { status: 400 });
    }

    // Validate phone number using utility (server-side enforcement)
    const phoneValidation = validateIndianMobile(mobileRaw);
    if (!phoneValidation.isValid) {
      console.warn('[Auth][verify-otp] Invalid phone format:', phoneValidation.error);
      return NextResponse.json({ success: false, code: 'INVALID_REQUEST' }, { status: 400 });
    }

    // Normalize phone to E.164 (same logic as send-otp) using validated number
    let mobile = phoneValidation.cleaned;
    try {
      const normalized = normalizePhoneToE164(mobile);
      if (!normalized) {
        console.warn('[Auth][verify-otp] Phone normalization failed for:', mobile);
        return NextResponse.json({ success: false, code: 'INVALID_REQUEST' }, { status: 400 });
      }
      mobile = normalized;
    } catch (e) {
      // Normalization failed; proceed with validated value
      if (process.env.NODE_ENV !== 'production') console.warn('[Auth][verify-otp] Phone normalization failed; using validated value', e);
    }

    // Extract request IP (same as send-otp)
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '0.0.0.0');

    // Fetch latest non-consumed challenge for this phone
    const { data: rows, error } = await supabaseAdmin
      .from('otp_challenges')
      .select('*')
      .eq('phone', mobile)
      .eq('consumed', false)
      .order('created_at', { ascending: false })
      .limit(1);

    const challenge = (rows && rows[0]) || null;

    // Reject if no active challenge or already consumed
    if (!challenge) {
      console.warn('[Auth][verify-otp] No active challenge for phone', mobile);
      return NextResponse.json({ success: false, code: 'INVALID_OTP' }, { status: 400 });
    }

    // Optional IP binding: ensure request IP matches OTP record IP if enforced
    if (process.env.OTP_ENFORCE_IP_BINDING === 'true' && challenge.ip) {
      if (challenge.ip !== ip) {
        console.warn('[Auth][verify-otp] IP mismatch for phone', mobile, 'requestIp', ip, 'otpIp', challenge.ip);
        return NextResponse.json({ success: false, code: 'IP_MISMATCH' }, { status: 400 });
      }
    }

    // Expiry check (OTP valid for 5 minutes)
    if (new Date(challenge.expires_at) < new Date()) {
      console.warn('[Auth][verify-otp] Challenge expired for phone', mobile, 'challengeId', challenge.id, 'expiresAt', challenge.expires_at);
      // Mark consumed to prevent reuse
      try {
        await supabaseAdmin.from('otp_challenges').update({ consumed: true }).eq('id', challenge.id);
      } catch (e) { console.error('Failed to mark expired challenge consumed:', e); }
      return NextResponse.json({ success: false, code: 'EXPIRED_OTP' }, { status: 400 });
    }

    // Rate-limit verification attempts per challenge
    if ((challenge.verify_attempts || 0) >= VERIFY_LIMIT_PER_CHALLENGE) {
      console.warn('[Auth][verify-otp] Verify attempts exceeded for phone', mobile, 'challengeId', challenge.id);
      // mark consumed to prevent further checks
      await supabaseAdmin.from('otp_challenges').update({ consumed: true }).eq('id', challenge.id);
      return NextResponse.json({ success: false, code: 'INVALID_OTP' }, { status: 400 });
    }

    const expected = await hmacOtp(String(otp));
    if (expected !== challenge.otp_hash) {
      // increment verify_attempts; if this reaches the limit, mark consumed as well
      const nextAttempts = (challenge.verify_attempts || 0) + 1;
      const updatePayload: any = { verify_attempts: nextAttempts };
      if (nextAttempts >= VERIFY_LIMIT_PER_CHALLENGE) updatePayload.consumed = true;
      try {
        await supabaseAdmin.from('otp_challenges').update(updatePayload).eq('id', challenge.id);
      } catch (e) {
        console.error('Failed to increment verify_attempts for challenge:', e);
      }

      console.warn('[Auth][verify-otp] OTP mismatch for phone', mobile, 'attempts=', nextAttempts);
      return NextResponse.json({ success: false, code: 'INVALID_OTP' }, { status: 400 });
    }

    // OTP matched — mark challenge consumed (single-use)
    try {
      // If a profileId was passed to the flow (rare) we don't need to change here; otherwise, after creating/finding profile below
      await supabaseAdmin.from('otp_challenges').update({ consumed: true }).eq('id', challenge.id);
    } catch (e) {
      console.error('Failed to mark challenge consumed:', e);
      // continue flow — do not leak
    }

    console.log('[Auth][verify-otp] OTP verified for phone', mobile, 'challengeId', challenge.id);

    // Create or find a profile (phone = primary identity). Set phone_verified and verified_at.
    try {
      // Normalize phone for DB storage (store local 10-digit numbers without country code)
      const storagePhone = normalizePhoneForStorage(mobile);
      if (!storagePhone) {
        console.error('[Auth][verify-otp] Failed to normalize phone for storage:', mobile);
        return NextResponse.json({ success: false, code: 'INVALID_REQUEST' }, { status: 400 });
      }

      // Try to find an existing profile by phone and fetch role (so we can auto-set admin cookie)
      const { data: existingRows, error: findErr } = await supabaseAdmin
        .from('profiles')
        .select('id,role')
        .eq('phone', storagePhone)
        .limit(1);

      if (findErr) {
        console.error('Error finding profile by phone during verify-otp:', findErr);
      }

      let profileId = null as string | null;
      let profileRole: string | null = null;
      const existingProfile = (existingRows && existingRows.length) ? existingRows[0] : null;

      if (existingProfile) {
        profileId = existingProfile.id;
        profileRole = existingProfile.role || null;
        // Update verification state
        const { error: upsertErr } = await supabaseAdmin.from('profiles').update({ phone_verified: true, verified_at: new Date().toISOString() }).eq('id', profileId);
        if (upsertErr) {
          console.error('Failed to update profile verification state:', upsertErr);
          if (upsertErr.code === '42501') console.error('Permission denied for schema public — check SUPABASE_SERVICE_ROLE_KEY and DB grants');
          if ((upsertErr.message || '').toLowerCase().includes('does not exist') || (upsertErr.details || '').toLowerCase().includes('does not exist')) console.error('Profiles table missing; run prisma migrate dev');
        }
      } else {
        // Create a new profile row (default role = user). Store phone without country code.
        const { data: inserted, error: insertErr } = await supabaseAdmin.from('profiles').insert([{ full_name: fullName || null, phone: storagePhone, phone_verified: true, verified_at: new Date().toISOString(), role: 'user' }]).select('id,role').single();
        if (insertErr) {
          console.error('Failed to insert profile during verify-otp:', insertErr);
          if (insertErr.code === '42501') console.error('Permission denied for schema public — check SUPABASE_SERVICE_ROLE_KEY and DB grants');
          if ((insertErr.message || '').toLowerCase().includes('does not exist') || (insertErr.details || '').toLowerCase().includes('does not exist')) console.error('Profiles table missing; run prisma migrate dev');
        }
        profileId = inserted?.id || null;
        profileRole = inserted?.role || null;
      }

      // Create unified auth_session cookie for all roles (admin, agent, user)
      // Also create an entry in `auth_sessions` so server-side validation can find the session.
      try {
        if (profileId && profileRole) {
          console.log('[Auth][verify-otp] Creating auth cookie for profile', profileId, 'role', profileRole);
          const { createSession } = await import('@/lib/auth/session');
          const { cookieHeader } = createSession(profileId, profileRole);

          // Best-effort: insert auth_sessions record with 30-day expiry
          try {
            const expiresAt = new Date(Date.now() + (Number(process.env.SESSION_TTL_MS) || 30 * 24 * 60 * 60 * 1000));
            const ua = (req.headers.get('user-agent') || null);
            await supabaseAdmin.from('auth_sessions').insert([{ profile_id: profileId, ip: ip || null, user_agent: ua, expires_at: expiresAt.toISOString() }]);
          } catch (e) {
            console.warn('[Auth][verify-otp] Failed to insert auth_sessions record (non-fatal):', e);
          }

          const res = NextResponse.json({
            success: true,
            userId: profileId,
            role: profileRole,
          });
          res.headers.append('Set-Cookie', cookieHeader);
          return res;
        }
      } catch (e) {
        console.error('Failed to create auth cookie after OTP verify:', e);
        // continue — still return generic success with userId
      }

      // Attach profile_id to the consumed challenge row for auditing / tracing
      try {
        if (profileId) {
          const { error: attachErr } = await supabaseAdmin.from('otp_challenges').update({ profile_id: profileId }).eq('id', challenge.id);
          if (attachErr) {
            // Handle schema cache lag on Supabase that may not expose profile_id column immediately
            if (attachErr.code === 'PGRST204' || (attachErr.message || '').toLowerCase().includes("could not find the 'profile_id'")) {
              console.warn('PostgREST schema cache does not yet include profile_id on otp_challenges; skipping attach (will be fine once cache refreshes).');
            } else {
              console.error('Failed to attach profile_id to otp_challenge:', attachErr);
            }
          }
        }
      } catch (attachErr) {
        console.error('Failed to attach profile_id to otp_challenge (unexpected):', attachErr);
      }

      // If profile creation/upsert failed, return generic success (don't leak) but log details above
      return NextResponse.json({
        success: true,
        userId: profileId,
        role: profileRole,
      });
    } catch (err: any) {
      console.error('Profile upsert/fetch unexpected error:', err);
      // still return generic success to avoid leaking info
      return NextResponse.json({ success: true });
    }
  } catch (err: any) {
    console.error('Verify OTP Error:', err);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}