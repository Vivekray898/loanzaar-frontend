# Admin Panel — User Auth & Role Flow 📋

## Overview 🎯
This document summarizes how **admin user authentication and role management** works in this repo and where to find the relevant files. It covers: the single auth provider, admin verification on server endpoints, the admin users UI, role updates, and DB placement.

---

## Project tree (relevant parts) 🌳

```
src/
├─ app/
│  ├─ admin/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                 # Admin home page
│  │  └─ users/
│  │     ├─ page.tsx              # Server-render gateway (fetches users)
│  │     └─ UserList.tsx          # Client UI + Role selector
│  └─ api/
│     └─ admin/
│        ├─ users/               # Admin user endpoints
│        │  └─ route.ts           # GET (list), PUT (update role)
│        └─ ...
├─ context/
│  ├─ UserAuthContext.jsx        # SINGLE auth provider, role caching, profile creation
│  └─ AdminAuthContext.jsx       # Thin admin helpers (no listener)
├─ lib/
│  └─ adminAuth.ts               # `requireAdmin(request)` helper (token/internal secret check)
├─ config/
│  └─ supabase.js                # client creation (used by front-end)
└─ prisma/
   └─ schema.prisma              # `profiles` model + `user_role` enum
```

---

## Where role is stored & DB details 💾
- Role lives in the `profiles` table:
  - `profiles.role` uses enum `user_role { user, admin }`.
  - File: `prisma/schema.prisma` (see `model profiles` and `enum user_role`).

---

## Auth flow (high-level) 🔁

1. **Single auth listener**: `src/context/UserAuthContext.jsx`
   - Registers a single `supabase.auth.onAuthStateChange` inside `useEffect([])`.
   - On sign-in:
     - Reads `session.user` (Supabase user).
     - Queries `profiles` once (guarded by `lastCheckedUid`) to determine role.
     - If no profile exists, **creates** a minimal profile (`user_id`, `full_name`, `email`, `phone`, `role: 'user'`).
     - Sets React state: `user` (minimal object) and `role` (`'guest'|'user'|'admin'`).
   - On sign-out: sets `role` to `guest` and clears user state.

2. **Server-side admin verification**: `src/lib/adminAuth.ts`
   - Exposes `requireAdmin(request)` used by admin API routes.
   - Supports two auth modes:
     - **Internal server calls** using `x-internal-secret` header (for SSR/internal fetches).
     - **Bearer token** forwarded from client — validated via Supabase `auth/v1/user` + then `profiles.role` check using **service role key**.
   - Returns `{ ok: true, user }` when check passes.

3. **Admin API**: `src/app/api/admin/users/route.ts`
   - `GET` lists `profiles` using the **service role** key (bypasses RLS).
   - `PUT` accepts `{ user_id, role }` and updates `profiles.role` (admin-only). Validates `role` is `'user'` or `'admin'`.

4. **Admin UI**:
   - `src/app/admin/users/page.tsx` (server-side) fetches the users list via `fetch(serverUrl('/api/admin/users'))` using `x-internal-secret` for server fetch.
   - `src/app/admin/users/UserList.tsx` (client) renders rows and includes a `RoleSelector`.
     - `handleChangeRole` obtains the client session token (`supabase.auth.getSession()`), calls the `PUT` endpoint with `Authorization: Bearer <token>`.
     - UI performs optimistic updates and rolls back on failure.

---

## Security & Environment 🔐
- **Service role key** (server-only): `SUPABASE_SERVICE_ROLE_KEY` — used by admin endpoints to bypass RLS when reading/updating profiles.
- **Internal server secret**: `INTERNAL_ADMIN_SECRET` — optional header used for safe server-server calls inside the app (page->api).
- API endpoints call `requireAdmin(request)` which ensures the caller is an admin.

---

## Notes & Recommendations 💡
- Prevent an admin from demoting themselves (avoid accidental lockout) — the UI can check the current admin's `user_id` against the target and disable that operation.
- Add an audit/log for role changes (who changed, when) — implemented via DB table `role_change_audit`.

  Run locally (development):

  ```bash
  npx prisma migrate dev --name add_role_change_audit
  ```

  Apply migrations in production:

  ```bash
  npx prisma migrate deploy
  ```

  The `role_change_audit` table records `actor_user_id`, `target_user_id`, `old_role`, `new_role`, and `created_at`.
- Consider replacing `alert()` confirmations with a toast/modal UX.
- Tests: add an integration test for the admin PUT endpoint to ensure only admins can update roles.

---

## Quick testing checklist ✅
- [ ] Log in as an admin → open `/admin/users` → ensure list loads.
- [ ] Change another user to `admin` → verify DB profile is updated.
- [ ] Try to call `PUT /api/admin/users` as non-admin → expect 403.
- [ ] Sign up a new user → check `profiles` record is created with name/email/phone.

---

If you want, I can:
- Add a small `CHANGE_ROLE_AUDIT` table and update the PUT endpoint to log changes.
- Add a confirmation modal + toast UX for role changes.

Would you like me to add audit logging next? 📑