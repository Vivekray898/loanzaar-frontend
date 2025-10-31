import React, { createContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export const PageTransitionContext = createContext();

export function PageTransitionProvider({ children }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();
  const prevPathnameRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    console.log('🎬 PageTransitionContext effect fired, pathname:', pathname);

    // First render - just save the pathname
    if (isFirstRenderRef.current) {
      console.log('🎬 First render, setting initial pathname:', pathname);
      isFirstRenderRef.current = false;
      prevPathnameRef.current = pathname;
      return;
    }

    // On subsequent renders, check if pathname changed
    console.log('🎬 Checking change - previous:', prevPathnameRef.current, 'current:', pathname);

    if (pathname && pathname !== prevPathnameRef.current) {
      console.log('🎬 ✨ PATHNAME CHANGED! Triggering overlay');
      prevPathnameRef.current = pathname;

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Show overlay
      setIsTransitioning(true);
      console.log('🎬 Overlay shown');

      // Hide overlay after 700ms
      timeoutRef.current = setTimeout(() => {
        console.log('🎬 Hiding overlay');
        setIsTransitioning(false);
      }, 700);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);

  return (
    <PageTransitionContext.Provider value={{ isTransitioning }}>
      {children}
    </PageTransitionContext.Provider>
  );
}
