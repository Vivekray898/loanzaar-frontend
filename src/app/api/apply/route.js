export const runtime = 'nodejs';
import { createServerSupabase } from '@/config/supabaseServer';
import { Resend } from 'resend';

// Initialize Resend outside the handler (if the key exists) to reuse the instance
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    const body = await req.json();

    // Basic validation
    const { fullName, mobile, email, city, loanType, product_type, source, metadata, captchaToken } = body || {};
    if (!fullName || !mobile) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // If captcha verification is desired, validate it here (Turnstile / reCAPTCHA)
    const secret = process.env.TURNSTILE_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;
    if (secret) {
      if (!captchaToken) {
        return new Response(JSON.stringify({ error: 'Missing captcha token' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: captchaToken }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success) {
        console.error('Turnstile verification failed:', verifyJson);
        return new Response(JSON.stringify({ error: 'Captcha verification failed' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Setup Supabase server client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('Supabase credentials missing for /api/apply');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: Supabase credentials missing' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    if (publishableKey && serviceKey === publishableKey) {
      console.error('Supabase service key appears to match publishable key');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: using publishable key as service role' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = createServerSupabase(serviceKey);

    // Prepare insert payload matching client mapping
    const insertPayload = {
      full_name: String(fullName).trim(),
      mobile_number: String(mobile).trim(),
      email: email ? String(email).trim() : null,
      city: city ? String(city).trim() : null,
      product_category: 'loan',
      product_type: product_type || loanType || 'personal',
      application_stage: 'started',
      status: 'new',
      source: source || 'website',
      metadata: metadata || {},
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      user_agent: req.headers.get('user-agent') || null,
    };

    const { data, error } = await supabase
      .from('applications')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error (/api/apply):', error);
      if (error.code === '42501' || (error.message && /permission denied/i.test(String(error.message)))) {
        return new Response(JSON.stringify({ error: 'Database permission denied - check SUPABASE_SERVICE_ROLE key and RLS/policies' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Failed to save application' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Send admin email via Resend (best-effort)
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || 'no-reply@resend.dev';

    if (resend && adminEmail && fromEmail) {
      try {
        const recordId = data?.id ? String(data.id) : 'N/A';
        const html = `
          <p><strong>New application received</strong></p>
          <ul>
            <li><strong>Name:</strong> ${escapeHtml(insertPayload.full_name)}</li>
            <li><strong>Mobile:</strong> ${escapeHtml(insertPayload.mobile_number)}</li>
            <li><strong>Email:</strong> ${escapeHtml(insertPayload.email)}</li>
            <li><strong>Product:</strong> ${escapeHtml(insertPayload.product_type)}</li>
            <li><strong>ID:</strong> ${recordId}</li>
          </ul>
        `;

        await Promise.allSettled([
          resend.emails.send({ from: fromEmail, to: adminEmail, subject: `New Lead: ${escapeHtml(insertPayload.full_name)}`, html, reply_to: insertPayload.email })
        ]);
      } catch (emailErr) {
        console.error('Resend error (/api/apply):', emailErr);
      }
    } else {
      console.warn('Skipping admin email: Resend or admin email not configured');
    }

    return new Response(JSON.stringify({ success: true, id: data?.id, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Route handler error (/api/apply):', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// Basic HTML escape helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
