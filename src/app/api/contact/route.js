export const runtime = 'nodejs';
import { createServerSupabase } from '@/config/supabaseServer';
import { sendAdminNotification } from '@/lib/email/sendAdminNotification';
import { formatContactEmail } from '@/lib/email/templates';

export async function POST(req) {
  try {
    // Debug: Check if API key and config are available
    console.log('API Key present:', !!process.env.RESEND_API_KEY);
    console.log('Admin Email present:', !!process.env.ADMIN_EMAIL);
    
    const body = await req.json();

    // 1. Validation
    const { name, email, subject, message, phone, mobile, state, city, reason, captchaToken } = body || {};

    // Ensure at least one phone/mobile value is present (frontend sends `mobile`; server accepts `phone` or `mobile`)
    if (!name || !email || !subject || !message || !captchaToken || !(phone || mobile)) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 2. Verify Turnstile (Cloudflare) — fallback to reCAPTCHA secret if present
    const secret = process.env.TURNSTILE_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      console.error('TURNSTILE_SECRET_KEY is missing');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: captchaToken }),
    });

    const verifyJson = await verifyRes.json();
    if (!verifyJson.success) {
      console.error('Turnstile verification failed:', verifyJson);
      const body = process.env.NODE_ENV === 'production' ? { error: 'Turnstile verification failed' } : { error: 'Turnstile verification failed', verify: verifyJson };
      return new Response(JSON.stringify(body), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 3. Setup Supabase
    // Prefer the new env var names: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (frontend) and SUPABASE_SERVICE_ROLE (backend service role)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // Prefer SUPABASE_SERVICE_ROLE for server-only service key
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Validate presence of a server-side service role key (recommended: SUPABASE_SECRET_KEY)
    if (!supabaseUrl || !serviceKey) {
      console.error('Supabase credentials missing: ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are set in the server environment');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: Supabase credentials missing' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Prevent accidental use of the publishable/anon key as the service key
    if (publishableKey && serviceKey === publishableKey) {
      console.error('Supabase service key appears to match the publishable/anon key. This will cause permission denied errors for writes. Replace with the SUPABASE_SECRET_KEY (service role) from Supabase project settings.');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: using publishable/anon key as service role key' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Do not log secrets or key fragments in production logs.
    // Log only non-sensitive operational info.
    console.info('Supabase service key validated; proceeding with DB operation');

    const supabase = createServerSupabase(serviceKey);

    // 4. Insert into Supabase
    const insertPayload = {
      full_name: String(name).trim(),
      email: String(email).trim(),
      mobile_number: (phone || mobile) ? String(phone || mobile).trim() : null,
      message: String(message).trim(),
      subject: String(subject).trim(),
      state: state ? String(state).trim() : null,
      city: city ? String(city).trim() : null,
      reason: reason ? String(reason).trim() : null,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      user_agent: req.headers.get('user-agent') || null,
    }; 

    const { data, error } = await supabase
      .from('contact_messages')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);

      // Provide a clearer message when permission issues occur
      if (error.code === '42501' || (error.message && /permission denied/i.test(String(error.message)))) {
        return new Response(JSON.stringify({ error: 'Database permission denied - check SUPABASE_SERVICE_ROLE key and RLS/policies' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ error: 'Failed to save message' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 5. Send Admin Notification Email (Non-blocking)
    console.log('Attempting to send contact message email...');
    
    sendAdminNotification({
      subject: `New Message: ${insertPayload.subject || 'Contact Form'}`,
      html: formatContactEmail({
        id: data.id,
        full_name: insertPayload.full_name,
        email: insertPayload.email,
        mobile_number: insertPayload.mobile_number,
        city: insertPayload.city,
        state: insertPayload.state,
        subject: insertPayload.subject,
        reason: insertPayload.reason,
        message: insertPayload.message,
        status: 'new',
        created_at: data.created_at,
      }),
      replyTo: insertPayload.email,
    }).then(result => {
      if (result.success) {
        console.log('Email sent successfully for contact message:', data.id);
      } else {
        console.error('Email failed for contact message:', data.id, result.error);
      }
    }).catch(err => {
      console.error('[EMAIL_FAILED] Contact notification exception:', err);
    });

    return new Response(JSON.stringify({ success: true, data }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    console.error('Route handler error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
