import PageSkeleton from './PageSkeleton';
import { CardSkeleton } from './Skeleton';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Desktop: show full page skeleton; Mobile: compact card skeleton */}
        <div className="hidden md:block rounded-lg overflow-hidden shadow-lg">
          <PageSkeleton />
        </div>

        <div className="block md:hidden">
          <CardSkeleton />
        </div>

        <p className="sr-only">Loading...</p>
      </div>
    </div>
  );
}
