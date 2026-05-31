"use client";

interface Props {
  percentage: number;
}

export function BracketProgressBar({ percentage }: Props) {
  const rounded = Math.round(percentage);

  // Transition colors based on progress
  let barColorClass = "bg-gradient-to-r from-amber-500 to-amber-400";
  if (rounded === 100) {
    barColorClass = "bg-gradient-to-r from-emerald-500 to-emerald-400";
  } else if (rounded > 50) {
    barColorClass = "bg-gradient-to-r from-amber-500 to-yellow-400";
  }

  return (
    <div className="w-full flex flex-col gap-2 bg-slate-950/40 p-4 rounded-xl border border-white/5 shadow-inner">
      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
        <span>Completion Progress</span>
        <span className={rounded === 100 ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
          {rounded}%
        </span>
      </div>

      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full ${barColorClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
