/*
  Safe backfill script to set applications.profile_id by matching profiles
  1) Match by normalized phone (primary)
  2) Match by lowercase email (fallback)
  Leaves ambiguous matches untouched
  Run with: node scripts/backfill/applications_profile_backfill.js
*/

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

function normalizePhone(s) {
  if (!s) return '';
  return String(s).replace(/\D/g, '');
}

async function buildProfilePhoneMap() {
  const map = new Map(); // normalizedPhone -> [profiles]
  let from = 0;
  const page = 500;
  while (true) {
    const { data, error } = await supabase.from('profiles').select('id,phone,email').range(from, from + page - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const p of data) {
      const np = normalizePhone(p.phone);
      if (!np) continue;
      if (!map.has(np)) map.set(np, []);
      map.get(np).push(p);
    }
    from += page;
  }
  return map;
}

async function backfillByPhone() {
  console.log('Backfilling by phone...');
  const profileMap = await buildProfilePhoneMap();
  const ambiguous = [];
  const updated = [];

  // Process apps in batches
  while (true) {
    const { data: apps, error } = await supabase.from('applications').select('id,mobile_number').is('profile_id', null).not('mobile_number', 'is', null).limit(500);
    if (error) throw error;
    if (!apps || apps.length === 0) break;

    // Group updates by profileId
    const updatesByProfile = new Map();

    for (const a of apps) {
      const np = normalizePhone(a.mobile_number);
      if (!np) continue;
      const candidates = profileMap.get(np) || [];
      if (candidates.length === 1) {
        const pid = candidates[0].id;
        if (!updatesByProfile.has(pid)) updatesByProfile.set(pid, []);
        updatesByProfile.get(pid).push(a.id);
        updated.push({ applicationId: a.id, profileId: pid });
      } else if (candidates.length > 1) {
        ambiguous.push({ applicationId: a.id, mobile: a.mobile_number, candidates: candidates.map(c => c.id) });
      }
    }

    // Apply updates per profile group
    for (const [pid, appIds] of updatesByProfile.entries()) {
      const { error: upErr } = await supabase.from('applications').update({ profile_id: pid }).in('id', appIds);
      if (upErr) console.error('Failed to update group', pid, upErr);
    }

    if (apps.length < 500) break; // done
  }

  // Write ambiguous to file
  fs.writeFileSync('backfill_phone_ambiguous.json', JSON.stringify(ambiguous, null, 2));
  console.log('Phone backfill complete. Updated rows:', updated.length, 'Ambiguous rows:', ambiguous.length);
}

async function backfillByEmail() {
  console.log('Backfilling by email (fallback)...');
  // Build email->profile map (lowercase)
  const map = new Map();
  let from = 0; const page = 500;
  while (true) {
    const { data, error } = await supabase.from('profiles').select('id,email').range(from, from + page - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const p of data) {
      if (!p.email) continue;
      const le = String(p.email).toLowerCase();
      if (!map.has(le)) map.set(le, []);
      map.get(le).push(p);
    }
    from += page;
  }

  const ambiguous = [];
  let updatedCount = 0;

  while (true) {
    const { data: apps, error } = await supabase.from('applications').select('id,email').is('profile_id', null).not('email', 'is', null).limit(500);
    if (error) throw error;
    if (!apps || apps.length === 0) break;

    const updatesByProfile = new Map();

    for (const a of apps) {
      const le = String(a.email).toLowerCase();
      const candidates = map.get(le) || [];
      if (candidates.length === 1) {
        const pid = candidates[0].id;
        if (!updatesByProfile.has(pid)) updatesByProfile.set(pid, []);
        updatesByProfile.get(pid).push(a.id);
        updatedCount++;
      } else if (candidates.length > 1) {
        ambiguous.push({ applicationId: a.id, email: a.email, candidates: candidates.map(c => c.id) });
      }
    }

    for (const [pid, appIds] of updatesByProfile.entries()) {
      const { error: upErr } = await supabase.from('applications').update({ profile_id: pid }).in('id', appIds);
      if (upErr) console.error('Failed to update group', pid, upErr);
    }

    if (apps.length < 500) break;
  }

  fs.writeFileSync('backfill_email_ambiguous.json', JSON.stringify(ambiguous, null, 2));
  console.log('Email backfill complete. Updated rows:', updatedCount, 'Ambiguous rows:', ambiguous.length);
}

(async () => {
  try {
    await backfillByPhone();
    await backfillByEmail();
    console.log('Backfill finished. Please review backfill_phone_ambiguous.json and backfill_email_ambiguous.json for manual review.');
  } catch (err) {
    console.error('Backfill error', err);
  }
})();
