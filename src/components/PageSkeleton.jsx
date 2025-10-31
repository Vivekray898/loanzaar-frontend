export default function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
