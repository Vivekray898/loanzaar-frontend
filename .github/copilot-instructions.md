# GitHub Copilot Instructions – Loanzaar Frontend

## ✅ App Router Only (Pages Router Removed)

The legacy **Pages Router** has been **completely removed** from this project.

There is **no `src/pages/` directory** in the codebase.

All routing, layouts, and navigation are handled **exclusively** using the **Next.js App Router**.

---

## ❌ Do NOT

* Create or suggest a `src/pages/` directory
* Use Pages Router concepts (`getStaticProps`, `getServerSideProps`, `_app.js`, `_document.js`)
* Generate routes outside of `src/app/`
* Suggest adding `.js` or `.jsx` files for new work

---

## ✅ Always

* Create all routes using the **Next.js App Router**
* Place pages and layouts under `src/app/`
* Follow the existing route group structure:

  * `(public)`
  * `(auth)`
  * `dashboard`
  * `admin`

---

## 💎 File Extension Rules (Strict)

### **All New Files → TypeScript Only**

* Pages → `.tsx`
* Layouts → `.tsx`
* UI Components → `.tsx`
* Client Components → `.tsx`
* Utilities / Helpers → `.ts`

❗ **No new `.js` or `.jsx` files are allowed**

---

## 🧠 TypeScript Conventions (Mandatory)

* Define `interface` or `type` for **all props**
* Avoid `any` (use specific types or `unknown` if necessary)
* Type `params` and `searchParams` explicitly in `page.tsx`

### Example: Typed App Router Page

```tsx
interface PageProps {
  params: { id: string };
  searchParams: Record<string, string | string[]>;
}

export default function Page({ params, searchParams }: PageProps) {
  return <div>Page ID: {params.id}</div>;
}
```

---

## 🧩 Server vs Client Components

### Server Components (Default)

* `page.tsx` and `layout.tsx` are **Server Components by default**
* Do **NOT** use hooks or browser-only APIs
* Keep them focused on data fetching and composition

### Client Components

* Must be `.tsx`
* Must include `'use client'` at the top
* Encapsulate all interactivity (state, effects, events)

```tsx
'use client';

import { useState } from 'react';

interface ClientComponentProps {
  title: string;
}

export function ClientComponent({ title }: ClientComponentProps) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{title}: {count}</button>;
}
```

### Importing Client Components into Server Pages

```tsx
import { ClientComponent } from '@/components/ClientComponent';

export default function Page() {
  return <ClientComponent title="Counter" />;
}
```

---

## 🚀 Architecture Rules

* Use route groups for separation of concerns
* Keep layouts minimal and compositional
* Prefer Server Components unless interactivity is required
* Isolate business logic into typed utilities

---

## ✨ Final Checklist

* [ ] App Router only (`src/app`)
* [ ] No Pages Router APIs
* [ ] All new files in TypeScript
* [ ] Client components explicitly marked
* [ ] Strict typing everywhere

---

When in doubt, **default to App Router + TypeScript**.
