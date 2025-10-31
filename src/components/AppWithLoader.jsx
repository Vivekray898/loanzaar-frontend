'use client'

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AppWithLoader({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const pathname = usePathname();
  const prevPathnameRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Initialize on first load
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    // Detect pathname change
    if (pathname !== prevPathnameRef.current) {
      console.log('📄 Page changing from', prevPathnameRef.current, 'to:', pathname);
      
      // Show overlay OVER current content
      setIsLoading(true);
      
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Wait for new content to be ready, then switch
      timeoutRef.current = setTimeout(() => {
        console.log('📄 Switching to new page');
        prevPathnameRef.current = pathname;
        setIsLoading(false);
      }, 300); // Reduced to 300ms for faster feel
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);

  return (
    <>
      {/* Black overlay appears during transition */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-200">
          <div className="flex flex-col items-center gap-4">
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-sm font-medium">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Current page content stays visible until transition completes */}
      <div className={isLoading ? 'pointer-events-none' : ''}>
        {children}
      </div>
    </>
  );
}
