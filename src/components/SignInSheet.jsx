'use client'

import React, { useEffect } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { useUserAuth } from '../context/UserAuthContext'
import SignInPage from '../app/(auth)/signin/SignInPage'
import SignUpPage from '../app/(auth)/signup/SignUpPage'
import ForgotPasswordPage from '../app/(auth)/forgot-password/ForgotPasswordPage'

export default function SignInSheet({ open = false, onClose = () => {} }) {
  const { isAuthenticated } = useUserAuth()
  const [view, setView] = React.useState('signin') // 'signin' | 'signup' | 'forgot'

  useEffect(() => {
    if (isAuthenticated && open) onClose()
  }, [isAuthenticated, open, onClose])

  // Prevent background scroll while sheet is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = prev;
    return () => { document.body.style.overflow = prev };
  }, [open])

  useEffect(() => {
    if (!open) setView('signin')
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[90vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white rounded-t-3xl sm:rounded-t-2xl z-10 sticky top-0">
          <div className="flex items-center gap-4">
            {view !== 'signin' && (
              <button 
                onClick={() => setView('signin')} 
                className="w-10 h-10 -ml-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-xl font-bold text-slate-900">
              {view === 'signin' ? 'Welcome Back' : view === 'signup' ? 'Join Loanzaar' : 'Reset Password'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 -mr-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="overflow-y-auto p-0 flex-1">
          {view === 'signin' && (
            <div className="px-1 py-2">
                 {/* Pass minimal props to reuse logic but allow styling overrides if needed */}
                <SignInPage 
                    onShowSignup={() => setView('signup')} 
                    onShowForgot={() => setView('forgot')} 
                    isModal={true} 
                />
            </div>
          )}
          {view === 'signup' && (
              <div className="px-1 py-2">
                 <SignUpPage onShowSignin={() => setView('signin')} />
              </div>
          )}
          {view === 'forgot' && (
              <div className="px-1 py-2">
                  <ForgotPasswordPage onBackToSignin={() => setView('signin')} />
              </div>
          )}
        </div>
      </div>
    </div>
  )
}