import '../index.css'
import '../App.css'

import Providers from './providers'

// Initialize Supabase config on app load
import '../config/supabase'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Loanzaar - Smart Borrowing Platform',
    template: '%s | Loanzaar'
  },
  description: 'Loanzaar - Compare loans, check CIBIL score, and apply for financial products online.',
  alternates: {
    canonical: '/' // Per-page canonicals will resolve against metadataBase
  },
  openGraph: {
    type: 'website',
    siteName: 'Loanzaar',
    url: '/',
    title: 'Loanzaar - Smart Borrowing Platform',
    description: 'Compare loans, check CIBIL score, and apply online.',
    images: ['/og-image.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loanzaar - Smart Borrowing Platform',
    description: 'Compare loans, check CIBIL score, and apply online.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
