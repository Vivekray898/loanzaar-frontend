# Frontend Structure & Migration Plan

This document describes the recommended folder structure, a conservative migration checklist from Pages Router to App Router, and cleanup steps.

## Recommended folder structure

frontend/
- src/
  - app/                # Next App Router pages & route-groups (canonical)
    - (public)/
    - (auth)/
    - (loans)/
    - dashboard/
    - admin/
    - api/
  - components/         # UI components (client where needed)
  - lib/                # integrations (supabase, sentry), shared helpers
  - services/           # data fetching wrappers / domain services
  - hooks/              # reusable hooks
  - utils/              # small utilities
  - styles/             # global css / tailwind config
  - tests/              # unit / e2e tests
- public/
- package.json
- next.config.js

## Conservative migration checklist

1. Create an `archive/` branch and commit `_archive/` and any `pages-old` folders there.
2. Run the app locally (`npm run dev`) and exercise main flows (home, auth, dashboard, admin).
3. For each route currently duplicated in `src/pages/`, verify the `src/app` equivalent renders identically. Keep the page in `src/pages` until parity is confirmed.
4. Once parity is verified for a page, move or delete the `src/pages` file, then run the app and tests again.
5. For UI that imports browser-only libs (charts, recaptcha), ensure such code is in client components (`"use client"`) or dynamically imported on the client to avoid server bundling.
6. After all pages are migrated and tested, remove `src/pages/` entirely and update README.

## Cleanup checklist (post-migration)

- Remove `_archive/` and `pages-old/` from main branch (after archival).
- Run `npx depcheck` and remove unused dependencies from `package.json`.
- Add `.gitignore` entries for `.next/` and local env files if missing.
- Consolidate global providers in `src/app/providers.jsx` and centralize third-party initializers in `src/lib`.

## Notes on large libs

- `recharts` and `chart.js` are large. Keep charting libs client-only (dynamic imports) or lazily load them inside components used in admin dashboards to reduce server bundle size.

## Safety & QA

- Always archive before deleting.
- Prefer small incremental PRs per page/component migration to make rollbacks easy.
- Add simple smoke tests that exercise key flows after each migration batch.

