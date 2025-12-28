export const runtime = 'nodejs';
import { createServerSupabase } from '@/config/supabaseServer';
import { Resend } from 'resend';

// Initialize Resend outside the handler (if the key exists) to reuse the instance
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function POST(req) {
  try {
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

    // 5. Send Emails via Resend (Awaited for Serverless reliability)
    // We proceed even if email fails, because DB save was successful, 
    // but we log the error.
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || 'onboarding@resend.dev';

    if (resend && adminEmail && fromEmail) {
      try {
        const recordId = data?.id ? String(data.id) : 'N/A';

        const adminHtml = `
          <p><strong>New contact message received</strong></p>
          <ul>
            <li><strong>Name:</strong> ${escapeHtml(insertPayload.full_name)}</li>
            <li><strong>Email:</strong> ${escapeHtml(insertPayload.email)}</li>
            <li><strong>Phone:</strong> ${escapeHtml(insertPayload.mobile_number)}</li>
            <li><strong>Subject:</strong> ${escapeHtml(insertPayload.subject)}</li>
            <li><strong>State/City:</strong> ${escapeHtml(insertPayload.state)} / ${escapeHtml(insertPayload.city)}</li>
            <li><strong>ID:</strong> ${recordId}</li>
          </ul>
          <p><strong>Message:</strong></p>
          <pre style="font-family: sans-serif; white-space: pre-wrap;">${escapeHtml(insertPayload.message)}</pre>
        `;

        // Prepare email promises
        const emailPromises = [];

        // Admin Notification
        emailPromises.push(
          resend.emails.send({
            from: fromEmail,
            to: adminEmail,
            subject: `New Message: ${insertPayload.subject}`,
            html: adminHtml,
            reply_to: insertPayload.email, // Allow admin to reply directly to sender
          })
        );

        // Wait for all emails to be sent (or fail) before returning response
        // using Promise.allSettled ensures one failure doesn't stop the other
        const results = await Promise.allSettled(emailPromises);
        
        // Log failures if any
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Email send failure (index ${index}):`, result.reason);
            }
        });

      } catch (emailErr) {
        console.error('Critical Resend error:', emailErr);
        // We do NOT return a 500 here because the data was saved successfully to DB
      }
    } else {
      console.warn('Skipping emails: Configuration missing (Resend Key, Admin Email, or From Email)');
    }

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

// Utility: Basic HTML escaping
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}