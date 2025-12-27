# Loanzaar Frontend - Complete Project Map

**Project:** Loanzaar React Frontend  
**Framework:** Next.js 16+ (App Router)  
**Styling:** Tailwind CSS  
**Authentication:** Supabase + Firebase (Legacy)  
**Database:** Prisma + PostgreSQL  
**Generated:** December 24, 2025

---

## 📁 Project Structure Overview

```
loanzaar-react-base/frontend/
├── Configuration Files (Root)
├── db/                 # Database migrations
├── prisma/             # Prisma ORM configuration
├── public/             # Static assets & images
└── src/                # Main application source code
    ├── app/            # Next.js App Router (primary routing)
    ├── components/     # Reusable React components
    ├── config/         # Configuration files (API, Firebase, Supabase)
    ├── context/        # React context providers (Auth, Page Transition, Toast)
    ├── hooks/          # Custom React hooks
    ├── pages/          # Legacy Pages Router (being phased out)
    ├── services/       # API & external service integrations
    ├── types/          # TypeScript type definitions
    └── utils/          # Utility functions & helpers
```

---

## 📄 Root Configuration Files (23 files)

| File | Purpose |
|------|---------|
| `.env` | Environment variables (local) |
| `.env.example` | Environment variables template |
| `.gitignore` | Git ignore rules |
| `.htaccess` | Apache server configuration |
| `eslint.config.js` | ESLint linting rules |
| `index.html` | HTML entry point |
| `jsconfig.json` | JavaScript compiler config with `@/*` alias |
| `MIGRATION_COMPLETE.md` | Documentation of App Router migration |
| `next-env.d.ts` | Next.js TypeScript definitions |
| `next.config.js` | Next.js configuration (Sentry integration) |
| `package.json` | Dependencies & scripts |
| `package-lock.json` | Locked dependency versions |
| `postcss.config.js` | PostCSS configuration (Tailwind) |
| `PRISMA_README.md` | Prisma documentation |
| `README.md` | Project overview |
| `sentry.edge.config.js` | Sentry error tracking (Edge) |
| `sentry.server.config.js` | Sentry error tracking (Server) |
| `STRUCTURE.md` | Project structure documentation |
| `tailwind.config.js` | Tailwind CSS configuration |
| `tsconfig.json` | TypeScript configuration |

---

## 📁 Detailed Directory Structure

### 🗂️ `db/` - Database Migrations
Database migration scripts for version control.

```
db/
├── migrations/
│   ├── 001_create_contact_messages.sql
│   └── 002_create_profiles.sql
```

**Purpose:** Version-controlled database schema changes.

---

### 🗂️ `prisma/` - Prisma ORM Configuration
Database schema and environment setup.

```
prisma/
├── .env.example
└── schema.prisma
```

**Files:**
- `schema.prisma` - Defines database tables, relations, and models
- `.env.example` - Database connection template

---

### 🗂️ `public/` - Static Assets & Images
Publicly accessible files (logos, banners, service workers).

```
public/
├── firebase-messaging-sw.js        # Firebase Cloud Messaging service worker
├── firebase-messaging-sw.disabled.js
├── vite.svg                         # Legacy Vite logo
└── images/
    ├── Gemini_Generated_Image_k25ooak25ooak25o.png
    ├── IMG_20251123_132723.jpg
    ├── loanzaar--logo.avif          # Main app logo
    └── banners/
        ├── IMG_20251123_132723.jpg
        ├── mwebCCMPGenericBanner.png
        ├── webBureauAcquisitionBanner.png
        └── webPLMPGenericBanner.png
```

**Key Assets:**
- `loanzaar--logo.avif` - Main application logo
- `banners/` - Marketing/promotional banners
- `firebase-messaging-sw.js` - Push notifications service worker

---

### 🗂️ `src/` - Application Source Code

#### 📍 `src/app/` - Next.js App Router (Primary Routing)
File-based routing where folder structure = URL structure.

**Root App Files:**
```
src/app/
├── layout.jsx              # Root layout with metadata & providers
├── layout-client.jsx       # Client-side layout wrapper
├── providers.jsx           # Auth context providers (UserAuthProvider, AdminAuthProvider)
├── page-new.jsx            # Home page stub
├── public-layout.jsx       # Public layout reference
├── global-error.jsx        # Global error boundary
├── loading.js              # Global loading state
├── loading.jsx             # Global loading component
├── robots.js               # SEO robots.txt
├── sitemap.js              # SEO sitemap generation
```

**Route Groups & Pages:**

