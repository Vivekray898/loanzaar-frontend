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
    '/car-loan/new',
    '/car-loan/used',
    '/car-loan/refinance',
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
    '/account',
    '/account/apply-loan',
    '/account/applications',
    '/account/profile',
    '/account/insurance',
    '/account/support',
    '/admin/login',
    '/admin/signup',
    '/admin/account',
    '/admin/settings',
    '/admin/forgot-password'
  ]

  return staticPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date()
  }))
}
