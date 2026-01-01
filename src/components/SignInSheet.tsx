'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import SignInModal from './SignInModal'

interface SignInSheetProps {
  open?: boolean;
  onClose?: () => void;
}

export default function SignInSheet({ open = false, onClose = () => {} }: SignInSheetProps) {
  // Using unified auth context
  const { isAuthenticated } = useAuth(); 

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
          <h3 className="text-xl font-bold text-slate-900">Welcome Back</h3>
          <button 
            onClick={onClose} 
            className="w-10 h-10 -mr-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="overflow-y-auto p-6 flex-1">
          {/* Use the unified SignInModal component which handles OTP for all user types */}
          <SignInModal 
            forceOpen={false}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  )
}