##### 🔐 `(auth)/` - Authentication Routes (with NavBar + SessionManager)
Login, signup, and password recovery pages with user session timeout.

```
(auth)/
├── layout.jsx              # Auth layout with NavBar, SessionManager
├── signin/
│   └── page.jsx           # User sign-in page
├── signup/
│   └── page.jsx           # User registration
├── forgot-password/
│   └── page.jsx           # Password recovery
├── finish-signup/
│   └── page.jsx           # Signup flow continuation
└── complete-profile/
    └── page.jsx           # Profile completion step
```

##### 🌍 `(public)/` - Public Routes (with NavBar, Footer, BottomNav)
All publicly accessible pages without authentication.

```
(public)/
├── layout.jsx              # Public layout with NavBar, Footer, BottomNav, StickyCalculator
├── page.jsx                # Home page (/ route)
├── check-cibil-score/
│   └── page.jsx           # CIBIL score check tool
├── cibil-score-checker/
│   └── page.jsx           # Alternative CIBIL checker
├── contact-us/
│   └── page.jsx           # Contact form
├── credit-cards/
│   └── page.jsx           # Credit cards listing
└── emi-calculator/
    ├── page.jsx
    └── Client.jsx         # EMI calculator client component
```

##### 💰 `loans/` - Loan Product Pages
All loan application pages organized by loan type.

```
loans/
├── personal-loan/
│   └── page.jsx           # Personal loan application
├── home-loan/
│   └── page.jsx           # Home loan application
├── business-loan/
│   └── page.jsx           # Business loan application
├── car-loan/
│   ├── page.jsx           # Car loan landing
│   ├── new/
│   │   └── page.jsx       # New car loan
│   ├── used/
│   │   └── page.jsx       # Used car loan
│   └── refinance/
│       └── page.jsx       # Car refinance loan
├── loan-against-property/
│   └── page.jsx           # LAP application
├── machinery-loan/
│   └── page.jsx           # Machinery loan
├── education-loan/
│   ├── page.jsx           # Education loan (server page with metadata)
│   └── EducationLoanClient.jsx  # Education loan UI (client component)
├── gold-loan/
│   └── page.jsx           # Gold loan
└── solar-loan/
    └── page.jsx           # Solar loan
```

##### 🛡️ `insurance/` - Insurance Product Pages
All insurance product pages.

```
insurance/
├── all-insurance/
│   └── page.jsx           # All insurance types listing
├── life-insurance/
│   └── page.jsx           # Life insurance application
├── health-insurance/
│   └── page.jsx           # Health insurance application
└── general-insurance/
    └── page.jsx           # General insurance application
```

##### 📊 `dashboard/` - User Dashboard (with BasicLayout sidebar)
User account management, applications, and profile pages.

```
dashboard/
├── layout.jsx             # Dashboard layout with BasicLayout sidebar
├── page.jsx               # Dashboard home (redirects to /account)
├── page-backup.jsx        # Backup
├── layout-old.jsx.old     # Old layout (deprecated)
├── applications/
│   ├── page.jsx           # View loan applications
│   └── page-backup.jsx
├── apply-loan/
│   ├── page.jsx           # Apply for new loan
│   └── page-backup.jsx
├── insurance/
│   ├── page.jsx           # Insurance dashboard
│   └── page-backup.jsx
├── profile/
│   ├── page.jsx           # User profile settings
│   └── page-backup.jsx
├── support/
│   ├── page.jsx           # Support tickets & chat
│   └── page-backup.jsx
├── my-loans/
│   └── page.jsx           # View active loans
├── my-insurance/
│   └── page.jsx           # View insurance policies
├── apply-insurance/
│   └── page.jsx           # Apply for insurance
├── my-cards/
│   └── page.jsx           # View credit cards
├── security/
│   └── page.jsx           # Account security settings
├── settings/
│   └── page.jsx           # Dashboard preferences
└── help/
    └── page.jsx           # Help & FAQs
```

##### 👨‍💼 `admin/` - Admin Routes (SessionManager only, no public UI)
Admin-only pages with session timeout (no NavBar/Footer).

```
admin/
├── layout.jsx             # Admin layout with SessionManager only
├── page.jsx               # Admin home
├── login/
│   └── page.jsx           # Admin login
├── signup/
│   └── page.jsx           # Admin registration
├── dashboard/
│   └── page.jsx           # Admin dashboard
├── settings/
│   └── page.jsx           # Admin settings
├── forgot-password/
│   └── page.jsx           # Admin password recovery
└── layout.jsx.old         # Deprecated layout
```

