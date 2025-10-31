export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-1 bg-white rounded-full" />
        </div>
        <p className="text-sm text-slate-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}
