import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const OTP_SIGNING_KEY = process.env.OTP_SIGNING_KEY;
const SEND_LIMIT_PER_HOUR = Number(process.env.OTP_SEND_LIMIT_PER_HOUR || 5); // per phone
const SEND_LIMIT_PER_IP_HOUR = Number(process.env.OTP_SEND_LIMIT_PER_IP_HOUR || 20);
const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 120); // 2 minutes

function hmacOtp(otp: string) {
  if (!OTP_SIGNING_KEY) throw new Error('OTP_SIGNING_KEY not configured');
  return crypto.createHmac('sha256', OTP_SIGNING_KEY).update(otp).digest('hex');
}

export async function POST(req: Request) {
  try {
    let { mobile, profileId } = await req.json();
    if (!mobile || typeof mobile !== 'string' || mobile.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ success: true }); // silent accept to avoid info leakage
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || null;

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
      const { parsePhoneNumberFromString } = await import('libphonenumber-js')
      const parsed = parsePhoneNumberFromString(mobile, 'IN')
      if (!parsed || !parsed.isValid()) {
        // Silent accept to avoid account enumeration
        return NextResponse.json({ success: true })
      }
      // Use E.164 normalized format for storage and comparison
      mobile = parsed.number
    } catch (e) {
      // If parsing library fails for any reason, continue with provided raw value
      console.warn('Phone normalization failed; proceeding with raw value', e)
    }

    // Ensure OTP signing key is configured
    if (!OTP_SIGNING_KEY) {
      console.error('OTP_SIGNING_KEY is not configured');
      return NextResponse.json({ success: true });
    }

    // Prevent multiple active OTPs: mark any existing unconsumed challenges for this phone as consumed
    try {
      await supabaseAdmin.from('otp_challenges').update({ consumed: true }).eq('phone', mobile).eq('consumed', false)
    } catch (e) {
      console.warn('Failed to expire existing OTP challenges for phone (non-fatal):', e)
    }

    // Generate OTP securely using crypto.randomInt
    const otp = String(crypto.randomInt(100000, 999999));
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

    // DEV MODE: optionally return plaintext OTP to client for local dev convenience. NEVER enable in production.
    const devReturn = process.env.DEV_RETURN_OTP === 'true' && process.env.NODE_ENV !== 'production';
    if (devReturn) {
      return NextResponse.json({ success: true, debugOtp: otp, id: insertRes?.id });
    }

    return NextResponse.json({ success: true });
    if (insertErr) {
      // Log detailed error to server logs for debugging (do not leak to client)
      console.error('Failed to insert otp_challenge:', insertErr);
      if (insertErr?.code === '42501') {
        console.error('Permission denied for schema public. Make sure SUPABASE_SERVICE_ROLE_KEY is set and has DB privileges.');
      }
      if ((insertErr?.message || '').toLowerCase().includes('does not exist') || (insertErr?.details || '').toLowerCase().includes('does not exist')) {
        console.error('OTP table missing. Run prisma migrate dev to create otp_challenges table.');
      }
      // Still return success to the client to avoid leaking information about accounts
      return NextResponse.json({ success: true });
    }

    // For test/dev: log OTP to server console (no SMS cost)
    // In prod, replace with real SMS provider integration
    // eslint-disable-next-line no-console
    console.info(`🔐 [SERVER OTP] for ${mobile}: ${otp} (expires at ${expiresAt})`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Send OTP Error:', err);
    // Silent error to client
    return NextResponse.json({ success: true });
  }
}