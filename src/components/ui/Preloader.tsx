"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    // 1. Check if we have shown the intro in this session
    const hasVisited = sessionStorage.getItem("loanzaar_intro_shown");
    
    // Determine durations based on visit type
    // First visit: 1300ms total, Subsequent: 800ms total (quicker)
    const fadeDelay = hasVisited ? 500 : 800; 
    const removeDelay = hasVisited ? 800 : 1300; 

    if (hasVisited) {
      setIsFirstVisit(false);
    } else {
      // Mark as visited for next time (persists until tab is closed)
      sessionStorage.setItem("loanzaar_intro_shown", "true");
    }

    // 2. Lock body scroll
    document.body.style.overflow = "hidden";

    // 3. Start Fade Out animation
    const timer = setTimeout(() => {
      setFade(true);
    }, fadeDelay);

    // 4. Remove component from DOM
    const removeTimer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "unset";
    }, removeDelay);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center 
        bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60
        transition-opacity duration-500 ease-in-out
        ${fade ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
    >
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Animated Brand Name - Only show on first visit */}
        {isFirstVisit && (
          <div className="overflow-hidden mb-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-[0.2em] text-slate-900 animate-slideUp">
              LOANZAAR
            </h1>
          </div>
        )}

        {/* Sleek Progress Line - Always show */}
        <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-loading-bar"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes loading-bar {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 50%; }
          100% { width: 100%; transform: translateX(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-loading-bar {
          animation: loading-bar 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}