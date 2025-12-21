"use client"

import RLSkeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

// Accessibility helper
const ScreenReaderLoading = () => (
  <span className="sr-only">Loading content...</span>
)

function Skeleton({ height, width, circle = false, ...props }) {
  return <RLSkeleton height={height} width={width} circle={circle} {...props} />
}

export function CardSkeleton() {
  return (
    <div role="status" className="p-4 rounded border">
      <ScreenReaderLoading />
      <Skeleton height={24} width="66%" />
    </div>
  )
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div role="status" className="space-y-4">
      <ScreenReaderLoading />
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={16} width="100%" />
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div role="status" className="p-6 space-y-6">
      <ScreenReaderLoading />
      <Skeleton height={32} width={200} />
      <ListSkeleton count={3} />
    </div>
  )
}
