"use client";

import type { GroupWithStandings } from "@/types";
import { TeamRow } from "./TeamRow";

interface Props {
  group: GroupWithStandings;
}

export function GroupTable({ group }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm shadow-sm hover:border-white/10 hover:bg-slate-900/50 transition-all duration-300">
      {/* Table Header Accent */}
      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-sky-500" />
      
      {/* Title */}
      <div className="bg-slate-950/60 border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
        <span className="font-extrabold uppercase text-slate-100 tracking-wider text-sm">
          {group.name}
        </span>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
          STAGE 1
        </span>
      </div>

      {/* Standings Table */}
      <table className="w-full border-collapse text-slate-300">
        <thead>
          <tr className="text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-white/[0.04] bg-slate-950/20">
            <th className="text-left px-4 py-2.5">Team</th>
            <th className="px-2 py-2.5 w-10 text-center">P</th>
            <th className="px-2 py-2.5 w-10 text-center hidden sm:table-cell">W</th>
            <th className="px-2 py-2.5 w-10 text-center hidden sm:table-cell">D</th>
            <th className="px-2 py-2.5 w-10 text-center hidden sm:table-cell">L</th>
            <th className="px-2 py-2.5 w-12 text-center">GD</th>
            <th className="px-2 py-2.5 w-12 text-center text-amber-500/80">Pts</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {group.teams.map((team, index) => (
            <TeamRow
              key={team.id}
              team={team}
              position={index + 1}
            />
          ))}
        </tbody>
      </table>

      {/* Legend Footer Hint */}
      <div className="border-t border-white/[0.02] bg-slate-950/10 px-4 py-2 flex items-center gap-4 text-[10px] text-slate-500 font-medium">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500/80" />
          <span>Qualify</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500/80" />
          <span>Best 3rd Place</span>
        </div>
      </div>
    </div>
  );
}
