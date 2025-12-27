# Frontend — Loanzaar (Next.js)

This project uses the Next.js App Router (`src/app`) as the primary routing surface. Legacy Pages Router files live under `src/pages` for historical/compatibility reasons and should be audited before removal.

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

## Core locations

- Root layout: [src/app/layout.jsx](src/app/layout.jsx)
- Global providers (Supabase, auth providers): [src/app/providers.jsx](src/app/providers.jsx)
- App Router entry groups: [src/app/(public)](src/app/(public)), [src/app/(auth)](src/app/(auth)), [src/app/account](src/app/account)
- API routes (App Router): [src/app/api](src/app/api)
- Legacy Pages Router snapshot (audit before deletion): [src/pages](src/pages) and [src/archive](src/archive)

## Developer notes

- App Router is the canonical routing surface in this repo. Prefer creating routes under `src/app` using `page.tsx/.jsx` and `layout.tsx/.jsx`.
- If you need client-only behavior, mark components with `"use client"` and isolate browser-only libs to client components.
- Move any global providers previously in `src/pages/_app.jsx` into `src/app/providers.jsx` or `src/app/layout.jsx`.

## Migration / Cleanup checklist

- Audit `src/pages` for any pages still used by the app. Search the codebase for references before deleting.
- Migrate providers and global CSS imports (`_app.jsx`) into App Router equivalents. Example: move `<UserAuthProvider>` into `src/app/providers.jsx`.
- Replace Pages-router Sentry/_error logic by using App Router `global-error.jsx` or server-side config (`sentry.server.config.js`).
- Archive files before deleting (create an `archive/` branch or ZIP the `src/pages` folder).

## Troubleshooting tips

- If the dev server errors on server-render, the cause is often a browser-only library used in a Server Component — convert it to a Client Component with `"use client"` or dynamically import it.
- To find legacy pages:

```bash
# list legacy pages
ls src/pages || true

# run dev and inspect the stack traces
npm run dev
```

- Check `.next/` after a build to see what was compiled.

## Useful commands

```bash
npm run dev       # start dev server
npm run build     # build for production
npm start         # start production server after build
npm run lint      # run linters (if configured)
```

## Contacts & next steps

If you'd like, I can:
- Help migrate remaining `src/pages` files into `src/app` and remove legacy files safely.
- Extract global providers from `src/pages/_app.jsx` and wire them into `src/app/providers.jsx`.

See [STRUCTURE.md](STRUCTURE.md) for the project map and migration context.