##### 🔗 Other Routes
```
src/app/
├── [[...slug]]/
│   └── client.jsx         # Catch-all dynamic route handler
├── api/
│   ├── contact/
│   │   └── route.js       # Contact form API endpoint
│   └── sentry-example-api/
│       └── route.js       # Sentry example endpoint
├── auth/
│   └── callback/
│       └── page.jsx       # Supabase auth callback
├── education-loan/
│   └── page.tsx           # Top-level education loan alias (redirects to /loans/education-loan)
├── home-loan/
│   └── page.jsx           # Top-level home loan route
├── personal-loan/
│   └── page.jsx           # Top-level personal loan route
├── sentry-example-page/
│   └── page.jsx           # Sentry error tracking example
├── profile/               # Empty profile route folder
└── signin/                # Empty signin route folder
```

---

#### 🧩 `src/components/` - Reusable Components (26 files)

| Component | Purpose |
|-----------|---------|
| `NavBar.jsx` | Top navigation bar with dropdowns and user menu |
| `Footer.jsx` | Footer with company info and links |
| `BottomNav.jsx` | Mobile bottom navigation bar |
| `BasicLayout.jsx` | Dashboard wrapper with sidebar |
| `SessionManager.jsx` | Session timeout management (30-min auto-logout) |
| `ScrollToTop.jsx` | Scroll to top on route change |
| `StickyCalculator.jsx` | Floating EMI calculator widget |
| `Meta.jsx` | SEO meta tags management |
| `StructuredData.jsx` | Schema.org structured data (JSON-LD) |
| `LoanCard.jsx` | Loan product card component |
| `LoanFormComponent.jsx` | Reusable loan application form |
| `EMICalculatorModal.jsx` | EMI calculator modal |
| `EMIDonutChart.jsx` | Donut chart for EMI visualization |
| `PageSkeleton.jsx` | Loading skeleton placeholder |
| `LoadingSpinner.jsx` | Loading spinner animation |
| `Skeleton.jsx` | Generic skeleton loader |
| `Skeletons.jsx` | Multiple skeleton loaders |
| `AppWithLoader.jsx` | App wrapper with loading state |
| `ProtectedUserRoute.jsx` | Route protection wrapper |
| `PageTransitionOverlay.jsx` | Page transition animation |
| `RouteTransitionOverlay.jsx` | Route change animation |
| `PullToRefreshWrapper.jsx` | Pull-to-refresh gesture handler |
| `SignInSheet.jsx` | Sign-in modal/sheet |
| `UserSupportChat.jsx` | User support chat interface |
| `UserSupportChat.backup.jsx` | Backup of support chat |
| `InsuranceApplicationsTab.jsx` | Insurance applications tab |

---

#### ⚙️ `src/config/` - Configuration Files (6 files)

| File | Purpose |
|------|---------|
| `api.js` | API endpoints and HTTP client configuration |
| `collectionConfig.js` | Postman collection configuration |
| `firebase.js` | Firebase initialization and config |
| `firebase.js.old` | Legacy Firebase config (deprecated) |
| `supabase.js` | Supabase client initialization |
| `supabaseClient.js` | Alternative Supabase client setup |

---

#### 🌐 `src/context/` - React Context Providers (4 files)

| File | Purpose |
|------|---------|
| `UserAuthContext.jsx` | User authentication state & methods (login, logout, user profile) |
| `AdminAuthContext.jsx` | Admin authentication state (separate from user auth) |
| `PageTransitionContext.jsx` | Page transition animation state |
| `ToastContext.jsx` | Toast notification state & methods |

---

#### 🎣 `src/hooks/` - Custom React Hooks (5 files)

| Hook | Purpose |
|------|---------|
| `useAutoLogout.js` | Auto-logout on user inactivity (30-min timeout) |
| `useAdminAutoLogout.js` | Auto-logout for admin on inactivity |
| `useEMICalculator.js` | EMI calculation logic (principal, rate, tenure) |
| `usePageTransition.js` | Page transition animation trigger |
| `useSticky.js` | Sticky element positioning (StickyCalculator, etc.) |

---

#### 📄 `src/pages/` - Legacy Pages Router (Being Phased Out)
These are legacy component implementations being migrated to `src/app/`. They are still imported via dynamic imports in `src/app/**/page.jsx` files.

