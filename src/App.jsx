"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import './index.css'
import { usePathname } from 'next/navigation'
import ScrollToTop from './components/ScrollToTop'
// Initialize Supabase on app load
import './config/supabase'
// Client-only page components loaded on demand
const HomePage = dynamic(() => import('./pages/Homepage'), { ssr: false })
const ContactUsPage = dynamic(() => import('./pages/ContactUsPage'), { ssr: false })
const CheckCibilScorePage = dynamic(() => import('./pages/CheckCibilScorePage'), { ssr: false })
const CibilScoreCheckerPage = dynamic(() => import('./pages/CibilScoreCheckerPage'), { ssr: false })
const CreditCardsPage = dynamic(() => import('./pages/CreditCardsPage'), { ssr: false })

// Loans
const PersonalLoanFormPage = dynamic(() => import('./pages/PersonalLoanFormPage'), { ssr: false })
const HomeLoanPage = dynamic(() => import('./pages/HomeLoanPage'), { ssr: false })
const BusinessLoanFormPage = dynamic(() => import('./pages/BusinessLoanFormPage'), { ssr: false })
const CarLoanFormPage = dynamic(() => import('./pages/CarLoanFormPage'), { ssr: false })
const NewCarLoanFormPage = dynamic(() => import('./pages/NewCarLoanFormPage'), { ssr: false })
const UsedCarLoanFormPage = dynamic(() => import('./pages/UsedCarLoanFormPage'), { ssr: false })
const CarRefinanceFormPage = dynamic(() => import('./pages/CarRefinanceFormPage'), { ssr: false })
const LoanAgainstPropertyPage = dynamic(() => import('./pages/LoanAgainstPropertyPage'), { ssr: false })
const MachineryLoanPage = dynamic(() => import('./pages/MachineryLoanPage'), { ssr: false })
const EducationLoanPage = dynamic(() => import('./pages/EducationLoanPage'), { ssr: false })
const GoldLoanFormPage = dynamic(() => import('./pages/GoldLoanFormPage'), { ssr: false })
const SolarLoanPage = dynamic(() => import('./pages/SolarLoanPage'), { ssr: false })

// Insurance
const AllInsurancePage = dynamic(() => import('./pages/AllInsurancePage'), { ssr: false })
const LifeInsurancePage = dynamic(() => import('./pages/LifeInsurancePage'), { ssr: false })
const HealthInsurancePage = dynamic(() => import('./pages/HealthInsurancePage'), { ssr: false })
const GeneralInsurancePage = dynamic(() => import('./pages/GeneralInsurancePage'), { ssr: false })

// Auth / user
const SignInPage = dynamic(() => import('./pages/SignInPage'), { ssr: false })
const SignUpPage = dynamic(() => import('./pages/SignUpPage'), { ssr: false })
const ForgotPasswordPage = dynamic(() => import('./pages/ForgotPasswordPage'), { ssr: false })
const FinishSignUpPage = dynamic(() => import('./pages/FinishSignUpPage'), { ssr: false })
const CompleteProfilePage = dynamic(() => import('./pages/CompleteProfilePage'), { ssr: false })
const UserDashboardPage = dynamic(() => import('./pages/UserDashboardPage'), { ssr: false })
const UserLoanFormPage = dynamic(() => import('./pages/UserLoanFormPage'), { ssr: false })
const UserApplicationsPage = dynamic(() => import('./pages/UserApplicationsPage'), { ssr: false })
const UserProfilePage = dynamic(() => import('./pages/UserProfilePage'), { ssr: false })
const UserInsuranceFormPage = dynamic(() => import('./pages/UserInsuranceFormPage'), { ssr: false })
const UserSupportPage = dynamic(() => import('./pages/UserSupportPage'), { ssr: false })

// Admin
const AdminLoginPage = dynamic(() => import('./pages/AdminLoginPage'), { ssr: false })
const AdminSignupPage = dynamic(() => import('./pages/AdminSignupPage'), { ssr: false })
const AdminDashboard = dynamic(() => import('./pages/AdminDashboard'), { ssr: false })
const AdminSettingsPage = dynamic(() => import('./pages/AdminSettingsPage'), { ssr: false })
const AdminForgotPasswordPage = dynamic(() => import('./pages/AdminForgotPasswordPage'), { ssr: false })
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import BasicLayout from './components/BasicLayout'
import BottomNav from './components/BottomNav'

// Auth providers and session manager
import { AdminAuthProvider } from './context/AdminAuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import SessionManager from './components/SessionManager'

