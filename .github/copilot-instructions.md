# GitHub Copilot Instructions – Loanzaar Frontend

**Last Updated:** 2026-01-01  
**Project:** Loanzaar Frontend  
**Framework:** Next.js (App Router)  
**Database:** Supabase PostgreSQL

---

## 🤖 Machine-Readable Configuration

```json
{
  "project": {
    "name": "Loanzaar Frontend",
    "framework": "Next.js",
    "routerType": "App Router",
    "typescriptOnly": true
  },
  "rules": {
    "routing": {
      "rootDirectory": "src/app/",
      "routeGroups": ["(public)", "(auth)", "dashboard", "admin"],
      "forbidden": ["src/pages/", "Pages Router APIs"]
    },
    "fileExtensions": {
      "pages": ".tsx",
      "components": ".tsx",
      "utilities": ".ts",
      "forbidden": [".js", ".jsx"]
    },
    "typescript": {
      "required": true,
      "strictMode": true,
      "noImplicitAny": true
    },
    "prisma": {
      "editableFiles": ["prisma/schema.prisma"],
      "forbidden": ["prisma/migrations/**", "npx prisma db push"],
      "migrationWorkflow": "npx prisma migrate dev --name [descriptive_name]"
    }
  },
  "documentation": {
    "prohibited": [
      "PROJECT_OVERVIEW.md",
      "STRUCTURE.md",
      "QUICK_START.md",
      "ARCHITECTURE.md",
      "SETUP_GUIDE.md",
      "GETTING_STARTED.md",
      "README_*.md"
    ],
    "rule": "NO auto-generated documentation files. Code is self-documenting."
  }
}
```

---

## ✅ WHAT TO DO

### Routing
- ✅ Create routes in `src/app/` only
- ✅ Use route groups: `(public)`, `(auth)`, `dashboard`, `admin`
- ✅ Create `page.tsx` and `layout.tsx` files
- ✅ Example: `src/app/(auth)/login/page.tsx`

### Files & Extensions
- ✅ All new files are `.tsx` (pages, layouts, components) or `.ts` (utilities)
- ✅ No `.js` or `.jsx` files ever
- ✅ Utilities go in `src/lib/` or `src/utils/`

### TypeScript
- ✅ Strict typing everywhere (no `any`)
- ✅ Define `PageProps` interface for pages
- ✅ Type all function parameters and returns
- ✅ Example:
  ```tsx
  interface PageProps {
    params: { id: string };
    searchParams: Record<string, string | string[]>;
  }
  ```

### Components
- ✅ Server Components by default (pages, layouts)
- ✅ Mark interactive components with `'use client'`
- ✅ Import Client Components into Server Components

### Database (Prisma + Supabase)
- ✅ Edit `prisma/schema.prisma` for all DB changes
- ✅ Add models, fields, relations, enums
- ✅ Run: `npx prisma migrate dev --name [descriptive_name]`
- ✅ Then: `npx prisma generate`

---

## ❌ WHAT NOT TO DO

### Routing
- ❌ Never create `src/pages/`
- ❌ Never use `getStaticProps`, `getServerSideProps`, `_app.js`, `_document.js`
- ❌ Never route outside `src/app/`

### Files
- ❌ Never suggest `.js` or `.jsx` files
- ❌ Never generate useless documentation files
- ❌ Never create: `PROJECT_OVERVIEW.md`, `STRUCTURE.md`, `QUICK_START.md`, `ARCHITECTURE.md`, `SETUP_GUIDE.md`, `GETTING_STARTED.md`, or any other non-functional markdown files

### Components
- ❌ Never use browser APIs (hooks, DOM) in Server Components
- ❌ Never forget `'use client'` on interactive components
- ❌ Never use Pages Router patterns

### Database (CRITICAL)
- ❌ **NEVER use `npx prisma db push`** – Destroys Supabase tables
- ❌ **NEVER edit files in `prisma/migrations/**`**
- ❌ **NEVER manually create migration SQL files**
- ❌ **NEVER suggest direct SQL edits in Supabase**

---

## 🚨 Supabase Safety (Non-Negotiable)

