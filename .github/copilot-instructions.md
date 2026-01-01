# GitHub Copilot Instructions – Loanzaar Frontend

**Last Updated:** 2026-01-01  
**Project:** Loanzaar Frontend  
**Framework:** Next.js (App Router)

---

## 🤖 Machine-Readable Configuration

{
  "project": {
    "name": "Loanzaar Frontend",
    "framework": "Next.js",
    "routerType": "App Router",
    "pagesRouterDeprecated": true,
    "typescriptOnly": true
  },
  "rules": {
    "routing": {
      "enabled": true,
      "routerType": "App Router",
      "rootDirectory": "src/app/",
      "routeGroups": ["(public)", "(auth)", "dashboard", "admin"],
      "forbidden": ["src/pages/", "Pages Router APIs"]
    },
    "fileExtensions": {
      "pages": ".tsx",
      "layouts": ".tsx",
      "uiComponents": ".tsx",
      "clientComponents": ".tsx",
      "utilities": ".ts",
      "helpers": ".ts",
      "forbidden": [".js", ".jsx"]
    },
    "typescript": {
      "required": true,
      "strictMode": true,
      "noImplicitAny": true,
      "interfaceRequired": true,
      "explicitTyping": true,
      "examplePageProps": {
        "params": "{ id: string }",
        "searchParams": "Record<string, string | string[]>"
      }
    },
    "components": {
      "serverComponentsDefault": true,
      "serverComponentsLocations": ["page.tsx", "layout.tsx"],
      "serverComponentsConstraints": ["no browser APIs", "data fetching only", "composition"],
      "clientComponentsMarker": "'use client'",
      "clientComponentsUsage": "state, effects, events, interactivity"
    },
    "prisma": {
      "editableFiles": ["prisma/schema.prisma"],
      "allowedChanges": ["models", "fields", "relations", "enums", "indexes"],
      "forbiddenEdits": ["prisma/migrations/**", "direct db pushes"],
      "migrationWorkflow": "npx prisma migrate dev --name [migration_name]",
      "database": "postgresql (Supabase)",
      "readOnly": true
    },
    "architecture": {
      "separation": "route groups",
      "layouts": "minimal and compositional",
      "componentPreference": "Server Components (unless interactivity required)",
      "businessLogic": "typed utilities",
      "databaseLogic": "schema.prisma aligned"
    }
  },
  "checklist": {
    "routing": "App Router only (src/app/)",
    "fileTypes": "All new files TypeScript",
    "clientMarking": "'use client' on interactive components",
    "typing": "Strict typing everywhere (no any)",
    "prisma": "Edit schema.prisma only + npx prisma migrate dev --name [name]",
    "migrations": "Never manually edit or create + NEVER use db push",
    "pagesRouter": "Never use or suggest",
    "database": "Supabase PostgreSQL - use migrations only"
  },
  "defaultActions": {
    "whenInDoubt": "App Router + TypeScript + schema.prisma + migrate dev",
    "migrations": "Always npx prisma migrate dev --name [descriptive_name]",
    "interactivity": "Use Client Components ('use client')",
    "dataFetching": "Use Server Components"
  }
}

---

## ✅ ALLOWED ACTIONS

### Routing
- ✅ Create routes in `src/app/`
- ✅ Use route groups: `(public)`, `(auth)`, `dashboard`, `admin`
- ✅ Create `page.tsx` and `layout.tsx` files
- ✅ Use Next.js App Router patterns

### Files & Extensions
- ✅ Create `.tsx` files for: pages, layouts, components, client components
- ✅ Create `.ts` files for: utilities, helpers, services
- ✅ Use TypeScript for all new files

### TypeScript
- ✅ Define interfaces/types for all props
- ✅ Use explicit typing (avoid `any`)
- ✅ Type `params` and `searchParams` in `page.tsx`
- ✅ Define `PageProps` interface for page components

### Components
- ✅ Keep `page.tsx` and `layout.tsx` as Server Components (default)
- ✅ Mark interactive components with `'use client'`
- ✅ Import Client Components into Server Components

### Database (Prisma + Supabase PostgreSQL)
- ✅ **Edit `prisma/schema.prisma` for ALL DB changes**
- ✅ Add models, fields, relations, enums, indexes in schema
- ✅ **Run migrations via: `npx prisma migrate dev --name [descriptive_name]`**
- ✅ Generate Prisma Client: `npx prisma generate`

---

## ❌ FORBIDDEN ACTIONS

### Routing
- ❌ Create `src/pages/` directory
- ❌ Use Pages Router concepts: `getStaticProps`, `getServerSideProps`, `_app.js`, `_document.js`
- ❌ Generate routes outside `src/app/`

### Files & Extensions
- ❌ Suggest `.js` or `.jsx` files
- ❌ Create new `.js` or `.jsx` files
- ❌ Use non-TypeScript for new work

### Components
- ❌ Use browser APIs (hooks, DOM) in Server Components
- ❌ Forget to mark Client Components with `'use client'`
- ❌ Use `getStaticProps` or `getServerSideProps`

