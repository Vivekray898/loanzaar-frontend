require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: total, error: tErr } = await supabase.from('applications').select('id', { count: 'exact', head: true }).is('profile_id', null);
  if (tErr) throw tErr;
  console.log('Applications still missing profile_id (count):', total?.count ?? 'unknown');

  const { data: sample } = await supabase.from('applications').select('id,full_name,mobile_number,email').is('profile_id', null).limit(20);
  console.log('Sample of null profile_id rows:', sample);
}

run().catch(err => { console.error(err); process.exit(1); });
