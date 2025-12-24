# GitHub Copilot Instructions – Loanzaar Frontend

## ⚠️ Legacy Pages Router Notice

The directory `src/pages/` is a **legacy path** retained only for migration compatibility.

### ❌ Do NOT:
- Create new pages or routes inside `src/pages/`
- Generate new navigation using the Pages Router
- Suggest adding files under `src/pages/`

### ✅ Always:
- Create all new routes using the **Next.js App Router**
- Place new pages under `src/app/`
- Follow the existing App Router layout and route group structure:
  - `(public)`
  - `(auth)`
  - `dashboard`
  - `admin`

### 🧱 File & Language Conventions
- **Prefer TypeScript (`.tsx`) over JavaScript (`.jsx`) for all new components and pages**
- Use `.jsx` only when editing or maintaining existing legacy files
- New server pages should be `page.tsx` by default
- New client components should be `.tsx` with `'use client'` explicitly declared

### 📌 Architecture Rules
- `page.tsx` files are **Server Components by default**
- Client-only logic must be placed in separate `'use client'` components
- Legacy components may be imported **only via client wrappers**

If unsure, prefer existing patterns in `src/app/` and follow Next.js App Router best practices.
