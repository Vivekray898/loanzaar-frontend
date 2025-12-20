import { createClient } from '@supabase/supabase-js';

// POST /api/contact
export async function POST(req) {
  try {
    const body = await req.json();

    // Basic server-side validation
    const { name, email, subject, message, phone, state, city, reason, captchaToken } = body || {};

    if (!name || !email || !subject || !message || !captchaToken) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Verify reCAPTCHA server-side (use server-only secret)
    const secret = process.env.RECAPTCHA_SECRET;
    if (!secret) {
      return new Response(JSON.stringify({ error: 'reCAPTCHA secret not configured on server' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: captchaToken }),
    });

    const verifyJson = await verifyRes.json();
    console.log('reCAPTCHA verification result:', verifyJson);

    if (!verifyJson.success) {
      return new Response(JSON.stringify({ error: 'Failed reCAPTCHA verification' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Build Supabase server client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    // Prefer server-only key; allow local fallback for easier dev testing (not recommended for production)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('Supabase env missing:', {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });

      return new Response(JSON.stringify({ error: 'Supabase server not configured. Set SUPABASE_SERVICE_ROLE (server-only) or SUPABASE_URL and service role in env.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE) {
      console.warn('Using SUPABASE_SERVICE_ROLE_KEY fallback for local testing — do NOT expose this key in production');
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Extract some metadata
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;

    const insertPayload = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : null,
      subject: String(subject).trim(),
      message: String(message).trim(),
      state: state ? String(state).trim() : null,
      city: city ? String(city).trim() : null,
      reason: reason ? String(reason).trim() : null,
      ip,
      user_agent: userAgent,
    };

    const { data, error } = await supabase.from('contact_messages').insert([insertPayload]).select().limit(1).single();

    if (error) {
      console.error('Supabase insert error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save message' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Contact route error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
