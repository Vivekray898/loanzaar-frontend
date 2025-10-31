export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const staticPaths = [
    '/',
    '/contact-us',
    '/check-cibil-score',
    '/cibil-score-checker',
    '/credit-cards',
    '/personal-loan',
    '/home-loan',
    '/business-loan',
    '/car-loan',
    '/car-loan/new-car-loan',
    '/car-loan/used-car-loan',
    '/car-loan/car-refinance',
    '/loan-against-property',
    '/machinery-loan',
    '/education-loan',
    '/gold-loan',
    '/solar-loan',
    '/insurance/all-insurance',
    '/insurance/life-insurance',
    '/insurance/health-insurance',
    '/insurance/general-insurance',
    '/signin',
    '/signup',
    '/forgot-password',
    '/finish-signup',
    '/complete-profile',
    '/dashboard',
    '/dashboard/apply-loan',
    '/dashboard/applications',
    '/dashboard/profile',
    '/dashboard/insurance',
    '/dashboard/support',
    '/admin/login',
    '/admin/signup',
    '/admin/dashboard',
    '/admin/settings',
    '/admin/forgot-password'
  ]

  return staticPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date()
  }))
}
