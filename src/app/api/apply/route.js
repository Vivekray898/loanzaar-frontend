export const runtime = 'nodejs';
import { createServerSupabase } from '@/config/supabaseServer';
import { Resend } from 'resend';

// Initialize Resend (Email Service)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Destructure fields matching the Client Payload (snake_case)
    // We also support camelCase fallbacks just in case old forms still hit this route.
    const { 
      full_name, fullName,
      mobile_number, mobile,
      email,
      address_line_1, address_line_2, city, state, pincode,
      product_category, loanType, product_type,
      source,
      metadata,
      captchaToken 
    } = body || {};

    // 2. Normalize Data
    const nameToSave = full_name || fullName;
    const mobileToSave = mobile_number || mobile;
    const productToSave = product_type || loanType || 'Personal Loan';
    const categoryToSave = product_category || 'Loan';

    // 3. Validation
    if (!nameToSave || !mobileToSave) {
      return new Response(JSON.stringify({ error: 'Missing Name or Mobile Number' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 4. Captcha Verification (Turnstile / reCAPTCHA)
    const secret = process.env.TURNSTILE_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;
    if (secret) {
      if (!captchaToken) {
        return new Response(JSON.stringify({ error: 'Missing captcha token' }), { status: 400 });
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: captchaToken }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success) {
        console.error('Captcha failed:', verifyJson);
        return new Response(JSON.stringify({ error: 'Security check failed. Please try again.' }), { status: 400 });
      }
    }

    // 5. Initialize Supabase
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server Error: Database configuration missing' }), { status: 500 });
    }
    const supabase = createServerSupabase(supabaseServiceKey);

    // 6. Prepare Database Payload (Matches 'applications' table structure)
    const dbPayload = {
      full_name: String(nameToSave).trim(),
      mobile_number: String(mobileToSave).trim(),
      email: email ? String(email).trim() : null,
      
      // New Address Fields
      address_line_1: address_line_1 ? String(address_line_1).trim() : null,
      address_line_2: address_line_2 ? String(address_line_2).trim() : null,
      city: city ? String(city).trim() : null,
      state: state ? String(state).trim() : null,
      pincode: pincode ? String(pincode).trim() : null,

      product_category: categoryToSave,
      product_type: productToSave,
      
      application_stage: 'submitted', // Updated stage
      status: 'new',
      source: source || 'website',
      metadata: metadata || {},
      
      // Audit Metadata
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    };

    // 7. Insert into Supabase
    const { data, error } = await supabase
      .from('applications')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save application' }), { status: 500 });
    }

    // 8. Send Admin Notification Email (Optional)
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@loanzaar.in';

    if (resend && adminEmail) {
      // Don't await email to keep response fast
      const emailHtml = `
        <h2>New ${escapeHtml(dbPayload.product_type)} Application</h2>
        <ul>
          <li><strong>Name:</strong> ${escapeHtml(dbPayload.full_name)}</li>
          <li><strong>Phone:</strong> ${escapeHtml(dbPayload.mobile_number)}</li>
          <li><strong>Location:</strong> ${escapeHtml(dbPayload.city)}, ${escapeHtml(dbPayload.state)}</li>
          <li><strong>Income:</strong> ₹${metadata?.monthlyIncome || 'N/A'}</li>
        </ul>
        <p>View full details in your admin dashboard.</p>
      `;
      
      resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `New Lead: ${escapeHtml(dbPayload.full_name)}`,
        html: emailHtml
      }).catch(err => console.error('Email failed:', err));
    }

    // 9. Success Response
    return new Response(JSON.stringify({ success: true, id: data?.id }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    console.error('API Route Error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// Helper to prevent XSS in emails
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({ 
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' 
  })[m]);
}