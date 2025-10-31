"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import './index.css'
import { usePathname } from 'next/navigation'
import ScrollToTop from './components/ScrollToTop'
// Initialize Firebase on app load
import './config/firebase'
// Client-only page components loaded on demand
const HomePage = dynamic(() => import('./pages-old/Homepage'), { ssr: false })
const ContactUsPage = dynamic(() => import('./pages-old/ContactUsPage'), { ssr: false })
const CheckCibilScorePage = dynamic(() => import('./pages-old/CheckCibilScorePage'), { ssr: false })
const CibilScoreCheckerPage = dynamic(() => import('./pages-old/CibilScoreCheckerPage'), { ssr: false })
const CreditCardsPage = dynamic(() => import('./pages-old/CreditCardsPage'), { ssr: false })

// Loans
const PersonalLoanFormPage = dynamic(() => import('./pages-old/PersonalLoanFormPage'), { ssr: false })
const HomeLoanPage = dynamic(() => import('./pages-old/HomeLoanPage'), { ssr: false })
const BusinessLoanFormPage = dynamic(() => import('./pages-old/BusinessLoanFormPage'), { ssr: false })
const CarLoanFormPage = dynamic(() => import('./pages-old/CarLoanFormPage'), { ssr: false })
const NewCarLoanFormPage = dynamic(() => import('./pages-old/NewCarLoanFormPage'), { ssr: false })
const UsedCarLoanFormPage = dynamic(() => import('./pages-old/UsedCarLoanFormPage'), { ssr: false })
const CarRefinanceFormPage = dynamic(() => import('./pages-old/CarRefinanceFormPage'), { ssr: false })
const LoanAgainstPropertyPage = dynamic(() => import('./pages-old/LoanAgainstPropertyPage'), { ssr: false })
const MachineryLoanPage = dynamic(() => import('./pages-old/MachineryLoanPage'), { ssr: false })
const EducationLoanPage = dynamic(() => import('./pages-old/EducationLoanPage'), { ssr: false })
const GoldLoanFormPage = dynamic(() => import('./pages-old/GoldLoanFormPage'), { ssr: false })
const SolarLoanPage = dynamic(() => import('./pages-old/SolarLoanPage'), { ssr: false })

// Insurance
const AllInsurancePage = dynamic(() => import('./pages-old/AllInsurancePage'), { ssr: false })
const LifeInsurancePage = dynamic(() => import('./pages-old/LifeInsurancePage'), { ssr: false })
const HealthInsurancePage = dynamic(() => import('./pages-old/HealthInsurancePage'), { ssr: false })
const GeneralInsurancePage = dynamic(() => import('./pages-old/GeneralInsurancePage'), { ssr: false })

// Auth / user
const SignInPage = dynamic(() => import('./pages-old/SignInPage'), { ssr: false })
const SignUpPage = dynamic(() => import('./pages-old/SignUpPage'), { ssr: false })
const ForgotPasswordPage = dynamic(() => import('./pages-old/ForgotPasswordPage'), { ssr: false })
const FinishSignUpPage = dynamic(() => import('./pages-old/FinishSignUpPage'), { ssr: false })
const CompleteProfilePage = dynamic(() => import('./pages-old/CompleteProfilePage'), { ssr: false })
const UserDashboardPage = dynamic(() => import('./pages-old/UserDashboardPage'), { ssr: false })
const UserLoanFormPage = dynamic(() => import('./pages-old/UserLoanFormPage'), { ssr: false })
const UserApplicationsPage = dynamic(() => import('./pages-old/UserApplicationsPage'), { ssr: false })
const UserProfilePage = dynamic(() => import('./pages-old/UserProfilePage'), { ssr: false })
const UserInsuranceFormPage = dynamic(() => import('./pages-old/UserInsuranceFormPage'), { ssr: false })
const UserSupportPage = dynamic(() => import('./pages-old/UserSupportPage'), { ssr: false })

// Admin
const AdminLoginPage = dynamic(() => import('./pages-old/AdminLoginPage'), { ssr: false })
const AdminSignupPage = dynamic(() => import('./pages-old/AdminSignupPage'), { ssr: false })
const AdminDashboard = dynamic(() => import('./pages-old/AdminDashboard'), { ssr: false })
const AdminSettingsPage = dynamic(() => import('./pages-old/AdminSettingsPage'), { ssr: false })
const AdminForgotPasswordPage = dynamic(() => import('./pages-old/AdminForgotPasswordPage'), { ssr: false })
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import UserDashboardLayout from './components/UserDashboardLayout'

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
                            <UserDashboardLayout>
                              <UserDashboardPage />
                            </UserDashboardLayout>
                          )
                        }
    if (pathname === '/personal-loan') return <PersonalLoanFormPage />
    if (pathname === '/home-loan') return <HomeLoanPage />
                        if (pathname === '/dashboard/apply-loan') {
                          return (
                            <UserDashboardLayout>
                              <UserLoanFormPage />
                            </UserDashboardLayout>
                          )
                        }
    if (pathname === '/business-loan') return <BusinessLoanFormPage />
    if (pathname === '/car-loan') return <CarLoanFormPage />
                        if (pathname === '/dashboard/applications') {
                          return (
                            <UserDashboardLayout>
                              <UserApplicationsPage />
                            </UserDashboardLayout>
                          )
                        }
    if (pathname === '/car-loan/new-car-loan') return <NewCarLoanFormPage />
    if (pathname === '/car-loan/used-car-loan') return <UsedCarLoanFormPage />
                        if (pathname === '/dashboard/profile') {
                          return (
                            <UserDashboardLayout>
                              <UserProfilePage />
                            </UserDashboardLayout>
                          )
                        }
    if (pathname === '/car-loan/car-refinance') return <CarRefinanceFormPage />
    if (pathname === '/loan-against-property') return <LoanAgainstPropertyPage />
                        if (pathname === '/dashboard/insurance') {
                          return (
                            <UserDashboardLayout>
                              <UserInsuranceFormPage />
                            </UserDashboardLayout>
                          )
                        }
    if (pathname === '/machinery-loan') return <MachineryLoanPage />
    if (pathname === '/education-loan') return <EducationLoanPage />
                        if (pathname === '/dashboard/support') {
                          return (
                            <UserDashboardLayout>
                              <UserSupportPage />
                            </UserDashboardLayout>
                          )
                        }
                        // Additional dashboard sections
                        if (pathname === '/dashboard/my-loans' || pathname === '/dashboard/my-insurance' || pathname === '/dashboard/apply-insurance' || pathname === '/dashboard/my-cards' || pathname === '/dashboard/security' || pathname === '/dashboard/settings' || pathname === '/dashboard/help') {
                          // Render placeholder pages inside dashboard layout
                          return (
                            <UserDashboardLayout>
                              <div className="max-w-6xl mx-auto p-6">
                                <h1 className="text-2xl font-semibold">Coming Soon</h1>
                              </div>
                            </UserDashboardLayout>
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
        <div className="font-sans text-slate-800 antialiased">
          <main>
            {renderRoute()}
          </main>
          <Footer />
        </div>
      </ConditionalAuthProvider>
    </>
  );
}

export default App
