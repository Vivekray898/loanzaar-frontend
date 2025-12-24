# GitHub Copilot Guide — Legacy Pages Router (src/pages)

This directory is legacy-only and must be treated as READ-ONLY.

## Rules
- Do not create new files in this folder.
- Do not scaffold new routes or pages here.
- Only read existing files to assist migration or reference legacy behavior.
- If edits are required, make minimal, explicit changes only when requested.
- All new pages, routes, and components belong under `src/app/` (Next.js App Router).

## Allowed Write Locations
- `src/app/**` — new routes/pages, layouts, and client wrappers
- `src/components/**` — shared components (e.g., `NavBar`, `BottomNav`)
- `src/assets/**`, `public/**` — static assets

## Migration Notes
- Prefer App Router patterns (server `page.jsx` + client wrapper with `dynamic(..., { ssr: false })`).
- Do not mirror or duplicate legacy pages; point navigation to App Router paths.

## Rationale
Keeping `src/pages` read-only prevents accidental regression and ensures all new work uses the App Router.