```
src/pages/
├── _app.jsx                          # [DEPRECATED] Pages Router entry
├── _error.jsx                        # [DEPRECATED] Pages Router error boundary
├── HomePage.jsx                      # Home page component
├── PersonalLoanFormPage.jsx         # Personal loan form
├── HomeLoanPage.jsx                 # Home loan form
├── BusinessLoanFormPage.jsx         # Business loan form
├── CarLoanFormPage.jsx              # Car loan form
├── NewCarLoanFormPage.jsx           # New car loan form
├── UsedCarLoanFormPage.jsx          # Used car loan form
├── CarRefinanceFormPage.jsx         # Car refinance form
├── LoanAgainstPropertyPage.jsx      # LAP form
├── MachineryLoanPage.jsx            # Machinery loan form
├── EducationLoanPage.jsx            # Education loan form
├── GoldLoanFormPage.jsx             # Gold loan form
├── SolarLoanPage.jsx                # Solar loan form
├── AllInsurancePage.jsx             # Insurance products listing
├── LifeInsurancePage.jsx            # Life insurance form
├── HealthInsurancePage.jsx          # Health insurance form
├── GeneralInsurancePage.jsx         # General insurance form
├── SignInPage.jsx                   # Sign-in page
├── SignUpPage.jsx                   # Sign-up page
├── ForgotPasswordPage.jsx           # Password recovery
├── FinishSignUpPage.jsx             # Signup completion
├── CompleteProfilePage.jsx          # Profile setup
├── CheckCibilScorePage.jsx          # CIBIL check tool
├── CibilScoreCheckerPage.jsx        # Alternative CIBIL checker
├── CreditCardsPage.jsx              # Credit cards listing
├── ContactUsPage.jsx                # Contact form
├── account.jsx                       # User account page
├── ContactMessagesPage.jsx          # Contact message history
├── CreateApplicationPage.jsx        # Create new application
├── DSADashboardPage.jsx             # DSA dashboard
├── InsuranceApplicationsPage.jsx    # Insurance applications
├── LoanApplicationsPage.jsx         # Loan applications
├── SupportPage.jsx                  # Support/help page
├── TrackPage.jsx                    # Application tracking
├── ProductsPage.jsx                 # Products page
├── PropertyLoanFormPage.jsx         # Property loan form
├── products.jsx                     # Products (alternative)
├── profile.jsx                      # User profile
├── support.jsx                      # Support (alternative)
├── track.jsx                        # Track (alternative)
└── skeleton-example.jsx             # Example skeleton component
```

**Status:** These files are component implementations that are being gradually integrated into `src/app/**/page.jsx` files (like we did with EducationLoanClient.jsx). Once all are migrated, `src/pages/` can be fully removed.

---

#### 🔌 `src/services/` - API & Service Integrations (8 files)

| Service | Purpose |
|---------|---------|
| `authService.js` | Authentication business logic |
| `supabaseAuthService.js` | Supabase authentication API calls |
| `firebaseAuthService.js.OLD` | Legacy Firebase auth (deprecated) |
| `firebaseAuthApi.js` | Firebase auth API wrapper |
| `supabaseService.js` | Firestore database operations |
| `firebaseMessaging.js` | Firebase Cloud Messaging (push notifications) |
| `adminDashboardService.js` | Admin dashboard data & operations |
| `useFCM.js` | FCM (Firebase Cloud Messaging) hook |
| `supabaseTokenHelper.js` | Supabase token refresh & management |

---

#### 🎨 `src/utils/` - Utility Functions & Helpers (5 files)

| File | Purpose |
|------|---------|
| `schema.js` | JSON-LD schema generators (loans, insurance, etc.) |
| `emiCalculations.js` | EMI calculation formulas |
| `phone.js` | Phone number parsing/formatting |
| `transitionOverlay.js` | Page transition animations |
| `firebaseTokenHelper.js.OLD` | Legacy Firebase token helper (deprecated) |
| `SCHEMA_README.md` | Schema documentation |

---

#### 📝 `src/types/` - TypeScript Definitions (1 file)

| File | Purpose |
|------|---------|
| `global.d.ts` | Global TypeScript type definitions |

---

#### 🎨 `src/assets/` - Images & Assets (1 file)

| File | Purpose |
|------|---------|
| `react.svg` | React logo |

---

#### 📑 `src/` Root Files (4 files)

| File | Purpose |
|------|---------|
| `App.css` | Global CSS styles |
| `index.css` | Index styles (Tailwind imports) |
| `instrumentation.js` | Application instrumentation/monitoring |
| `instrumentation-client.js` | Client-side instrumentation |

---