### Database (CRITICAL - Supabase PostgreSQL)
- ❌ **NEVER use `npx prisma db push`** - **DESTROYS Supabase tables**
- ❌ Edit files inside `prisma/migrations/**`
- ❌ Create new migration folders or SQL files
- ❌ Manually modify generated migration SQL
- ❌ Suggest direct fixes in migration files
- ⚠️ **TREAT MIGRATION FILES AS READ-ONLY**
- ⚠️ **ALWAYS use `npx prisma migrate dev --name [name]` for schema changes**

---

## 🚨 DATABASE SAFETY RULES (SUPABASE)

| Action | ✅ Correct | ❌ NEVER DO |
|--------|-----------|------------|
| **Schema Changes** | `npx prisma migrate dev --name add_user_model` | `npx prisma db push` |
| **Prisma Client** | `npx prisma generate` | Manual table edits |
| **Production** | `npx prisma migrate deploy` | Direct SQL in Supabase |
| **File Edits** | `prisma/schema.prisma` only | `prisma/migrations/**` |

**Why `db push` is dangerous:**
- Overwrites Supabase tables without version control
- Destroys existing data and relations
- No migration history tracking
- Breaks team collaboration

---

## 📋 IMPLEMENTATION EXAMPLES

### Typed Server Page

// src/app/(auth)/login/page.tsx

interface PageProps {
  params: { step?: string };
  searchParams: Record<string, string | string[]>;
}

export default function LoginPage({ params, searchParams }: PageProps) {
  return (
    <div>
      <h1>Login</h1>
      {/* Page content */}
    </div>
  );
}

### Client Component with State

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
    // Handle login
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

### Server Page Importing Client Component

// src/app/(auth)/layout.tsx

import { LoginForm } from '@/components/LoginForm';

export default function AuthLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div>
      <header>Loanzaar</header>
      <LoginForm onSuccess={() => console.log('Logged in')} />
      {children}
    </div>
  );
}

### Prisma Schema Edit + Migration (CORRECT WAY)

// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  loans Loan[]
}

model Loan {
  id     Int      @id @default(autoincrement())
  userId Int
  user   User     @relation(fields: [userId], references: [id])
  amount Float
}

**After editing schema.prisma:**
npx prisma migrate dev --name init_user_loan_models
npx prisma generate

---

## 🚀 ARCHITECTURE PATTERNS

| Pattern | Guideline |
|---------|-----------|
| **Route Organization** | Use route groups: `(public)`, `(auth)`, `dashboard`, `admin` |
| **Layout Strategy** | Minimal layouts; compose with smaller components |
| **Component Defaults** | Server Components first; Client Components only for interactivity |
| **State Management** | Client Components for state; Server Components for data |
| **Business Logic** | Typed utility functions (`.ts` files) |
| **Database Changes** | `schema.prisma` → `migrate dev --name [name]` → `generate` |

---

## ✨ FINAL CHECKLIST

Before generating code, verify:

- [ ] **App Router only** (`src/app/`)
- [ ] **No Pages Router APIs** (`getStaticProps`, etc.)
- [ ] **All new files TypeScript** (`.tsx`/`.ts`)
- [ ] **Client Components marked** `'use client'`
- [ ] **Strict typing everywhere** (no `any`)
- [ ] **Prisma: schema.prisma + `migrate dev --name`** 
- [ ] **NEVER `db push`** - Supabase safety
- [ ] **Migration files READ-ONLY**
- [ ] **Server Components for data fetching**

---

## 💡 DEFAULT BEHAVIORS

| Scenario | Default Action |
|----------|----------------|
| **Uncertain routing** | App Router + `src/app/` |
| **Store data in DB** | Edit `schema.prisma` → `npx prisma migrate dev --name [name]` |
| **Component needs state** | `'use client'` + React hooks |
| **Render-only component** | Server Component (no `'use client'`) |
| **New route** | `src/app/[group]/[route]/page.tsx` |
| **Shared utilities** | `.ts` in `src/lib/` or `src/utils/` |

---

## 🔗 Quick Reference

✅ ALLOWED:                  ❌ FORBIDDEN:
✅ src/app/                  ❌ src/pages/
✅ .tsx/.ts files            ❌ .js/.jsx files
✅ 'use client'              ❌ Pages Router APIs
✅ schema.prisma             ❌ prisma/migrations/**
✅ migrate dev --name [name] ❌ prisma db push (DESTROYS TABLES)
✅ App Router                ❌ getStaticProps
✅ TypeScript                ❌ Non-typed code

---

## 📞 Need Help?

**When in doubt:**
1. Check JSON config above
2. **Default:** App Router + TypeScript + `migrate dev --name`
3. **Supabase Safety:** NEVER `db push`
4. Reference examples for exact patterns

**Generated for:** Loanzaar Frontend  
**Framework:** Next.js 14+ (App Router)  
**Database:** Supabase PostgreSQL (migrations only)