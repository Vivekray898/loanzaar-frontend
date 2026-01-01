# Manual Tests for /api/apply profile association

This document contains manual steps and curl examples to validate that application submissions are correctly associated with `profiles.profile_id` when the client is OTP-authenticated (sends `lead_user_id` / `profileId`) and that invalid or missing profile IDs are handled correctly.

> Note: Run these against your local dev server (e.g., http://localhost:3000) or deployed environment. Adjust `HOST` accordingly.

## Test 1 — Guest submission (no profileId)
- Clear localStorage `lead_user_id` from your browser.
- Submit the Car Refinance form or run the sample curl below:

curl -X POST http://localhost:3000/api/apply \
  -H "Content-Type: application/json" \
  -d '{ "fullName": "Test Guest", "mobile": "9999900000", "email": "guest@example.com", "product_type": "car-refinance" }'

Expected: 200 OK, response `{ success: true, id: <application id> }`. `applications.profile_id` will be `NULL` unless inference found an unambiguous match.

## Test 2 — OTP-verified submission (valid lead_user_id)
- Obtain a valid `lead_user_id` by performing the OTP flow in the app and keeping it in localStorage.
- Submit the form (the client will include `profileId` automatically) or run curl:

curl -X POST http://localhost:3000/api/apply \
  -H "Content-Type: application/json" \
  -d '{ "fullName": "OTP User", "mobile": "9999900000", "email": "otp@example.com", "product_type": "car-refinance", "profileId": "<VALID_PROFILE_ID>" }'

Expected: 200 OK, `applications.profile_id` equals `<VALID_PROFILE_ID>`.

## Test 3 — OTP-verified submission with invalid profileId
- Use a non-existent UUID for `profileId`.

curl -X POST http://localhost:3000/api/apply \
  -H "Content-Type: application/json" \
  -d '{ "fullName": "Bad User", "mobile": "9999900000", "email": "bad@example.com", "product_type": "car-refinance", "profileId": "00000000-0000-0000-0000-000000000000" }'

Expected: 400 Bad Request, JSON: `{ error: 'Provided profileId not found', code: 'PROFILE_NOT_FOUND' }`. No application row should be inserted.

## Test 4 — Provided profileId takes precedence over phone/email inference
- Submit with `profileId` that points to a profile with a different phone than the payload mobile.

Expected: 200 OK, `applications.profile_id` == provided `profileId` (server honors explicit identity).

## Test 5 — Authenticated request without linked profile (must be rejected)
- Perform an authenticated request (include Supabase bearer token for a user that has no profile row).
- Submit the application payload without a `profileId`.

Expected: 400 Bad Request, JSON: `{ error: 'Authenticated submissions require a linked profile', code: 'PROFILE_REQUIRED' }`. No application row should be inserted and server logs will warn about the missing profile for the authenticated user.

## Notes
- Server logs will emit `Attaching provided profile_id=<id> to application insert` for accepted explicit ids, and `Rejecting application: provided profileId=<id> not found` for rejections.
- Run `node scripts/backfill/applications_profile_backfill.js` to handle legacy backfill on historical rows.