// Conditional Auth Provider Wrapper
function ConditionalAuthProvider({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isUserRoute = pathname?.startsWith('/dashboard') ||
                      pathname?.startsWith('/user-dashboard') ||
                      pathname === '/signin' ||
                      pathname === '/signup' ||
                      pathname === '/forgot-password' ||
                      pathname === '/finishSignUp' ||
                      pathname === '/complete-profile';

  // Always provide UserAuthProvider so NavBar and public pages can read user state.
  // For admin routes, additionally wrap with AdminAuthProvider.
  if (isAdminRoute) {
    return (
      <UserAuthProvider>
        <AdminAuthProvider>
          <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
            {children}
          </SessionManager>
        </AdminAuthProvider>
      </UserAuthProvider>
    );
  }

  // Non-admin routes: always include UserAuthProvider. If it's a user route, include SessionManager.
  return (
    <UserAuthProvider>
      {isUserRoute ? (
        <SessionManager userTimeoutMinutes={30} adminTimeoutMinutes={30}>
          {children}
        </SessionManager>
      ) : (
        children
      )}
    </UserAuthProvider>
  );
}

function App() {
  const pathname = usePathname() || '/'
  
  // Debug: Log pathname to ensure routing is working
  if (typeof window !== 'undefined') {
    console.log('🛣️ Current pathname:', pathname);
  }

  const renderRoute = () => {
    // ADMIN (Check these FIRST before fallback)
    if (pathname === '/admin/login') return <AdminLoginPage />
    if (pathname === '/admin/signup') return <AdminSignupPage />
    if (pathname === '/admin/dashboard') return <AdminDashboard />
    if (pathname === '/admin/settings') return <AdminSettingsPage />
    if (pathname === '/admin/forgot-password') return <AdminForgotPasswordPage />
    
    // PUBLIC
    if (pathname === '/' || pathname === '') return <HomePage />
    if (pathname === '/contact-us') return <ContactUsPage />
    if (pathname === '/check-cibil-score') return <CheckCibilScorePage />
    if (pathname === '/cibil-score-checker') return <CibilScoreCheckerPage />
    if (pathname === '/credit-cards') return <CreditCardsPage />

                        if (pathname === '/dashboard' || pathname === '/user-dashboard') {
                          return (
                            <BasicLayout>
                              <UserDashboardPage />
                            </BasicLayout>
                          )
                        }
    if (pathname === '/personal-loan') return <PersonalLoanFormPage />
    if (pathname === '/home-loan') return <HomeLoanPage />
                        if (pathname === '/dashboard/apply-loan') {
                          return (
                            <BasicLayout>
                              <UserLoanFormPage />
                            </BasicLayout>
                          )
                        }
    if (pathname === '/business-loan') return <BusinessLoanFormPage />
    if (pathname === '/car-loan') return <CarLoanFormPage />
                        if (pathname === '/dashboard/applications') {
                          return (
                            <BasicLayout>
                              <UserApplicationsPage />
                            </BasicLayout>
                          )
                        }
    if (pathname === '/car-loan/new') return <NewCarLoanFormPage />
    if (pathname === '/car-loan/used') return <UsedCarLoanFormPage />
                        if (pathname === '/dashboard/profile') {
                          return (
                            <BasicLayout>
                              <UserProfilePage />
                            </BasicLayout>
                          )
                        }
    if (pathname === '/car-loan/refinance') return <CarRefinanceFormPage />
    if (pathname === '/loan-against-property') return <LoanAgainstPropertyPage />
                        if (pathname === '/dashboard/insurance') {
                          return (
                            <BasicLayout>
                              <UserInsuranceFormPage />
                            </BasicLayout>
                          )
                        }
    if (pathname === '/machinery-loan') return <MachineryLoanPage />
    if (pathname === '/education-loan') return <EducationLoanPage />
                        if (pathname === '/dashboard/support') {
                          return (
                            <BasicLayout>
                              <UserSupportPage />
                            </BasicLayout>
                          )
                        }
                        // Additional dashboard sections
                        if (pathname === '/dashboard/my-loans' || pathname === '/dashboard/my-insurance' || pathname === '/dashboard/apply-insurance' || pathname === '/dashboard/my-cards' || pathname === '/dashboard/security' || pathname === '/dashboard/settings' || pathname === '/dashboard/help') {
                          // Render placeholder pages inside dashboard layout
                          return (
                            <BasicLayout>
                              <div className="max-w-6xl mx-auto p-6">
                                <h1 className="text-2xl font-semibold">Coming Soon</h1>
                              </div>
                            </BasicLayout>
                          )
                        }
    if (pathname === '/gold-loan') return <GoldLoanFormPage />
    if (pathname === '/solar-loan') return <SolarLoanPage />

    // INSURANCE
    if (pathname === '/insurance/all-insurance') return <AllInsurancePage />
    if (pathname === '/insurance/life-insurance') return <LifeInsurancePage />
    if (pathname === '/insurance/health-insurance') return <HealthInsurancePage />
    if (pathname === '/insurance/general-insurance') return <GeneralInsurancePage />

    // AUTH/USER
    if (pathname === '/signin') return <SignInPage />
    if (pathname === '/signup') return <SignUpPage />
    if (pathname === '/forgot-password') return <ForgotPasswordPage />
    if (pathname === '/finish-signup') return <FinishSignUpPage />
    if (pathname === '/complete-profile') return <CompleteProfilePage />

    if (pathname === '/dashboard' || pathname === '/user-dashboard') return <UserDashboardPage />
    if (pathname === '/dashboard/apply-loan') return <UserLoanFormPage />
    if (pathname === '/dashboard/applications') return <UserApplicationsPage />
    if (pathname === '/dashboard/profile') return <UserProfilePage />
    if (pathname === '/dashboard/insurance') return <UserInsuranceFormPage />
    if (pathname === '/dashboard/support') return <UserSupportPage />

    // Fallback
    return <HomePage />
  }

  return (
    <>
      <ScrollToTop />
      <ConditionalAuthProvider>
        <NavBar />
        <div className="font-sans text-slate-800 antialiased pb-20 md:pb-0">
          <main>
            {renderRoute()}
          </main>
          <Footer />
        </div>
        <BottomNav />
      </ConditionalAuthProvider>
    </>
  );
}

export default App