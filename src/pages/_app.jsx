'use client'

import React from 'react'
import '../index.css'
import '../App.css'
import { AdminAuthProvider } from '../context/AdminAuthContext'
import { UserAuthProvider } from '../context/UserAuthContext'
import BottomNav from '../components/BottomNav'

export default function MyApp({ Component, pageProps }) {
  return (
    <UserAuthProvider>
      <AdminAuthProvider>
        <div className="pb-20 md:pb-0">
          <Component {...pageProps} />
        </div>
        <BottomNav />
      </AdminAuthProvider>
    </UserAuthProvider>
  )
}
