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
- App Router main groups: src/app/(public), src/app/(auth), src/app/(loans), src/app/account, src/app/admin
- API routes (App Router): src/app/api/
- Legacy Pages Router (archive until migration complete): src/pages/ and _archive/

## Project map (2025-12-24)

```
frontend/
- .env
- .env.example
- .gitignore
- .htaccess
+ db
  + migrations
    - 001_create_contact_messages.sql
    - 002_create_profiles.sql
- eslint.config.js
- index.html
- jsconfig.json
- next-env.d.ts
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
+ prisma
  - .env.example
  - schema.prisma
+ public
  - firebase-messaging-sw.disabled.js
  - firebase-messaging-sw.js
  + images
    + banners
      - IMG_20251123_132723.jpg
      - mwebCCMPGenericBanner.png
      - webBureauAcquisitionBanner.png
      - webPLMPGenericBanner.png
    - Gemini_Generated_Image_k25ooak25ooak25o.png
    - IMG_20251123_132723.jpg
    - loanzaar--logo.avif
  - vite.svg
- README.md
- sentry.edge.config.js
- sentry.server.config.js
+ src
  + app
    + (auth)
      + complete-profile
        - page.jsx
      + finish-signup
        - page.jsx
      + forgot-password
        - page.jsx
      + signin
        - page.jsx
      + signup
        - page.jsx
    + (public)
      + check-cibil-score
        - page.jsx
      + cibil-score-checker
        - page.jsx
      + contact-us
        - page.jsx
      + credit-cards
        - page.jsx
      + emi-calculator
        - Client.jsx
        - page.jsx
      - page.jsx
    + [[...slug]]
      - client.jsx
    + admin
      - layout.jsx.old
      - page.jsx
    + api
      + contact
        - route.js
      + sentry-example-api
        - route.js
    + auth
      + callback
        - page.jsx
    + business-loan
      - page.jsx
    + dashboard
      + applications
        - page.jsx
      + apply-loan
        - page.jsx
      + insurance
        - page.jsx
      - layout.jsx
      - page.jsx
      + profile
        - page.jsx
      + support
        - page.jsx
    - global-error.jsx
    + insurance
      + all-insurance
        - page.jsx
      + general-insurance
        - page.jsx
      + health-insurance
        - page.jsx
      + life-insurance
        - page.jsx
    - layout-client.jsx
    - layout.jsx
    - loading.js
    - loading.jsx
    + loans
      + business-loan
        - page.jsx
      + car-loan
        + new
          - page.jsx
        - page.jsx
        + refinance
          - page.jsx
        + used
          - page.jsx
      + education-loan
        - page.jsx
      + gold-loan
        - page.jsx
      + home-loan
        - page.jsx
      + loan-against-property
        - page.jsx
      + machinery-loan
        - page.jsx
      + personal-loan
        - page.jsx
      + solar-loan
        - page.jsx
    + profile
    - providers.jsx
    - robots.js
    + sentry-example-page
      - page.jsx
    + signin
    - sitemap.js
  + archive
    - UserDashboardLayout.jsx
  + assets
    - react.svg
  + components
    - AppWithLoader.jsx
    - BasicLayout.jsx
    - BottomNav.jsx
    - EMICalculatorModal.jsx
    - EMIDonutChart.jsx
    - Footer.jsx
    - InsuranceApplicationsTab.jsx
    - LoadingSpinner.jsx
    - LoanCard.jsx
    - LoanFormComponent.jsx
    - Meta.jsx
    - NavBar.jsx
    - PageSkeleton.jsx
    - PageTransitionOverlay.jsx
    - ProtectedUserRoute.jsx
    - PullToRefreshWrapper.jsx
    - RouteTransitionOverlay.jsx
    - ScrollToTop.jsx
    - SessionManager.jsx
    - SignInSheet.jsx
    - Skeleton.jsx
    - Skeletons.jsx
    - StickyCalculator.jsx
    - StructuredData.jsx
    - UserSupportChat.backup.jsx
    - UserSupportChat.jsx
  + config
    - api.js
    - collectionConfig.js
    - firebase.js
    - firebase.js.old
    - supabase.js
    - supabaseClient.js
  + context
    - AdminAuthContext.jsx
    - PageTransitionContext.jsx
    - ToastContext.jsx
    - UserAuthContext.jsx
  + hooks
    - useAdminAutoLogout.js
    - useAutoLogout.js
    - useEMICalculator.js
    - usePageTransition.js
    - useSticky.js
  - index.css
  - instrumentation-client.js
  - instrumentation.js
  - main.jsx
  + pages
    - _app.jsx
    - _error.jsx
    - account.jsx
    - AllInsurancePage.jsx
    - BusinessLoanFormPage.jsx
    - CarLoanFormPage.jsx
    - CarRefinanceFormPage.jsx
    - CheckCibilScorePage.jsx
    - CibilScoreCheckerPage.jsx
    - CompleteProfilePage.jsx
    - ContactMessagesPage.jsx
    - ContactUsPage.jsx
    - CreateApplicationPage.jsx
    - CreditCardsPage.jsx
    - DSADashboardPage.jsx
    - EducationLoanPage.jsx
    - FinishSignUpPage.jsx
    - ForgotPasswordPage.jsx
    - GeneralInsurancePage.jsx
    - GoldLoanFormPage.jsx
    - HealthInsurancePage.jsx
    - HomeLoanPage.jsx
    - HomePage.jsx
    - InsuranceApplicationsPage.jsx
    - LifeInsurancePage.jsx
    - LoanAgainstPropertyPage.jsx
    - LoanApplicationsPage.jsx
    - MachineryLoanPage.jsx
    - NewCarLoanFormPage.jsx
    - PersonalLoanFormPage.jsx
    - products.jsx
    - ProductsPage.jsx
    - profile.jsx
    - PropertyLoanFormPage.jsx
    - SignInPage.jsx
    - SignUpPage.jsx
    - skeleton-example.jsx
    - SolarLoanPage.jsx
    - support.jsx
    - SupportPage.jsx
    - track.jsx
    - TrackPage.jsx
    - UsedCarLoanFormPage.jsx
  + services
    - adminDashboardService.js
    - authService.js
    - firebaseAuthApi.js
    - firebaseAuthService.js.OLD
    - firebaseMessaging.js
    - supabaseService.js
    - supabaseAuthService.js
    - useFCM.js
  + types
    - global.d.ts
  + utils
    - emiCalculations.js
    - firebaseTokenHelper.js.OLD
    - phone.js
    - SCHEMA_README.md
    - schema.js
    - supabaseTokenHelper.js
    - transitionOverlay.js
- STRUCTURE.md
- tailwind.config.js
- tsconfig.json
```

## Notes & Recommendations

- The App Router (`src/app`) is the active routing surface (Next 16+). Keep migrating any remaining `src/pages` files to `src/app` and remove legacy duplicates after QA.
- Archive before deleting: move `_archive/` and any `pages-old` folders to an archival branch or external archive ZIP.
- Run dependency checks before pruning unused packages (e.g., `npx depcheck`).

## Troubleshooting / Dev tips

- If a page fails due to a browser-only library on the server, isolate that UI into a client component (add `"use client"`) or dynamic import it client-side.
- To inspect build output and confirm which files were compiled, check `.next/` after `npm run build`.

## Contact / Next steps

For migration planning or help implementing the cleanup steps, see STRUCTURE.md (in this folder) or open an issue in the repo.
