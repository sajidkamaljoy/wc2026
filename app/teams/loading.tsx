export default function TeamLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Back to Standings Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-9 w-32 bg-slate-900/40 border border-white/5 rounded-xl" />
      </div>

      {/* Team Info Header Card */}
      <div className="mb-8 rounded-3xl border border-white/5 bg-slate-900/20 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Flag Placeholder */}
          <div className="h-10 w-16 bg-slate-800/80 rounded shadow border border-white/10" />
          <div>
            {/* Team Name & Group Placeholder */}
            <div className="h-8 w-48 bg-slate-800/80 rounded-lg mb-2" />
            <div className="h-4 w-32 bg-slate-800/40 rounded-md" />
          </div>
        </div>

        {/* Action Button Placeholder */}
        <div className="h-10 w-44 bg-slate-900/40 border border-white/5 rounded-xl" />
      </div>

      {/* Pathway Timeline Title */}
      <div className="mb-6">
        <div className="h-6 w-56 bg-slate-800/80 rounded-md mb-2" />
        <div className="h-4 w-80 bg-slate-800/40 rounded-md" />
      </div>

      {/* Bracket Rounds Timeline Skeleton */}
      <div className="relative border-l border-white/5 pl-6 ml-4 space-y-8 py-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="relative">
            {/* Timeline Connector Dot */}
            <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-slate-800 border-2 border-slate-950" />
            
            {/* Round Card */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-5 space-y-4 max-w-2xl">
              {/* Round Title & Date */}
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                <div className="h-5 w-28 bg-slate-800/80 rounded" />
                <div className="h-4 w-20 bg-slate-800/40 rounded" />
              </div>
              
              {/* Opponent Bracket Slot Details */}
              <div className="space-y-2">
                <div className="h-4 w-40 bg-slate-800/60 rounded" />
                <div className="h-4.5 w-full bg-slate-800/30 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
