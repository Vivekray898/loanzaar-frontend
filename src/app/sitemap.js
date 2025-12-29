export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const staticPaths = [
    '/',
    '/contact-us',
    '/check-cibil-score',
    '/cibil-score-checker',
    '/credit-card',
    '/loans/personal-loan',
    '/loans/home-loan',
    '/loans/business-loan',
    '/car-loan',
    '/car-loan/new-car-loan',
    '/car-loan/used-car-loan',
    '/car-loan/car-refinance',
    '/loans/loan-against-property',
    '/loans/machinery-loan',
    '/loans/education-loan',
    '/loans/gold-loan',
    '/loans/solar-loan',
    '/insurance/all-insurance',
    '/insurance/life-insurance',
    '/insurance/health-insurance',
    '/insurance/general-insurance',
    '/signin',
    '/signup',
    '/forgot-password',
    '/finish-signup',
    '/complete-profile',
    '/account',
    '/account/apply-loan',
    '/account/applications',
    '/account/profile',
    '/account/insurance',
    '/account/support',
    '/admin/login',
    '/admin/signup',
    '/admin',
    '/admin/settings',
    '/admin/forgot-password'
  ]

  return staticPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date()
  }))
}
