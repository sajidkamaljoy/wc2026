import type { Player, PositionType } from "@/types";
import { User, Calendar, Award } from "lucide-react";

interface Props {
  player: Player;
}

const POSITION_COLORS: Record<PositionType, { bg: string; text: string; border: string }> = {
  GK: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  DEF: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  MID: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  FWD: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
};

export function PlayerCard({ player }: Props) {
  const { name, position, shirtNumber, club, age, isPlaceholder } = player;
  const colors = POSITION_COLORS[position];

  if (isPlaceholder) {
    return (
      <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between p-4 gap-3 rounded-2xl border border-slate-800/40 bg-slate-900/10 opacity-30 select-none">
        <div className="flex items-center gap-3 min-[420px]:gap-4 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-800/40 flex items-center justify-center border border-slate-700/20 text-slate-500 font-bold text-sm shrink-0">
            –
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-semibold text-slate-400 tracking-wide italic truncate">Player TBD</span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium truncate">
              <Award className="h-3 w-3 shrink-0" /> Unannounced Club
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end min-[420px]:self-auto shrink-0">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-800/20 text-slate-500 border border-slate-700/10">
            {position}
          </span>
          <span className="text-xs text-slate-600 flex items-center gap-1 font-semibold">
            <Calendar className="h-3.5 w-3.5 shrink-0" /> – yrs
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between p-4 gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/60 hover:border-slate-700/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.05)]">
      <div className="flex items-center gap-3 min-[420px]:gap-4 min-w-0">
        {/* Shirt Number */}
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} flex items-center justify-center border font-bold text-sm text-slate-200 transition-transform group-hover:scale-105 shrink-0`}>
          {shirtNumber ?? "–"}
        </div>
        
        {/* Player Name and Club */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors duration-200 tracking-wide truncate">
            {name}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium truncate">
            <Award className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-500/60 transition-colors shrink-0" />
            {club ?? "Unknown Club"}
          </span>
        </div>
      </div>

      {/* Position and Age */}
      <div className="flex items-center gap-3.5 self-end min-[420px]:self-auto shrink-0">
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border} shrink-0`}>
          {position}
        </span>
        {age && (
          <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold shrink-0">
            <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            {age} yrs
          </span>
        )}
      </div>
    </div>
  );
}