## 🔑 Key Directory Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/app/` | 60+ | Next.js App Router (primary routing system) |
| `src/components/` | 26 | Reusable UI components |
| `src/pages/` | 43 | Legacy component implementations (being phased out) |
| `src/services/` | 8 | External API integrations |
| `src/context/` | 4 | Global state management (Auth, Notifications) |
| `src/hooks/` | 5 | Custom React hooks |
| `src/config/` | 6 | Configuration for APIs and services |
| `src/utils/` | 5 | Helper functions and utilities |
| `public/` | Multiple | Static assets (logo, banners, service workers) |
| `db/` | 2 | Database migrations |

---

## 🚀 Active Routing System

**Status:** Pure Next.js App Router (Migration Complete ✅)

- ✅ Manual routing from `src/App.jsx` removed
- ✅ Pages Router entry `src/pages/_app.jsx` and `_error.jsx` removed
- ✅ All routes defined via file structure under `src/app/`
- ✅ Route groups `(public)`, `(auth)`, `admin`, `dashboard` configured
- ✅ Proper layout nesting per route group

---

## 📊 File Count Summary

| Category | Count |
|----------|-------|
| App Router Pages | 60+ |
| Components | 26 |
| Legacy Pages | 43 |
| Config Files | 6 |
| Context Providers | 4 |
| Custom Hooks | 5 |
| Services | 8 |
| Utilities | 5 |
| **Total Source Files** | **~160+** |
| Config Files (Root) | 23 |
| **Grand Total** | **~183+** |

---

## 🔗 Navigation Map

```
HOME (/)
├── PUBLIC ROUTES (via (public) layout)
│   ├── Personal Loan (/personal-loan)
│   ├── Home Loan (/home-loan)
│   ├── Business Loan (/business-loan)
│   ├── All Loan Types (/loans/*)
│   ├── Insurance (/insurance/*)
│   ├── Check CIBIL Score (/check-cibil-score)
│   ├── Credit Cards (/credit-cards)
│   ├── EMI Calculator (/emi-calculator)
│   └── Contact Us (/contact-us)
│
├── AUTH ROUTES (via (auth) layout with SessionManager)
│   ├── Sign In (/signin)
│   ├── Sign Up (/signup)
│   ├── Forgot Password (/forgot-password)
│   ├── Finish Sign Up (/finish-signup)
│   └── Complete Profile (/complete-profile)
│
├── USER DASHBOARD (/dashboard/*)
│   ├── Applications
│   ├── Apply Loan
│   ├── Insurance
│   ├── My Loans
│   ├── My Insurance
│   ├── Apply Insurance
│   ├── My Cards
│   ├── Security
│   ├── Profile
│   ├── Settings
│   ├── Help
│   └── Support
│
└── ADMIN ROUTES (/admin/*)
    ├── Login (/admin/login)
    ├── Signup (/admin/signup)
    ├── Dashboard (/admin/dashboard)
    ├── Settings (/admin/settings)
    └── Forgot Password (/admin/forgot-password)
```

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| `README.md` | Project overview & getting started |
| `STRUCTURE.md` | Project structure documentation |
| `MIGRATION_COMPLETE.md` | App Router migration details |
| `PRISMA_README.md` | Prisma ORM documentation |
| `PROJECT_MAP.md` | This file - complete project mapping |

---

## 🛠️ Environment & Configuration

**Tech Stack:**
- Next.js 16+ (App Router)
- React 19+ (Client & Server components)
- Tailwind CSS (Styling)
- Supabase (Primary auth & database)
- Firebase (Legacy, being phased out)
- Prisma (ORM)
- Sentry (Error tracking)
- Lucide React (Icons)

**Required Environment Variables:**
- `NEXT_PUBLIC_SITE_URL` - Base URL for SEO and redirects
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key (server-only)
- Firebase credentials (if using Firebase features)

---

## ✅ Migration Status

### Completed
- ✅ App Router structure created (`src/app/` with 60+ pages)
- ✅ Route groups configured (`(public)`, `(auth)`, `admin`, `dashboard`)
- ✅ Layouts created per route group with proper UI composition
- ✅ `src/App.jsx` (manual router) archived
- ✅ `src/pages/_app.jsx` and `_error.jsx` removed
- ✅ Session management integrated at layout level
- ✅ Education Loan page migrated as example

### In Progress
- 🔄 Migrating remaining Pages Router components to App Router
- 🔄 Removing legacy dynamic imports (replacing with direct imports)

### Pending
- ⏸️ Remove or refactor `src/pages/*` component files
- ⏸️ Consolidate dashboard pages
- ⏸️ Add per-route error boundaries

---

**Last Updated:** December 24, 2025  
**App Router Status:** ✅ Pure Next.js App Router (No manual routing)  
**Pages Router Status:** Removed (migration complete)
