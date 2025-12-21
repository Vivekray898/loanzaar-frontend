import React from 'react'
import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function SkeletonLoadingExample() {
  const [checked, setChecked] = useState(false)

  return (
    <div className="min-h-screen flex items-start justify-center p-8 bg-slate-50">
      <div className="w-full max-w-xl bg-white p-6 rounded-lg shadow">
        <label className="flex items-center gap-3 mb-4">
          <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} />
          <span className="text-sm">Loading</span>
        </label>

        <div>
          {checked ? (
            <Skeleton height={24} count={3} />
          ) : (
            <div>
              <p className="text-lg font-semibold">NextJs Skeleton Loading - Example</p>
              <p className="text-sm text-slate-600">Toggle the checkbox to show skeleton placeholders.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
