"use client";

import { CalendarDays, Layers, Star } from "lucide-react";

interface Props {
  stage: string;
  onStageChange: (v: string) => void;
  team: string;
  onTeamChange: (v: string) => void;
  teams: { id: string; name: string }[];
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (v: boolean) => void;
}

const STAGES = [
  { value: "", label: "All Stages" },
  { value: "GROUP", label: "Group Stage" },
  { value: "ROUND_OF_32", label: "Round of 32" },
  { value: "ROUND_OF_16", label: "Round of 16" },
  { value: "QUARTER_FINAL", label: "Quarter-Finals" },
  { value: "SEMI_FINAL", label: "Semi-Finals" },
  { value: "THIRD_PLACE", label: "Third Place Match" },
  { value: "FINAL", label: "Final" },
];

export function FixtureFilters({
  stage,
  onStageChange,
  team,
  onTeamChange,
  teams,
  favoritesOnly,
  onFavoritesOnlyChange,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center justify-between mb-8 p-4 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm">
      {/* Left side: Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full md:w-auto items-center">
        {/* Filter By Stage */}
        <div className="flex flex-col w-full sm:w-auto gap-2">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3 w-3" /> Filter By Stage
          </label>
          <div className="relative">
            <select
              value={stage}
              onChange={(e) => onStageChange(e.target.value)}
              className="w-full sm:w-48 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all cursor-pointer appearance-none"
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value} className="bg-slate-950 text-white text-xs">
                  {s.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter By Team */}
        <div className="flex flex-col w-full sm:w-auto gap-2">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" /> Filter By Team
          </label>
          <div className="relative">
            <select
              value={team}
              onChange={(e) => onTeamChange(e.target.value)}
              className="w-full sm:w-48 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all cursor-pointer appearance-none"
            >
              <option value="" className="bg-slate-950 text-white text-xs">All Teams</option>
              {/* Safe fallback in case teams is initially undefined */}
              {(teams || []).map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-950 text-white text-xs">
                  {t.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Starred Teams Only Toggle */}
        <div className="flex flex-col w-full sm:w-auto gap-2">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Star className="h-3 w-3 text-amber-400" /> Starred Teams
          </label>
          <button
            onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300 ${
              favoritesOnly
                ? "bg-amber-400 border-amber-400 text-slate-950 shadow-[0_2px_10px_rgba(251,191,36,0.3)] font-bold scale-[1.02]"
                : "bg-slate-950/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${favoritesOnly ? "fill-slate-950" : ""}`} />
            My Teams Only
          </button>
        </div>
      </div>
    </div>
  );
}
