export default function FixturesLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Timezone Banner Skeleton */}
      <div className="mb-6 h-12 w-full bg-slate-900/40 border border-white/5 rounded-2xl" />

      {/* Page Title & Controls Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="h-9 w-64 bg-slate-800/80 rounded-lg mb-2" />
          <div className="h-4 w-48 bg-slate-800/40 rounded-md" />
        </div>
        
        {/* Filters Placeholder */}
        <div className="h-10 w-full sm:w-80 bg-slate-900/40 border border-white/5 rounded-xl" />
      </div>

      {/* Matches Timeline Skeletons */}
      <div className="space-y-10">
        {Array.from({ length: 2 }).map((_, gIdx) => (
          <div key={gIdx} className="space-y-4">
            {/* Date Header Placeholder */}
            <div className="h-5 w-40 bg-slate-800/80 rounded-md" />
            
            {/* Match Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, mIdx) => (
                <div
                  key={mIdx}
                  className="rounded-2xl border border-white/5 bg-slate-900/20 p-5 space-y-4"
                >
                  {/* Match Meta (Number & Venue) */}
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                    <div className="h-4 w-16 bg-slate-800/60 rounded" />
                    <div className="h-4 w-28 bg-slate-800/40 rounded" />
                  </div>
                  
                  {/* Match Teams & Score Line */}
                  <div className="space-y-3 py-2">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4.5 w-7 bg-slate-800/80 rounded" />
                        <div className="h-4 w-24 bg-slate-800/60 rounded-md" />
                      </div>
                      <div className="h-6 w-8 bg-slate-800/40 rounded" />
                    </div>
                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4.5 w-7 bg-slate-800/80 rounded" />
                        <div className="h-4 w-24 bg-slate-800/60 rounded-md" />
                      </div>
                      <div className="h-6 w-8 bg-slate-800/40 rounded" />
                    </div>
                  </div>

                  {/* Match Footer Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.02]">
                    <div className="h-4 w-20 bg-slate-800/40 rounded" />
                    <div className="h-4.5 w-16 bg-slate-800/60 rounded-md" />
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
