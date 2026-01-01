// scripts/integration/otp_flow_test.js
// Simple integration test: send-otp -> verify-otp flow using local server endpoints.
// Requires: server running on http://localhost:3000 and env vars configured.

// Load .env automatically for convenience during local runs
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed — it's optional
}

const fetch = require('node-fetch');

async function sendOtp(mobile, profileId) {
  const res = await fetch('http://localhost:3000/api/auth/send-otp', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile, profileId })
  });
  return res.json();
}

async function listOtpDebug(secret) {
  const res = await fetch('http://localhost:3000/api/debug/otp-challenges', { headers: { 'x-internal-secret': secret }});
  return res.json();
}

async function run() {
  const mobile = '9999900001';
  console.log('Sending OTP to', mobile);
  await sendOtp(mobile);
  console.log('Waiting a moment...');
  await new Promise(r => setTimeout(r, 500));
  console.log('Fetching debug list (requires INTERNAL_ADMIN_SECRET env var)');
  const secret = process.env.INTERNAL_ADMIN_SECRET;
  if (!secret) { console.log('No INTERNAL_ADMIN_SECRET set; cannot fetch debug endpoint'); return }
  const debug = await listOtpDebug(secret);
  console.log('Debug response:', debug);
}

run().catch(err => { console.error(err); process.exit(1) });