| Action | ✅ DO THIS | ❌ NEVER DO THIS |
|--------|-----------|-----------------|
| **Schema Changes** | `npx prisma migrate dev --name add_user_model` | `npx prisma db push` |
| **After Schema Edit** | `npx prisma generate` | Manual table edits |
| **Production Deploy** | `npx prisma migrate deploy` | Direct SQL in Supabase console |
| **File Edits** | `prisma/schema.prisma` only | `prisma/migrations/**` |

**Why:** `db push` overwrites tables, destroys data, breaks collaboration, loses migration history.

---

## 📋 Code Examples (Reference Only)

### Typed Server Page
```tsx
// src/app/(auth)/login/page.tsx
interface PageProps {
  params: { step?: string };
  searchParams: Record<string, string | string[]>;
}

export default function LoginPage({ params, searchParams }: PageProps) {
  return <div><h1>Login</h1></div>;
}
```

### Client Component with State
```tsx
// src/components/LoginForm.tsx
'use client';
import { useState } from 'react';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Server Page + Client Component
```tsx
// src/app/(auth)/layout.tsx
import { LoginForm } from '@/components/LoginForm';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>Loanzaar</header>
      <LoginForm onSuccess={() => console.log('Logged in')} />
      {children}
    </div>
  );
}
```

### Prisma Schema + Migration
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  loans Loan[]
}

model Loan {
  id     Int  @id @default(autoincrement())
  userId Int
  user   User @relation(fields: [userId], references: [id])
  amount Float
}
```

**Then run:**
```bash
npx prisma migrate dev --name init_user_loan_models
npx prisma generate
```

---

## 🎯 Architecture Defaults

| Scenario | Default |
|----------|---------|
| Uncertain about routing | App Router + `src/app/` |
| Need database changes | Edit `schema.prisma` → `migrate dev --name [name]` → `generate` |
| Component needs state | `'use client'` + React hooks |
| Component is render-only | Server Component (no `'use client'`) |
| New route | `src/app/[group]/[route]/page.tsx` |
| Shared utilities | `.ts` in `src/lib/` or `src/utils/` |

---

## ✨ Pre-Code Checklist

Before writing ANY code:

- [ ] App Router only (`src/app/`)
- [ ] No Pages Router APIs
- [ ] All files are `.tsx` or `.ts`
- [ ] Client Components marked `'use client'`
- [ ] All types are explicit (no `any`)
- [ ] Database: `schema.prisma` + `migrate dev --name [name]`
- [ ] NO `db push` – ever
- [ ] Migration files are read-only
- [ ] NO useless markdown files (no OVERVIEW, STRUCTURE, QUICK_START, etc.)

---

## 🔗 Quick Reference

```
✅ ALLOWED                          ❌ FORBIDDEN
✅ src/app/                         ❌ src/pages/
✅ .tsx / .ts                       ❌ .js / .jsx
✅ 'use client'                     ❌ getStaticProps
✅ schema.prisma                    ❌ prisma/migrations/**
✅ migrate dev --name [name]        ❌ prisma db push (DESTROYS DATA)
✅ TypeScript strict mode           ❌ any types
✅ Server Components default        ❌ Non-typed code
✅ Code only                        ❌ Auto-gen documentation files
```

---

## 💡 When Copilot Asks "Should I generate docs?"

**Answer: NO.**

- ❌ Don't generate `PROJECT_OVERVIEW.md`
- ❌ Don't generate `STRUCTURE.md`
- ❌ Don't generate `QUICK_START.md`
- ❌ Don't generate `ARCHITECTURE.md`
- ❌ Don't generate `SETUP_GUIDE.md`
- ❌ Don't generate `GETTING_STARTED.md`
- ❌ Don't generate any "helpful" markdown files

**Code is self-documenting.** Write clean, typed code. That's the documentation.

---

## 📞 When In Doubt

1. Check the JSON config above
2. Default: **App Router + TypeScript + `migrate dev --name [name]`**
3. Supabase Safety: **NEVER `db push`**
4. Documentation: **Code only, no markdown bloat**
5. Reference examples above for exact patterns

---

**Project:** Loanzaar Frontend  
**Framework:** Next.js 14+ (App Router)  
**Database:** Supabase PostgreSQL  
**Philosophy:** Code > Documentation. Efficiency > Bloat.