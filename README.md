# Frontend — Loanzaar React (Next.js)

This frontend uses Next.js App Router (`src/app`) as the canonical routing surface. Legacy Pages Router files live in `src/pages` and `_archive` — these are maintained as historical copies and should be validated before removal.

## Quick Start

Install dependencies:

```bash
cd frontend
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

## Key locations

- Root layout: src/app/layout.jsx
- Providers (Supabase + global providers): src/app/providers.jsx
- App Router main groups: src/app/(public), src/app/(auth), src/app/(loans), src/app/dashboard, src/app/admin
- API routes (App Router): src/app/api/
- Legacy Pages Router (archive until migration complete): src/pages/ and _archive/

## Notes & Recommendations

- The App Router (`src/app`) is the active routing surface (Next 16+). Keep migrating any remaining `src/pages` files to `src/app` and remove legacy duplicates after QA.
- Archive before deleting: move `_archive/` and any `pages-old` folders to an archival branch or external archive ZIP.
- Run dependency checks before pruning unused packages (e.g., `npx depcheck`).

## Troubleshooting / Dev tips

- If a page fails due to a browser-only library on the server, isolate that UI into a client component (add `"use client"`) or dynamic import it client-side.
- To inspect build output and confirm which files were compiled, check `.next/` after `npm run build`.

## Contact / Next steps

For migration planning or help implementing the cleanup steps, see STRUCTURE.md (in this folder) or open an issue in the repo.
