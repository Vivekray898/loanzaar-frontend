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

---

## 💎 File Extension Rules

### **NEW Pages & Components → Use `.tsx`**
- All newly created pages MUST use `.tsx`
- All new UI components MUST use `.tsx`
- All new utility files MUST use `.ts`
- No exceptions for new files

### **EXISTING Pages & Components → Continue with `.jsx`**
- Keep existing `.jsx` files as-is (no forced migration)
- Only convert to `.tsx` if actively refactoring or enhancing
- Do NOT change file extensions during minor bug fixes

### **Strict TypeScript Conventions (New Files)**
- Define `interface` or `type` for all component props
- Avoid using `any`; use specific types or `unknown` if necessary
- Ensure `page.tsx` props (params/searchParams) are typed correctly
- Example:

```tsx
// ✅ NEW PAGE - Use .tsx with strict typing
interface PageProps {
  params: {
    id: string;
  };
  searchParams: Record<string, string | string[]>;
}

export default function Page({ params, searchParams }: PageProps) {
  return <div>Page ID: {params.id}</div>;
}
```

```jsx
// ✅ EXISTING PAGE - Keep as .jsx (no forced changes)
export default function OldPage({ params }) {
  return <div>Page ID: {params.id}</div>;
}
```

---

## 📌 Architecture Rules

### **Server Components**
- `page.tsx` and `layout.tsx` are Server Components by default
- Do NOT add interactivity (state/hooks) directly to them
- Import client components from separate `.tsx` files

### **Client Components (New Files)**
- MUST be `.tsx` files
- MUST have `'use client'` explicitly declared at the top
- Isolate client logic into small, reusable components
- Example:

```tsx
// ✅ NEW CLIENT COMPONENT - .tsx with 'use client'
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

### **Server Pages Importing Client Components**
```tsx
// ✅ NEW SERVER PAGE - .tsx (no 'use client')
import { ClientComponent } from '@/components/ClientComponent';

export default function Page() {
  return <ClientComponent title="Counter" />;
}
```

---

## 🚀 Migration Path

| Scenario | Action | File Extension |
|----------|--------|-----------------|
| **Creating a new page** | Follow strict TypeScript conventions | `.tsx` |
| **Creating a new component** | Use client/server patterns, strict typing | `.tsx` |
| **Modifying existing legacy page** | Keep as-is, no forced conversion | `.jsx` |
| **Refactoring existing legacy file** | Prioritize `.tsx` migration | `.tsx` |
| **Creating utilities/helpers** | Strict TypeScript | `.ts` |

---

## ✨ Quick Checklist

- [ ] New page → **Always `.tsx`**
- [ ] Existing page → **Keep `.jsx` unless actively refactoring**
- [ ] New component → **Always `.tsx` with strict types**
- [ ] Server component → **No state or hooks**
- [ ] Client component → **Has `'use client'` at top**
- [ ] Props → **Defined with `interface` or `type`**
- [ ] Avoid `any` → **Use specific types or `unknown`**

---

If unsure, default to **TypeScript (`.tsx`)** for new files and **App Router** patterns.