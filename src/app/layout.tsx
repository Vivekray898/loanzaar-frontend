import type { Metadata } from 'next'
import React from 'react'
import '../index.css'
import '../App.css'

import Providers from './providers'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import Container from '@/components/Container'

// System UI Imports
import Preloader from '@/components/ui/Preloader'
import NextTopLoader from 'nextjs-toploader'

// Initialize Supabase config on app load
import '../config/supabase'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Loanzaar - Smart Borrowing Platform',
    template: '%s | Loanzaar'
  },
  description: 'Loanzaar - Compare loans, check CIBIL score, and apply for financial products online.',
  alternates: {
    canonical: '/' 
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        
        {/* 1. System UI Elements (Loaders) */}
        <Preloader />

        <NextTopLoader 
          color="#0ea5e9"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0ea5e9,0 0 5px #0ea5e9"
        />

        {/* 2. Main Application Content (No Pull Refresh Wrapper) */}
        <React.Suspense fallback={<div />}>
          <Providers>
            <NavBar />

            <main>
              <Container>
                {children}
              </Container>
            </main>

            <Footer />
          </Providers>
        </React.Suspense>
        
      </body>
    </html>
  )
}