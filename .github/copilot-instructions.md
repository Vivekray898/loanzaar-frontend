# GitHub Copilot Instructions – Loanzaar Frontend

## ⚠️ Legacy Pages Router Notice

The directory `src/pages/` is a **legacy path** retained only for migration compatibility.

### ❌ Do NOT:
- Create new pages or routes inside `src/pages/`
- Generate new navigation using the Pages Router
- Suggest adding files under `src/pages/`
- Create new `.js` or `.jsx` files anywhere in the project

### ✅ Always:
- Create all new routes using the **Next.js App Router**
- Place new pages under `src/app/`
- Follow the existing App Router layout and route group structure:
  - `(public)`
  - `(auth)`
  - `dashboard`
  - `admin`

### 💎 Strict TypeScript Conventions
- **All new files MUST be TypeScript (`.tsx` or `.ts`)**
- **UI Components:** Use `.tsx`
- **Logic/Utils:** Use `.ts`
- **Strict Typing:**
  - Define `interface` or `type` for all component props.
  - Avoid using `any`; use specific types or `unknown` if necessary.
  - Ensure `page.tsx` props (params/searchParams) are typed correctly.

### ⚠️ Legacy JavaScript Usage
- **Only** use `.jsx` or `.js` if you are modifying an **existing legacy file** that has not yet been migrated.
- If refactoring a legacy component, prioritize converting it to `.tsx`.

### 📌 Architecture Rules
- **Server Components:** `page.tsx` and `layout.tsx` are Server Components by default. Do not add interactivity (state/hooks) directly to them.
- **Client Components:**
  - Must be `.tsx` files.
  - Must have `'use client'` explicitly declared at the top.
  - Isolate client logic into small, reusable components imported by Server Pages.

If unsure, default to **TypeScript** and **App Router** patterns.