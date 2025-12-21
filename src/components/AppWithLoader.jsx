'use client'

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import PageSkeleton from './PageSkeleton';

export default function AppWithLoader({ children }) {
  const [isLoading, setIsLoading] = useState(false);
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
      // Show overlay OVER current content
      setIsLoading(true);

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Wait for new content to be ready, then switch
      timeoutRef.current = setTimeout(() => {
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-200 p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg overflow-hidden shadow-lg">
            <PageSkeleton />
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
