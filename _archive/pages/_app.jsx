'use client'

import React from 'react'
import '../index.css'
import '../App.css'
import { AdminAuthProvider } from '../context/AdminAuthContext'
import { UserAuthProvider } from '../context/UserAuthContext'

export default function MyApp({ Component, pageProps }) {
  return (
    <UserAuthProvider>
      <AdminAuthProvider>
        <Component {...pageProps} />
      </AdminAuthProvider>
    </UserAuthProvider>
  )
}
