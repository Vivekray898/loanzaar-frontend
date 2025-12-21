import React from 'react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-6 bg-white/80 dark:bg-slate-900/75 rounded-lg shadow-lg">
        <svg
          className="animate-spin h-12 w-12 text-sky-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <div className="text-center">
          <p className="text-slate-900 dark:text-slate-100 font-semibold">Loading Loanzaar…</p>
        </div>
      </div>
    </div>
  )
}
