import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOTP } from '@/lib/otp/sendOtp';
import { generateOTP, OTP_EXPIRY_MINUTES } from '@/lib/otp/generateOtp';
import { checkRateLimit, recordRateLimitRequest } from '@/lib/otp/rateLimit';
import { validateIndianMobile, normalizePhoneToE164 } from '@/utils/phoneValidation';
import type { OTPContext } from '@/lib/otp/templates';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const OTP_SIGNING_KEY = process.env.OTP_SIGNING_KEY;
const SEND_LIMIT_PER_HOUR = Number(process.env.OTP_SEND_LIMIT_PER_HOUR || 5); // per phone (kept for backward compat)
const SEND_LIMIT_PER_IP_HOUR = Number(process.env.OTP_SEND_LIMIT_PER_IP_HOUR || 20); // per IP (kept for backward compat)
const OTP_TTL_SECONDS = OTP_EXPIRY_MINUTES * 60; // 5 minutes (300 seconds)

function hmacOtp(otp: string) {
  if (!OTP_SIGNING_KEY) throw new Error('OTP_SIGNING_KEY not configured');
  return crypto.createHmac('sha256', OTP_SIGNING_KEY).update(otp).digest('hex');
}

export async function POST(req: Request) {
  try {
    let { mobile, profileId, context = 'login' } = await req.json();
    
    // Validate phone number using utility (do this BEFORE any other checks)
    if (!mobile || typeof mobile !== 'string') {
      return NextResponse.json({ success: true }); // silent accept to avoid info leakage
    }

    const phoneValidation = validateIndianMobile(mobile);
    if (!phoneValidation.isValid) {
      console.warn('[OTP Route] Invalid phone format provided:', phoneValidation.error);
      return NextResponse.json({ success: true }); // silent accept to avoid info leakage
    }

    // Use validated/cleaned phone number for all subsequent operations
    mobile = phoneValidation.cleaned;

    // Validate context type
    const validContexts = ['registration', 'login'];
    if (!validContexts.includes(context)) {
      context = 'login'; // default to login
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || null;

    // ✅ NEW: Check rate limiting (3 sends per phone per 10 minutes)
    const rateLimitCheck = checkRateLimit(mobile);
    if (!rateLimitCheck.allowed) {
      console.warn(`[Rate Limit] Phone ${mobile} exceeded 3 sends per 10 minutes. Reset at ${rateLimitCheck.resetTime}`);
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // Rate-limiting using recent *active* rows in otp_challenges (unconsumed & created within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: recentByPhone, error: r1 } = await supabaseAdmin
      .from('otp_challenges')
      .select('id')
      .eq('phone', mobile)
      .eq('consumed', false)
      .gt('created_at', oneHourAgo);

    const phoneSends = (recentByPhone || []).length;
    if (phoneSends >= SEND_LIMIT_PER_HOUR) {
      // silently accept (don't leak rate-limit state)
      return NextResponse.json({ success: true });
    }

    const { data: recentByIp } = await supabaseAdmin
      .from('otp_challenges')
      .select('id')
      .eq('ip', ip)
      .eq('consumed', false)
      .gt('created_at', oneHourAgo);

    const ipSends = (recentByIp || []).length;
    if (ipSends >= SEND_LIMIT_PER_IP_HOUR) {
      return NextResponse.json({ success: true });
    }

    // Normalize phone to E.164 using libphonenumber-js to avoid duplicate entries
    try {
      const normalized = normalizePhoneToE164(mobile);
      if (!normalized) {
        console.warn('[OTP Route] Phone normalization failed for:', mobile);
        return NextResponse.json({ success: true });
      }
      mobile = normalized;
    } catch (e) {
      console.warn('Phone normalization failed; proceeding with validated value', e);
      // Continue with validated mobile (already cleaned by validateIndianMobile)
    }

    // Ensure OTP signing key is configured
    if (!OTP_SIGNING_KEY) {
      console.error('OTP_SIGNING_KEY is not configured');
      return NextResponse.json({ success: true });
    }

    // ✅ NEW: Silent resend logic - check if an unexpired OTP already exists for this phone
    // If it exists and hasn't expired, reuse it instead of creating a new one
    const expiryWindowMs = OTP_EXPIRY_MINUTES * 60 * 1000;
    const minCreatedTime = new Date(Date.now() - expiryWindowMs).toISOString();

    const { data: existingOtp, error: existingErr } = await supabaseAdmin
      .from('otp_challenges')
      .select('otp_hash, expires_at, id')
      .eq('phone', mobile)
      .eq('consumed', false)
      .gt('created_at', minCreatedTime)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingOtp && !existingErr) {
      // ✅ Reuse existing unexpired OTP (silent resend)
      console.info(`[Silent Resend] Reusing existing OTP for ${mobile} (expires at ${existingOtp.expires_at})`);
      // Record the resend attempt for rate limiting
      recordRateLimitRequest(mobile);
      // Send the same OTP using the context-specific message (we pass empty string for OTP since we're just resending message)
      const sendResult = await sendOTP(mobile, '', context as OTPContext);
      if (!sendResult.success) {
        console.error(`[OTP Route] Failed to send resend OTP via provider:`, sendResult.error);
      }
      return NextResponse.json({ success: true });
    }

    // Prevent multiple active OTPs: mark any existing unconsumed challenges for this phone as consumed
    try {
      await supabaseAdmin.from('otp_challenges').update({ consumed: true }).eq('phone', mobile).eq('consumed', false)
    } catch (e) {
      console.warn('Failed to expire existing OTP challenges for phone (non-fatal):', e)
    }

    // ✅ Generate 4-digit OTP (1000-9999) using secure random generation
    const otp = generateOTP();
    const h = hmacOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();

    // Store only the hash, don't include plain OTP. Also store ip+user_agent explicitly and set defaults server-side.
    const insertPayload: any = { phone: mobile, otp_hash: h, expires_at: expiresAt, ip, user_agent: userAgent, consumed: false, verify_attempts: 0 };
    if (profileId && typeof profileId === 'string') insertPayload.profile_id = profileId;

    // If a profileId was provided, verify it actually exists first to avoid FK violations
    if (insertPayload.profile_id) {
      try {
        const { data: pf, error: pfErr } = await supabaseAdmin.from('profiles').select('id').eq('id', insertPayload.profile_id).single();
        if (pfErr || !pf) {
          console.warn(`Provided profile_id ${insertPayload.profile_id} does not exist; omitting profile_id from insert.`);
          delete insertPayload.profile_id;
        }
      } catch (e) {
        // In case of unexpected error checking profiles, remove profile_id to be safe
        console.warn('Error verifying provided profile_id; proceeding without profile_id on insert.', e);
        delete insertPayload.profile_id;
      }
    }

    const { data: insertRes, error: insertErr } = await supabaseAdmin.from('otp_challenges').insert([insertPayload]).select('id').single();
    if (insertErr) {
      // Log detailed error to server logs for debugging (do not leak to client)
      console.error('Failed to insert otp_challenge:', insertErr);

      // Handle FK violation where profile_id was invalid (e.g., profile deleted/came from stale client)
      if (insertErr?.code === '23503' || (insertErr?.message || '').toLowerCase().includes('violates foreign key')) {
        console.warn('FK violation inserting otp_challenges (profile_id); retrying insert without profile_id...');
        const { data: retryRes, error: retryErr } = await supabaseAdmin.from('otp_challenges').insert([{
          phone: mobile,
          otp_hash: h,
          expires_at: expiresAt,
          ip,
          user_agent: userAgent,
          consumed: false,
          verify_attempts: 0
        }]).select('id').single();
        if (retryErr) {
          console.error('Retry insert without profile_id also failed:', retryErr);
          return NextResponse.json({ success: true });
        }
        console.info(`🔐 [SERVER OTP] for ${mobile}: ${otp} (expires at ${expiresAt}) — id=${retryRes?.id}`);
        const devReturn = process.env.DEV_RETURN_OTP === 'true' && process.env.NODE_ENV !== 'production';
        if (devReturn) {
          return NextResponse.json({ success: true, debugOtp: otp, id: retryRes?.id });
        }
        return NextResponse.json({ success: true });
      }

      // Handle schema cache lag on Supabase (missing profile_id column in postgrest cache)
      if (insertErr?.code === 'PGRST204' || (insertErr?.message || '').toLowerCase().includes("could not find the 'profile_id'")) {
        console.warn('Detected schema cache issue (profile_id not present in cache). Retrying insert without profile_id...');
        const { data: retryRes, error: retryErr } = await supabaseAdmin.from('otp_challenges').insert([{
          phone: mobile,
          otp_hash: h,
          expires_at: expiresAt,
          ip,
          user_agent: userAgent,
          consumed: false,
          verify_attempts: 0
        }]).select('id').single();
        if (retryErr) {
          console.error('Retry insert without profile_id also failed:', retryErr);
          // Best effort: return success to client
          return NextResponse.json({ success: true });
        }
        // Use retryRes for logging
        // eslint-disable-next-line no-console
        console.info(`🔐 [SERVER OTP] for ${mobile}: ${otp} (expires at ${expiresAt}) — id=${retryRes?.id}`);

        const devReturn = process.env.DEV_RETURN_OTP === 'true' && process.env.NODE_ENV !== 'production';
        if (devReturn) {
          return NextResponse.json({ success: true, debugOtp: otp, id: retryRes?.id });
        }
        return NextResponse.json({ success: true });
      }

      if (insertErr?.code === '42501') {
        console.error('Permission denied for schema public. Make sure SUPABASE_SERVICE_ROLE_KEY is set and has DB privileges.');
      }
      if ((insertErr?.message || '').toLowerCase().includes('does not exist') || (insertErr?.details || '').toLowerCase().includes('does not exist')) {
        console.error('OTP table missing. Run prisma migrate dev to create otp_challenges table.');
      }
      // Still return success to the client to avoid leaking information about accounts
      return NextResponse.json({ success: true });
    }

    // Log OTP only in non-production environments to avoid sensitive logs in prod
    const devLog = process.env.NODE_ENV !== 'production'
    if (devLog) {
      console.info(`🔐 [SERVER OTP] for ${mobile}: ${otp} (expires at ${expiresAt}) — id=${insertRes?.id}`);
    }

    // ✅ NEW: Send OTP using pluggable provider system with context-specific message
    const sendResult = await sendOTP(mobile, otp, context as OTPContext);
    if (!sendResult.success) {
      console.error(`[OTP Route] Failed to send OTP via provider:`, sendResult.error);
      // Still return success to client to not leak failure information
      // User can retry if SMS doesn't arrive
    }

    // ✅ NEW: Record the send for rate limiting
    recordRateLimitRequest(mobile);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Send OTP Error:', err);
    // Silent error to client
    return NextResponse.json({ success: true });
  }
}