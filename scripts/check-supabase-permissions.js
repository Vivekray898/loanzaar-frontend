// scripts/check-supabase-permissions.js
// Quick helper to verify SUPABASE_SERVICE_ROLE_KEY can read/write the `profiles` and `otp_challenges` tables.
// Usage (PowerShell): node .\scripts\check-supabase-permissions.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

(async function main(){
  try {
    console.log('Checking SELECT on profiles...');
    const { data: profData, error: profErr } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (profErr) {
      console.error('Profiles SELECT error:', profErr);
    } else {
      console.log('Profiles SELECT OK (found rows):', (profData || []).length);
    }

    console.log('Attempting to insert a temporary row into otp_challenges...');
    const { data: otpData, error: otpErr } = await supabaseAdmin.from('otp_challenges').insert([{ phone: '0000000000', otp_hash: 'test', expires_at: new Date(Date.now()+60000).toISOString(), ip: '127.0.0.1' }]).select('id').single();
    if (otpErr) {
      console.error('otp_challenges INSERT error:', otpErr);
    } else {
      console.log('otp_challenges INSERT OK, id:', otpData?.id);
      // cleanup
      await supabaseAdmin.from('otp_challenges').delete().eq('id', otpData.id);
    }

    console.log('Done. If any operation failed with permission errors, check SUPABASE_SERVICE_ROLE_KEY and run prisma migrations.');
  } catch (e) {
    console.error('Unexpected error while checking supabase permissions:', e);
  }
})();