import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Create User API called but SUPABASE_SERVICE_ROLE_KEY or URL is missing');
      return NextResponse.json({ success: false, error: 'Server misconfigured: missing Supabase service role key' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const { mobile, fullName } = await req.json();
    
    // Validate input
    if (!mobile || mobile.length < 10) throw new Error('Invalid mobile number');

    // Instead of creating Supabase Auth users, create or upsert a profile row representing the lead

    // Normalize phone to storage format (10-digit local number without country code)
    const { normalizePhoneForStorage } = await import('@/lib/phone');
    const storagePhone = normalizePhoneForStorage(mobile);
    let profileId: string | null = null;

    // Try to find existing profile by phone (use limit(1) to avoid PostgREST single() coercion errors when no rows)
    const { data: existingRows, error: findErr } = await supabaseAdmin.from('profiles').select('id').eq('phone', storagePhone).limit(1);
    if (findErr) {
      console.error('Error finding existing profile in create-user:', findErr);
      // If permission denied, provide a clearer hint
      if (findErr.code === '42501') {
        return NextResponse.json({ success: false, error: 'Database permission denied: check SUPABASE_SERVICE_ROLE_KEY and DB grants' }, { status: 500 });
      }
      // Helpful hint when table does not exist
      if ((findErr.message || '').toLowerCase().includes('does not exist') || (findErr.details || '').toLowerCase().includes('does not exist')) {
        return NextResponse.json({ success: false, error: 'Database table missing: ensure you applied migrations (prisma migrate dev)' }, { status: 500 });
      }
    }

    const existing = (existingRows && existingRows.length) ? existingRows[0] : null;

    if (existing) {
      profileId = existing.id;
      // Update name if provided
      const { error: upErr } = await supabaseAdmin.from('profiles').update({ full_name: fullName || null, phone_verified: true, verified_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', profileId);
      if (upErr) {
        console.error('Failed to update profile in create-user:', upErr);
        if (upErr.code === '42501') {
          return NextResponse.json({ success: false, error: 'Database permission denied: check SUPABASE_SERVICE_ROLE_KEY and DB grants' }, { status: 500 });
        }
      }
      return NextResponse.json({ success: true, userId: profileId, isNewUser: false });
    }

    // Create new profile (store phone in local 10-digit format)
    const { data: inserted, error: insertErr } = await supabaseAdmin.from('profiles').insert([{ full_name: fullName || null, phone: storagePhone, phone_verified: true, verified_at: new Date().toISOString(), role: 'user' }]).select('id').single();
    if (insertErr) {
      console.error('Failed to insert profile in create-user:', insertErr);
      if (insertErr.code === '42501') {
        return NextResponse.json({ success: false, error: 'Database permission denied: check SUPABASE_SERVICE_ROLE_KEY and DB grants' }, { status: 500 });
      }
      throw insertErr;
    }
    if (!inserted) throw new Error('Failed to create profile');

    profileId = inserted.id;

    return NextResponse.json({ success: true, userId: profileId, isNewUser: true });

  } catch (error: any) {
    console.error("Create User API Error:", error);
    // Don't leak DB internals to client; return a friendly message
    return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
  }
}