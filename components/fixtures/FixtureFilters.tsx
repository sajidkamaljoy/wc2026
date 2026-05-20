"use client";

import { CalendarDays, ShieldAlert, ArrowUpDown, Layers } from "lucide-react";

interface Props {
  sort: "date" | "team";
  onSortChange: (v: "date" | "team") => void;
  stage: string;
  onStageChange: (v: string) => void;
  team: string;
  onTeamChange: (v: string) => void;
  teams: { id: string; name: string }[];
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
  sort,
  onSortChange,
  stage,
  onStageChange,
  team,
  onTeamChange,
  teams,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center justify-between mb-8 p-4 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm">
      {/* Left side: Sorting & Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full md:w-auto items-center">
        {/* Sorting buttons */}
        <div className="flex flex-col w-full sm:w-auto gap-2">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="h-3 w-3" /> Sort Matches By
          </label>
          <div className="flex rounded-xl overflow-hidden border border-white/10 p-0.5 bg-slate-950/60 max-w-fit">
            {(["date", "team"] as const).map((v) => {
              const isActive = sort === v;
              return (
                <button
                  key={v}
                  onClick={() => onSortChange(v)}
                  className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 capitalize cursor-pointer ${
                    isActive
                      ? "bg-amber-400 text-slate-950 shadow-[0_2px_8px_rgba(251,191,36,0.35)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {v === "date" ? "Kickoff Date" : "Team Name"}
                </button>
              );
            })}
          </div>
        </div>

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
      </div>
    </div>
  );
}
