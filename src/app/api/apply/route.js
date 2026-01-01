export const runtime = 'nodejs';
import { createServerSupabase } from '@/config/supabaseServer';
import { Resend } from 'resend';

// Initialize Resend (Email Service)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    const body = await req.json();

    // IMPORTANT INVARIANT: If the request is authenticated (contains a valid Supabase
    // bearer token), the application MUST be tied to an existing profiles.id. We
    // prefer an explicit ``profileId`` provided by the client (validated server-side).
    // Phone/email matching is only used as a fallback for anonymous submissions and
    // must be unambiguous. Under no circumstances should an OTP-authenticated user
    // be able to create an application with a NULL profile_id; such requests are
    // rejected with a clear error and a warning is logged.


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

    // Resolve profile_id: prefer explicit client-provided ids (profileId | user_id | lead_user_id) and validate them.
    try {
      const providedProfileId = body.profileId || body.user_id || body.lead_user_id || null;

      // Check if request contains an Authorization bearer token (authenticated request)
      const authHeader = req.headers.get('authorization') || '';
      let authUser = null;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
            headers: { Authorization: `Bearer ${token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
          });
          if (userRes.ok) authUser = await userRes.json();
        } catch (e) {
          console.warn('Failed to validate auth token for application request', e);
        }
      }

      // If the client explicitly provided a profile id, we MUST validate it exists and reject if not.
      if (providedProfileId) {
        try {
          const { data: found, error: pfErr } = await supabase.from('profiles').select('id').eq('id', providedProfileId).maybeSingle();
          if (pfErr) {
            console.error('Profile validation query failed:', pfErr);
            return new Response(JSON.stringify({ error: 'PROFILE_VALIDATION_ERROR' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
          }
          if (!found) {
            console.warn(`Rejecting application: provided profileId=${providedProfileId} not found`);
            return new Response(JSON.stringify({ error: 'Provided profileId not found', code: 'PROFILE_NOT_FOUND' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
          }

          // If request is authenticated, ensure the provided profile belongs to the authenticated user
          if (authUser && authUser?.id) {
            const ownsProfile = (found.id === authUser.id);
            if (!ownsProfile) {
              console.warn(`Authenticated user ${authUser.id} supplied profileId ${providedProfileId} which does not belong to them.`);
              return new Response(JSON.stringify({ error: 'Authenticated user must use their own profileId', code: 'PROFILE_MISMATCH' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
            }
          }

          // Valid profile id — attach it (authoritative)
          dbPayload.profile_id = providedProfileId;
          console.info(`Attaching provided profile_id=${providedProfileId} to application insert`);
        } catch (qErr) {
          console.error('Error validating provided profileId:', qErr);
          return new Response(JSON.stringify({ error: 'PROFILE_VALIDATION_ERROR' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
      } else if (authUser && authUser?.id) {
        // Authenticated request without explicit profileId: resolve profile associated with this auth user
        try {
          const { data: profileMatch, error: profileErr } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profileErr) {
            console.error('Failed to query profile for authenticated user:', profileErr);
            return new Response(JSON.stringify({ error: 'PROFILE_VALIDATION_ERROR' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
          }

          if (!profileMatch) {
            // IMPORTANT: Reject authenticated submissions that cannot be tied to a profile
            console.warn(`Rejecting authenticated application: no profile record found for user ${authUser.id}`);
            return new Response(JSON.stringify({ error: 'Authenticated submissions require a linked profile', code: 'PROFILE_REQUIRED' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
          }

          dbPayload.profile_id = profileMatch.id;
          console.info(`Resolved authenticated user's profile_id=${profileMatch.id} and attached to application`);
        } catch (e) {
          console.error('Error resolving profile for authenticated user:', e);
          return new Response(JSON.stringify({ error: 'PROFILE_VALIDATION_ERROR' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
      } else {
        // Fallback for anonymous submissions: attempt to detect profile by phone (last 10 digits) then email, but only if unambiguous
        let profileId = null;
        const normalizePhone = (s) => (s || '').toString().replace(/\D/g, '');
        const appPhoneNorm = normalizePhone(dbPayload.mobile_number);
        const last10 = appPhoneNorm ? appPhoneNorm.slice(-10) : null;

        if (last10) {
          const { data: candidates } = await supabase.from('profiles').select('id,phone').ilike('phone', `%${last10}`);
          if (candidates && candidates.length === 1) {
            profileId = candidates[0].id;
          } else if (candidates && candidates.length > 1) {
            const exact = candidates.find(c => normalizePhone(c.phone) === appPhoneNorm);
            if (exact) profileId = exact.id;
            else console.warn(`Ambiguous profile phone matches (${candidates.length}) for phone ending ${last10}; not assigning`) ;
          }
        }

        if (!profileId && dbPayload.email) {
          const { data: emailMatches } = await supabase.from('profiles').select('id,email').eq('email', dbPayload.email.toLowerCase());
          if (emailMatches && emailMatches.length === 1) profileId = emailMatches[0].id;
          else if (emailMatches && emailMatches.length > 1) console.warn(`Ambiguous email matches (${emailMatches.length}) for email ${dbPayload.email}; not assigning`);
        }

        if (profileId) dbPayload.profile_id = profileId;
      }
    } catch (e) {
      console.warn('Failed to detect/validate profile_id for application insert:', e);
    }

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