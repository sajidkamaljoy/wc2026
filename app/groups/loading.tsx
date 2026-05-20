export default function GroupsLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Page Header Skeleton */}
      <div className="mb-8">
        <div className="h-9 w-64 bg-slate-800/80 rounded-lg mb-2" />
        <div className="h-4 w-96 bg-slate-800/40 rounded-md" />
      </div>

      {/* Standings Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/5 bg-slate-900/20 p-5 space-y-4"
          >
            {/* Group Header Title Placeholder */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-slate-800/80 rounded-md" />
              <div className="h-4 w-16 bg-slate-800/40 rounded" />
            </div>
            
            {/* Standings Rows Skeletons */}
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, rIdx) => (
                <div key={rIdx} className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-slate-800/60 rounded" />
                    <div className="h-4.5 w-7 bg-slate-800/80 rounded" />
                    <div className="h-4 w-20 bg-slate-800/60 rounded-md" />
                  </div>
                  <div className="flex gap-4 pr-2">
                    <div className="h-4 w-4 bg-slate-800/40 rounded" />
                    <div className="h-4 w-4 bg-slate-800/40 rounded" />
                    <div className="h-4 w-6 bg-slate-800/60 rounded text-amber-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
